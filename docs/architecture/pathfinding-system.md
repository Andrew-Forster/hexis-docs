# Pathfinding & Navigation Architecture

> **Document Version**: 1.0  
> **Created**: 2026-01-13  
> **Status**: Architecture Review & Redesign Proposal

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Architecture](#current-architecture)
3. [Identified Issues](#identified-issues)
4. [Proposed Navigation API](#proposed-navigation-api)
5. [Implementation Plan](#implementation-plan)

---

## Executive Summary

This document analyzes the Hexis pathfinding system and proposes a unified navigation architecture. The system currently suffers from **movement model fragmentation** - multiple pathfinding implementations with different movement logic that don't agree on reachability.

### Key Problems Identified

1. **Dijkstra/A* Movement Model Mismatch**: `DijkstraMultiTarget` uses a simplified movement model (18 moves, 1-block step up/down only) while `AStarPathFinder` uses a sophisticated model (jumps, multi-block drops, terrain analysis). This causes targets to be selected as "reachable" but be impossible to actually path to.

2. **Waypoint Obstacle Clipping**: Path compression sometimes creates line segments that pass through obstacles (azalea bushes, misaligned stairs) because the compression algorithm checks corridor clearance but may miss edge cases.

3. **Missing Entity Pursuit Navigation**: No unified API for "approach until within range" scenarios common in combat scripts.

---

## Current Architecture

### Navigation Components

```
┌─────────────────────────────────────────────────────────────────┐
│                     LUA SCRIPT LAYER                            │
├─────────────────────────────────────────────────────────────────┤
│  hexis.navigate.to()           → NavigateCommand                │
│  hexis.navigate.start_async()  → PathfinderModule               │
│  hexis.mining.find_nearest_reachable() → DijkstraMultiTarget    │
│  hexis.combat.hunt()           → HuntCommand → EntityPursuer    │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     JAVA PATHFINDING LAYER                      │
├─────────────────────────────────────────────────────────────────┤
│  PathPipeline (orchestrates full computation)                   │
│    ├── AStarPathFinder (core A* with full movement model)       │
│    ├── SparseWaypointGenerator (5-15 key waypoints)             │
│    ├── WaypointPathValidator (collision checking)               │
│    └── PathWidener (obstacle avoidance margins)                 │
│                                                                 │
│  DijkstraMultiTarget (multi-target selection)                   │
│    └── ReachPlanner (mining vantage point analysis)             │
│                                                                 │
│  EntityPursuer (mob following with dynamic repathing)           │
└─────────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────────┐
│                     PATH EXECUTION LAYER                        │
├─────────────────────────────────────────────────────────────────┤
│  PathfinderModule (state machine)                               │
│    ├── SimplePathFollower (waypoint-to-waypoint movement)       │
│    ├── SegmentExecutor (jump/drop execution)                    │
│    └── StuckDetector (recovery and rerouting)                   │
└─────────────────────────────────────────────────────────────────┘
```

### Movement Models Comparison

| Component | Step Up | Step Down | Multi-Jump | Multi-Drop | Terrain Cost | Diagonal Check |
|-----------|---------|-----------|------------|------------|--------------|----------------|
| **AStarPathFinder** | 1 block | 1 block | 2-3 blocks (Jump Boost) | 2-10 blocks | Yes (200+ lines) | Yes (all corners) |
| **DijkstraMultiTarget** | 1 block | 1 block | ❌ NO | ❌ NO | Basic only | Basic only |
| **findPathQuick** | 1 block | 1 block | ❌ NO | ❌ NO | Basic only | Basic only |

**This table shows the root cause**: DijkstraMultiTarget thinks positions are reachable that AStarPathFinder cannot actually path to.

---

## Identified Issues

### Issue 1: Movement Model Fragmentation (CRITICAL)

**Location**: `DijkstraMultiTarget.expandNode()` vs `AStarPathFinder.expandNode()`

**Symptom**: Script selects a tree on an elevated ledge. Player walks toward it, gets stuck at the base because:
1. Dijkstra found a path using 1-block step-ups
2. Those step-up positions don't exist (cliff face, no stairs)
3. AStarPathFinder can't find a path (needs multi-block jump not available)
4. Player walks partial path, gets stuck

**Root Cause**:
```java
// DijkstraMultiTarget.expandNode() - SIMPLIFIED
int[][] moves = {
    {1, 0, 0}, {-1, 0, 0}, {0, 0, 1}, {0, 0, -1},  // Cardinal
    {1, 1, 0}, {-1, 1, 0}, {0, 1, 1}, {0, 1, -1},  // Step up (1 BLOCK ONLY!)
    // NO multi-block jumps, NO multi-block drops!
};

// AStarPathFinder.expandNode() - FULL MODEL
tryMove(current, 1, 0, 0);
tryVerticalDrop(current, dropHeight);  // 2-10 block drops
tryJump(current, 0, 2, 0);             // 2 block jump (Jump Boost I)
tryJump(current, 0, 3, 0);             // 3 block jump (Jump Boost II+)
```

### Issue 2: Waypoint Obstacle Clipping (MEDIUM)

**Location**: `AStarPathFinder.compressPath()` and `WaypointPathValidator`

**Symptom**: Path goes through azalea bushes, misaligned staircases, or other partial-block obstacles.

**Root Cause**: 
1. `compressPath()` uses `isCorridorClear()` which samples block positions
2. But azalea bushes have weird hitboxes and `canWalkThrough()` may return true
3. Stairs facing the wrong way are also problematic - they have collision boxes that differ based on direction

**Evidence in WaypointPathValidator**:
```java
// Line 177-180 - Special handling for leaves needed
if (world.getBlockState(feetPos).getBlock() instanceof net.minecraft.block.LeavesBlock ||
    world.getBlockState(headPos).getBlock() instanceof net.minecraft.block.LeavesBlock) {
    return false; // BLOCKED: Leaves detected
}
```
But NO similar check for `AzaleaBlock`, `FloweringAzaleaBlock`, or directional stairs.

### Issue 3: Missing Entity Approach API (MEDIUM)

**Location**: `EntityPursuer.java` exists but is not exposed to Lua scripts directly

**Symptom**: Combat scripts (like `sven_slayer.lua`) must manually implement pursuit logic:
```lua
-- sven_slayer.lua lines 162-188
local function navigate_with_retry(pos, max_attempts, retry_wait_seconds)
    for attempt = 1, max_attempts do
        local result = hexis.navigate.to(pos)
        -- Manual retry logic...
    end
end
```

**Root Cause**: No Lua API for "approach entity until within range X" that handles:
- Dynamic repathing as entity moves
- Attack range validation
- Line-of-sight checking
- Fallback to direct movement

---

## Proposed Navigation API

Based on the use cases, we need **three core navigation primitives**:

### 1. `hexis.navigate.to()` - Single Target Navigation

**Use Case**: Navigate to a known coordinate.

```lua
-- Go to exact coordinates
hexis.navigate.to({x = 100, y = 64, z = 200, distance = 2.0})

-- Go to a named waypoint
hexis.navigate.to("spawn_point")
```

**Implementation**: `AStarPathFinder` (unchanged)

### 2. `hexis.navigate.to_nearest()` - Multi-Target Navigation (NEW)

**Use Case**: Find and navigate to the nearest REACHABLE target from a set.

```lua
-- Mining: Find nearest reachable tree
local result = hexis.navigate.to_nearest({
    targets = tree_positions,     -- Array of {x, y, z}
    distance = 2.5,               -- Stop within this distance
    max_time_ms = 1000,           -- Search budget
    validate_path = true          -- NEW: Verify A* can actually path there
})

if result.success then
    -- result.target is the chosen target
    -- result.standing_pos is where we'll stand to mine
    -- Navigation has already started
end
```

**Implementation**: 
1. Use `DijkstraMultiTarget` to find candidates
2. **NEW**: Before accepting, run `AStarPathFinder.findPathQuick()` to validate
3. If validation fails, continue searching
4. Start navigation to validated target

### 3. `hexis.navigate.to_entity()` - Entity Pursuit Navigation (NEW)

**Use Case**: Navigate to a mobile entity until within attack range.

```lua
-- Combat: Approach a mob
local result = hexis.navigate.to_entity({
    entity = mob,                 -- Entity reference
    attack_range = 3.0,           -- Stop when within this range
    require_los = true,           -- Require line of sight
    timeout = 10.0,               -- Give up after X seconds
    repath_interval = 0.5         -- How often to recalculate as mob moves
})

-- Returns immediately, navigation runs async
-- Use hexis.navigate.is_pursuing() to check status
```

**Implementation**: Expose `EntityPursuer` via Lua API

---

## Implementation Plan

### Phase 1: Fix Movement Model Mismatch (CRITICAL)

**Goal**: Make `DijkstraMultiTarget` use the same movement logic as `AStarPathFinder`.

**Approach A - Shared Movement Expander** (Recommended):
1. Create `MovementExpander` class with all movement logic
2. Both `AStarPathFinder` and `DijkstraMultiTarget` use this shared class
3. Ensures they always agree on reachability

```java
public class MovementExpander {
    // Shared movement expansion used by ALL pathfinders
    public static List<Movement> expandMoves(World world, BlockPos from, PathfinderConfig config) {
        List<Movement> moves = new ArrayList<>();
        // Cardinal, diagonal, step up/down
        tryCardinal(world, from, moves);
        tryDiagonal(world, from, moves);  
        tryStepUp(world, from, moves);
        tryStepDown(world, from, moves);
        // Multi-block moves (from A*)
        tryMultiBlockDrops(world, from, moves, config);
        tryMultiBlockJumps(world, from, moves, config);
        return moves;
    }
}
```

**Approach B - Validation Layer** (Faster to implement):
1. After `DijkstraMultiTarget` finds a standing position
2. Run `AStarPathFinder.findPathQuick()` to validate it's reachable
3. If not, continue searching for next target

```java
// In MiningLib.findNearestReachable():
DijkstraMultiTarget.Result result = dijkstra.findNearestReachable();
if (result.success) {
    // NEW: Validate with A*
    List<Vec3d> validationPath = astar.findPathQuick(
        playerPos, 
        Vec3d.of(result.standingPosition),
        5000, 200 // Quick check
    );
    if (validationPath == null || validationPath.isEmpty()) {
        // This position is not actually reachable - continue search
        dijkstra.markUnreachable(result.standingPosition);
        result = dijkstra.findNearestReachable(); // Try again
    }
}
```

**Recommendation**: Start with Approach B (validation layer) for quick fix, then refactor to Approach A for clean architecture.

### Phase 2: Fix Waypoint Obstacle Clipping (MEDIUM)

**Goal**: Better detection of partial-block obstacles.

1. Add explicit block type checking in `SparseWaypointGenerator.isWaypointPositionValid()`:
```java
// Reject azalea bushes, flowers, and other partial-block obstacles
Block block = world.getBlockState(feetPos).getBlock();
if (block instanceof AzaleaBlock || 
    block instanceof FloweringAzaleaBlock ||
    block instanceof FlowerBlock ||
    block instanceof TallFlowerBlock) {
    return false;
}
```

2. Improve stair direction checking in `MovementHelper.canWalkThrough()`:
```java
// Check stair facing direction relative to movement direction
if (block instanceof StairsBlock) {
    // Stairs facing INTO movement direction are obstacles
    // Stairs facing WITH movement direction are passable
}
```

### Phase 3: Add Entity Pursuit API (MEDIUM)

**Goal**: Expose `EntityPursuer` functionality to Lua.

1. Add to `NavigationLib`:
```java
set("to_entity", new OneArgFunction() {
    @Override
    public LuaValue call(LuaValue args) {
        // Parse entity reference and options
        Entity entity = parseEntityArg(args.get("entity"));
        double attackRange = args.get("attack_range").optdouble(3.0);
        // ...
        
        // Start pursuit
        EntityPursuer pursuer = new EntityPursuer();
        pursuer.setTarget(entity, attackRange);
        
        // Store pursuer reference for status checks
        return LuaValue.TRUE;
    }
});

set("is_pursuing", new ZeroArgFunction() {
    @Override
    public LuaValue call() {
        return LuaValue.valueOf(pursuer != null && pursuer.isPursuing());
    }
});
```

---

## Appendix: Current Lua Navigation API

| Function | Purpose | Status |
|----------|---------|--------|
| `hexis.navigate.to(pos)` | Navigate to coordinates | ✅ Working |
| `hexis.navigate.start_async(pos)` | Non-blocking navigation | ✅ Working |
| `hexis.navigate.stop()` | Stop navigation | ✅ Working |
| `hexis.navigate.is_navigating()` | Check if navigating | ✅ Working |
| `hexis.navigate.arrived()` | Check if arrived | ✅ Working |
| `hexis.mining.find_nearest_reachable()` | Multi-target selection | ⚠️ Broken (movement mismatch) |
| `hexis.combat.hunt()` | Entity pursuit | ⚠️ High-level only |
| `hexis.navigate.to_entity()` | Direct entity pursuit | ❌ Missing |
| `hexis.navigate.to_nearest()` | Navigate to nearest from set | ❌ Missing |

---

## Summary

The pathfinding system is fundamentally sound but suffers from **movement model fragmentation**. The fix is to unify the movement expansion logic so all pathfinding components agree on what's reachable.

**Priority Order**:
1. 🔴 **CRITICAL**: Fix DijkstraMultiTarget movement model mismatch
2. 🟡 **MEDIUM**: Add obstacle block type checking for azaleas
3. 🟢 **NICE-TO-HAVE**: Add `hexis.navigate.to_entity()` API

---

*Document maintained by Hexis Development Team*

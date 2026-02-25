---
sidebar_position: 13
title: Mining
description: Block breaking with smooth aiming
---

# Mining API

Namespace: `hexis.mining`

Block breaking with smooth aiming and smart target selection.

:::info Not sure which function to use?
See [Choosing the Right Function](/guides/choosing-functions) for a decision tree comparing mining, navigation, and interaction APIs. The Mining API is **only for breaking blocks** — for walking to locations, use the [Navigation API](/api/navigation).
:::

:::info Recommended Functions
`mine_block()` and `mine_nearest()` are the recommended high-level entry points. Lower-level primitives (`start_mining_async`, `aim_tick`) are deprecated but remain available for custom control flows.
:::

---

## Basic Mining

### `hexis.mining.break_block(options)`

Breaks a block at specified position.

**Blocking:** Yes (waits until block breaks)

```lua
hexis.mining.break_block({
    x = 100, y = 65, z = 200,
    aim_speed = 2.5,      -- Aim speed multiplier
    highlight = true      -- Show targeting highlight
})
```

### `hexis.mining.is_breakable(x, y, z)`

Returns `true` if block is breakable (not air, not bedrock).

```lua
if hexis.mining.is_breakable(100, 65, 200) then
    hexis.mining.break_block({x = 100, y = 65, z = 200})
end
```

### `hexis.mining.has_line_of_sight(x, y, z)`

Returns `true` if player has line of sight to block.

```lua
if hexis.mining.has_line_of_sight(100, 65, 200) then
    hexis.log.info("Can see the block!")
end
```

### `hexis.mining.is_block_obstructed(x, y, z)`

Checks if an entity is blocking access to a block position. Returns `false` if clear, or a table with entity info if obstructed.

```lua
local obstruction = hexis.mining.is_block_obstructed(100, 65, 200)
if obstruction then
    hexis.log.warn("Block obstructed by " .. obstruction.name
        .. " at distance " .. obstruction.distance)
    -- obstruction = {id, name, type, x, y, z, distance}
else
    hexis.mining.mine_block({x = 100, y = 65, z = 200})
end
```

### `hexis.mining.get_distance(x, y, z)`

Returns the Euclidean distance from the player to a block center.

```lua
local dist = hexis.mining.get_distance(100, 65, 200)
if dist < 4.5 then
    hexis.log.info("Block is in reach!")
end
```

### `hexis.mining.stop()`

Stops current blocking mining operation.

```lua
hexis.mining.stop()
```

---

## Single-Block Mining

### `hexis.mining.mine_block(options)`

The recommended high-level function for mining a single block. Handles the full pipeline: find vantage point, navigate there, aim, and mine. Supports concurrent navigation+mining for overhead blocks.

**Blocking:** Yes (returns when block is mined or fails)

```lua
local result = hexis.mining.mine_block({
    x = 100, y = 70, z = 200,
    aim_speed = 2.5,          -- Aim speed multiplier (default 2.5, max 3.0)
    timeout = 3.0,            -- Per-block timeout in seconds (default 8.0)
    allow_jump = true,        -- Allow jump-mining for overhead blocks (default false)
    navigate = true,          -- Navigate to vantage point if needed (default true)
    concurrent = true,        -- Mine while walking (default false, see below)
    search_radius = 5,        -- Vantage point search radius (default 5)
    max_nav_distance = 20.0   -- Max direct distance to vantage point (default 20.0)
})

if result.success then
    hexis.log.info("Block mined!")
else
    hexis.log.warn("Failed: " .. result.reason)
    -- result.reason: "air", "unreachable", "timeout", "nav_failed", "stopped"
end
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x`, `y`, `z` | int | required | Block position |
| `aim_speed` | float | 2.5 | Camera aim speed (capped at 3.0) |
| `timeout` | float | 8.0 | Seconds before giving up on mining |
| `allow_jump` | bool | false | Jump while mining overhead blocks (requires Jump Boost) |
| `navigate` | bool | true | Auto-navigate to a vantage point |
| `concurrent` | bool | false | Lock camera to block, walk via WASD-only pathfinding |
| `search_radius` | int | 5 | How far to search for vantage points |
| `max_nav_distance` | float | 20.0 | Skip navigation if vantage is farther than this |

**Concurrent Mode:**

When `concurrent = true`, the camera locks to the mining target at a higher priority than navigation. The pathfinder automatically enters WASD-only mode (no camera rotation) and walks to the vantage point while the player is already mining. This is ideal for overhead blocks where you can hit the block while walking underneath it.

```lua
-- Typical usage for trees with overhead blocks
local result = hexis.mining.mine_block({
    x = block.x, y = block.y, z = block.z,
    aim_speed = 2.5,
    timeout = 3.0,
    allow_jump = true,
    navigate = true,
    concurrent = true  -- Mine overhead blocks while walking to them
})
```

**Return Values:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | bool | Whether the block was mined |
| `reason` | string | `"success"`, `"air"`, `"unreachable"`, `"timeout"`, `"nav_failed"`, `"stopped"` |

---

## Multi-Target Navigation + Mining

### `hexis.mining.mine_nearest(options)`

Finds the nearest reachable **minable block** from a list of targets using **Multi-Target A*** and navigates to a vantage point where the player can mine it. Combines pathfinding, vantage point validation, and navigation into one call.

:::danger Not for general navigation
`mine_nearest` is **only for minable blocks**. Every target position must be an actual block that can be broken. If you need to walk to a location (NPC, warp pad, emissary), use [`navigate.near()`](/api/navigation#hexisnavigatenearoptions) or [`navigate.start_async()`](/api/navigation#hexisnavigatestart_asyncoptions) instead. See [Choosing the Right Function](/guides/choosing-functions) for a full comparison.
:::

**Blocking:** Configurable (blocking by default, async with `async = true`)

```lua
local result = hexis.mining.mine_nearest({
    targets = tree_positions,    -- Array of {x, y, z} positions
    max_nodes = 50000,           -- Max A* search nodes (default 50000)
    max_time_ms = 2000,          -- Max search time in ms (default 2000)
    goal_tolerance = 2.5,        -- How close to get (default 2.5)
    distance = 1.0,              -- Navigation arrival distance (default 1.0)
    allow_jump_mine = false,     -- Include jump-mine vantage points (default false)
    async = false                -- Return immediately after starting nav (default false)
})

if result.success then
    local target = result.target
    hexis.log.info("Found block at " .. target.x .. ", " .. target.y .. ", " .. target.z)
    -- Mine it with mine_block
    hexis.mining.mine_block({x = target.x, y = target.y, z = target.z})
end
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `targets` | table | required | Array of `{x, y, z}` block positions |
| `max_nodes` | int | 50000 | Maximum A* nodes to explore |
| `max_time_ms` | int | 2000 | Maximum pathfinding time |
| `goal_tolerance` | float | 2.5 | Distance tolerance for reaching target |
| `distance` | float | 1.0 | How close navigation should get |
| `allow_jump_mine` | bool | false | Consider jump-mine vantage points |
| `async` | bool | false | If true, starts navigation and returns immediately |

**Return Values:**

| Field | Type | Description |
|-------|------|-------------|
| `success` | bool | Whether a reachable target was found |
| `target` | table | `{x, y, z}` of the chosen block |
| `standing_pos` | table | `{x, y, z}` where to stand for mining |
| `needs_jump` | bool | Whether mining requires jumping |
| `jump_mine` | bool | Whether jump-mining is feasible (needs Jump Boost) |
| `aim_point` | table | `{x, y, z}` precise aim coordinates |
| `path_cost` | float | Navigation path cost |
| `nodes_examined` | int | A* nodes examined |
| `compute_time_ms` | int | Pathfinding computation time |
| `has_jump_boost` | bool | Whether player has Jump Boost effect |
| `failure_reason` | string | Why it failed (if `success = false`) |

**Async Mode:**

With `async = true`, the function starts navigation and returns immediately. Your script manages the navigation wait loop, which allows for interrupts (e.g., competition events).

```lua
local result = hexis.mining.mine_nearest({
    targets = targets,
    async = true
})

if result.success and hexis.navigate.is_navigating() then
    while hexis.script.is_running() and hexis.navigate.is_navigating() do
        -- Check for interrupts, competition events, etc.
        hexis.wait(0.1)
    end
    -- Arrived — mine the tree
    hexis.mining.mine_block({x = result.target.x, y = result.target.y, z = result.target.z})
end
```

---

## Mining Loop

### `hexis.mining.start_loop(options)`

Starts an async mining loop that continuously finds and breaks blocks from a route.

**Non-blocking:** Yes (runs in background)

```lua
hexis.mining.start_loop({
    id = "foraging_loop",        -- Unique identifier for pause/resume
    max_distance = 50,           -- Maximum block search distance (default 50)
    aim_speed = 2.5,             -- Aim speed multiplier (default 2.5)
    approach_distance = 2.0,     -- Distance to navigate to (default 2.0)
    use_zones = true,            -- Respect zone isolation (default true)
    chain_mining = true,         -- Enable chain mining (default false)
    chain_limit = 5,             -- Max blocks to chain mine (default 5)
    block_cooldown = 5,          -- Seconds before re-mining same block (default 5)
    mining_timeout = 5           -- Seconds before error if block not broken (default 5)
})
```

### `hexis.mining.stop_loop()`

Stops the active async mining loop.

```lua
hexis.mining.stop_loop()
```

### `hexis.mining.is_loop_active()`

Returns `true` if a mining loop is currently running.

```lua
if hexis.mining.is_loop_active() then
    hexis.log.info("Mining in progress...")
end
```

### `hexis.mining.get_blocks_mined()`

Returns the number of blocks mined in the current loop session.

```lua
local count = hexis.mining.get_blocks_mined()
hexis.hud.set_var("blocks", count)
```

---

## Chain Mining

When `chain_mining = true`, the system automatically detects and mines adjacent blocks of the same type. This is useful for:
- **Trees**: Mines all connected logs (up to `chain_limit`)
- **Ore veins**: Mines connected ore blocks

```lua
-- Mine trees with chain mining enabled
hexis.mining.start_loop({
    id = "tree_farming",
    chain_mining = true,
    chain_limit = 10  -- Max 10 logs per tree
})
```

---

## Mining Sessions

When mining multiple blocks in sequence, use sessions to keep the attack key held between blocks. This prevents camera stutter and makes transitions smoother.

### `hexis.mining.start_session()`

Begin a multi-block mining session. Subsequent `mine_block()` calls reuse the aim and interaction controllers.

### `hexis.mining.end_session()`

End the session. Releases attack key, camera control, and all mining state.

```lua
-- Smooth multi-block mining
hexis.mining.start_session()

for _, block in ipairs(tree_logs) do
    if not hexis.script.is_running() then break end
    hexis.mining.mine_block({
        x = block.x, y = block.y, z = block.z,
        timeout = 4.0
    })
end

hexis.mining.end_session()
```

### `hexis.mining.set_session_jump(enabled)`

Hold jump continuously during a mining session. Useful for underwater mining or jump-reach sequences.

```lua
hexis.mining.start_session()
hexis.mining.set_session_jump(true)  -- Hold jump across all mine_block calls

for _, block in ipairs(underwater_ores) do
    hexis.mining.mine_block({
        x = block.x, y = block.y, z = block.z,
        allow_jump = true
    })
end

hexis.mining.set_session_jump(false)
hexis.mining.end_session()
```

### `hexis.mining.is_session_jump_active()`

Returns `true` if session jump is currently enabled.

---

## Non-Blocking Mining (Advanced)

:::warning Deprecated
These primitives are deprecated. Use `mine_block()` with sessions for most use cases. Only use these if you need frame-by-frame control over the mining loop.
:::

### `hexis.mining.start_mining_async(options)`

Starts mining a block. **NON-BLOCKING** - returns immediately. You must call `aim_tick()` every frame.

```lua
hexis.mining.start_mining_async({x = 100, y = 65, z = 200, aim_speed = 2.5})

while not hexis.world.is_block_air(100, 65, 200) do
    hexis.mining.aim_tick()
    hexis.wait(0.05)
end

hexis.mining.stop_mining_async()
```

### `hexis.mining.aim_tick()`

Performs one frame of smooth aiming toward the async mining target. Returns `true` if aimed and hitting the target block.

### `hexis.mining.stop_mining_async()`

Stops non-blocking mining. Releases attack button and camera control.

### `hexis.mining.is_mining_async()`

Returns `true` if async mining is currently active.

---

## Smart Target Selection

:::info Recommended API

`select_target_smart` is the recommended function for ore/block mining scripts. It provides human-like target selection with cluster awareness.

:::

### `hexis.mining.select_target_smart(options)`

Smart mining target selection with cluster awareness and adjacency scoring. Prioritizes blocks adjacent to the last mined position, making mining behavior more human-like.

```lua
local result = hexis.mining.select_target_smart({
    candidates = ore_positions,    -- Array of {x, y, z} positions
    last_mined = last_mined_pos,   -- Position of last mined block (for adjacency)
    cluster_radius = 4,            -- Blocks within this radius = same cluster
    prefer_coverage = true,        -- Prefer positions reaching multiple targets
    max_nodes = 30000,             -- Optional: max A* search nodes
    max_time_ms = 1000             -- Optional: max search time in ms
})

if result.success then
    -- result.target = {x, y, z}               - The block to mine
    -- result.standing_pos = {x, y, z}         - Where to stand (nil if immediate)
    -- result.path = {{x,y,z}, ...}            - Navigation path (nil if immediate)
    -- result.aim_point = {x, y, z}            - Precise aim coordinates
    -- result.needs_jump = true/false          - Whether mining requires jumping
    -- result.path_cost = number               - Navigation path cost
    -- result.score = number                   - Selection score (higher = better)
    -- result.immediately_reachable = boolean  - True if no navigation needed
    -- result.compute_time_ms = number         - How long selection took

    if result.immediately_reachable then
        hexis.log.info("Can mine immediately!")
    else
        hexis.log.info("Need to walk to standing position first")
    end
else
    hexis.log.warn("No reachable target: " .. result.failure_reason)
end
```

**Scoring Formula:**
- Adjacent to last mined (distance 1): +500 points
- Very close (distance 2): +300 points
- Same cluster (distance 3-4): +150 points
- Nearby (distance 5-6): +50 points
- Current cluster membership: +200 points
- Reach ease: 0-100 points based on angle/distance
- No jump required: +50 points
- Multi-target coverage: +30 points per additional reachable target

### `hexis.mining.find_immediate_target(options)`

Fast check for immediately reachable targets from current position. Skips pathfinding entirely.

```lua
local result = hexis.mining.find_immediate_target({
    candidates = ore_positions,
    last_mined = last_mined_pos  -- Optional: for adjacency scoring
})

if result then
    -- result.target = {x, y, z}
    -- result.needs_jump = true/false
    -- result.aim_point = {x, y, z}
    -- result.score = number
    -- result.immediately_reachable = true (always)
end
```

---

## Vantage Points

Vantage points are positions from which a block can be mined. These functions help find optimal mining positions.

### `hexis.mining.check_current_reach(pos)`

Quick check if you can reach a block from your current position.

```lua
local vp = hexis.mining.check_current_reach({x = 100, y = 65, z = 200})

if vp then
    -- vp.reachable = true
    -- vp.needs_jump = true/false
    -- vp.score = number (0-1, higher = better)
    -- vp.distance = number
    -- vp.aim_point = {x, y, z}
    -- vp.obstacle = {x, y, z} or nil
end
```

### `hexis.mining.find_vantage_points(options)`

Find positions from which a block can be mined.

```lua
local vantage_points = hexis.mining.find_vantage_points({
    x = 100, y = 65, z = 200,
    search_radius = 4  -- Optional: default 4
})

for _, vp in ipairs(vantage_points) do
    -- vp.x, vp.y, vp.z = standing position
    -- vp.needs_jump = true/false
    -- vp.score = quality score
    -- vp.distance = distance to target
    -- vp.aim_point = {x, y, z}
end
```

### `hexis.mining.find_ground_vantage_points(options)`

Find ground-level positions for mining overhead blocks. Only returns positions at or below player Y that can jump-reach the target.

```lua
local ground_vps = hexis.mining.find_ground_vantage_points({
    x = 100, y = 70, z = 200,  -- Block above player
    search_radius = 5
})
```

### `hexis.mining.is_block_reachable(pos)`

Quick check if a block can be reached from anywhere nearby.

```lua
if hexis.mining.is_block_reachable({x = 100, y = 65, z = 200}) then
    hexis.log.info("Block is reachable!")
end
```

---

## Smart Aim Points

### `hexis.mining.get_smart_aim_point(pos)`

Get the best visible point on a block for mining. May return off-center coordinates when the center is obstructed.

```lua
local aim = hexis.mining.get_smart_aim_point({x = 100, y = 65, z = 200})
-- aim may be off-center: {x = 100.9, y = 65.5, z = 200.5}
```

### `hexis.mining.get_all_aim_points(pos)`

Get all visible aim points on a block for retry logic.

```lua
local points = hexis.mining.get_all_aim_points({x = 100, y = 65, z = 200})
for _, point in ipairs(points) do
    hexis.log.debug("Aim option: " .. point.x .. ", " .. point.y .. ", " .. point.z)
end
```

### `hexis.mining.start_mining_smart(pos)`

Start async mining with smart aim point selection.

```lua
hexis.mining.start_mining_smart({
    x = 100, y = 65, z = 200,
    aim_speed = 2.5
})
```

### `hexis.mining.recalculate_aim(pos)`

Re-run aim point calculation from current eye position. Useful when player has moved.

```lua
local result = hexis.mining.recalculate_aim({x = 100, y = 65, z = 200})
if result.success then
    -- result.aim_point = {x, y, z}
    -- result.distance = number
end
```

---

## Crosshair Validation

### `hexis.mining.get_crosshair_target()`

Get the block the crosshair is currently targeting.

```lua
local target = hexis.mining.get_crosshair_target()
if target then
    -- target.x, target.y, target.z
    -- target.side = "up", "down", "north", "south", "east", "west"
end
```

### `hexis.mining.is_targeting_block(x, y, z)`

Check if crosshair is targeting a specific block.

```lua
if hexis.mining.is_targeting_block(100, 65, 200) then
    hexis.log.info("Aiming at the right block!")
end
```

---

## Background Precomputation

Compute the next mining target in the background while mining the current block.

### `hexis.mining.precompute_next_target(options)`

Starts background computation of the next target.

```lua
hexis.mining.precompute_next_target({
    current = {x = 100, y = 65, z = 200},  -- Block currently being mined
    candidates = remaining_ores            -- Array of {x, y, z} positions
})
```

### `hexis.mining.get_precomputed_target()`

Get and clear the precomputed target. Returns `nil` if not ready.

```lua
local precomputed = hexis.mining.get_precomputed_target()
if precomputed then
    -- Same format as select_target_smart result
end
```

### `hexis.mining.peek_precomputed_target()`

Peek at precomputed target without clearing it. Useful for visual highlighting.

### `hexis.mining.is_precomputing()`

Returns `true` if background precomputation is running.

### `hexis.mining.cancel_precomputation()`

Cancel any ongoing precomputation.

---

## Example: Ore Mining Script

```lua
local last_mined_pos = nil
local blocks_mined = 0

function hexis.main()
    while hexis.running() do
        -- Scan for ores
        local ores = hexis.world.scan_blocks({
            match_patterns = {"diamond_ore", "deepslate_diamond_ore"},
            radius = 20
        })

        if #ores == 0 then
            hexis.log.info("No ores found, waiting...")
            hexis.wait(1.0)
        else
            -- Use smart target selection
            local result = hexis.mining.select_target_smart({
                candidates = ores,
                last_mined = last_mined_pos,
                cluster_radius = 4
            })

            if result.success then
                -- mine_block handles navigation + aiming + mining
                local mine_result = hexis.mining.mine_block({
                    x = result.target.x,
                    y = result.target.y,
                    z = result.target.z,
                    timeout = 5.0
                })

                if mine_result.success then
                    last_mined_pos = result.target
                    blocks_mined = blocks_mined + 1
                    hexis.hud.set_var("mined", blocks_mined)
                else
                    hexis.log.debug("Skipped: " .. mine_result.reason)
                end
            end
        end

        hexis.wait(0.1)
    end
end
```

:::tip
For mining many blocks in a row, wrap the loop in `start_session()` / `end_session()` for smoother transitions. See [Mining Sessions](#mining-sessions) above.
:::

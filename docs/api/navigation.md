---
sidebar_position: 4
title: Navigation
description: A* pathfinding and movement
---

# Navigation API

Namespace: `hexis.navigate`

:::warning Target Coordinates
Navigation targets must be **air blocks where the player can stand**, not solid blocks. The Y coordinate should be the position of the player's feet (the air block above the ground).

When using the `distance` parameter (for approaching solid blocks like trees), the system automatically adds +1 to the Y coordinate, assuming you provided the solid block position.
:::

---

## Basic Navigation

### `hexis.navigate.to(target)`

Navigates to a location using A* pathfinding.

**Blocking:** Yes (waits until arrival or failure)

**Returns:** `true` if navigation started successfully, `false` if path is impossible

```lua
-- Navigate by coordinates (player standing position)
hexis.navigate.to({x = 100, y = 65, z = 200})

-- Navigate by location name (from routes/markers)
hexis.navigate.to("pillar_1")

-- Navigate near a solid block (like a tree trunk)
-- Y+1 is automatically added when distance > 0
hexis.navigate.to({
    x = block.x,
    y = block.y,  -- Solid block Y, system adds +1 automatically
    z = block.z,
    distance = 3  -- Stop 3 blocks away from target
})

-- With all options
hexis.navigate.to({
    x = 100, y = 64, z = 200,
    distance = 3,         -- Stop this many blocks from target (default: 0.5)
    timeout = 30000,      -- Max 30 seconds
    exact = true,         -- Stop exactly at target (overrides distance)
    allow_drops = true    -- Allow dropping down ledges (default: true)
})
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x, y, z` | number | Required | Target coordinates |
| `distance` | number | 0.5 | How close to get (for approaching solid blocks, use 2-4) |
| `timeout` | number | 60000 | Maximum navigation time (ms) |
| `exact` | boolean | false | Stop exactly at target block center |
| `allow_drops` | boolean | true | Allow pathfinding through drops/ledges |

---

## Etherwarp

### `hexis.navigate.etherwarp(target)`

Teleports using etherwarp ability (requires Aspect of the End).

```lua
hexis.navigate.etherwarp({x = 100, y = 64, z = 200})
hexis.navigate.etherwarp("saved_location")
```

### `hexis.navigate.smart_etherwarp(options)`

Smart etherwarp with line-of-sight detection.

```lua
hexis.navigate.smart_etherwarp({
    target = "pillar_1",
    distance = 48,        -- Max etherwarp distance
    timeout = 5000        -- Max wait for LOS
})
```

---

## Navigation Control

### `hexis.navigate.drop()`

Drops down from current position (disable flight, freefall).

```lua
hexis.navigate.drop()
```

### `hexis.navigate.arrived()`

Returns `true` if navigation is complete.

```lua
hexis.navigate.to({x = 100, y = 64, z = 200})
while not hexis.navigate.arrived() do
    hexis.sleep(100)
end
hexis.log.info("Arrived!")
```

### `hexis.navigate.is_navigating()`

Returns `true` if currently navigating.

```lua
if hexis.navigate.is_navigating() then
    hexis.log.info("Still moving...")
end
```

### `hexis.navigate.stop()`

Stops current navigation.

```lua
hexis.navigate.stop()
```

---

## Location Checks

### `hexis.navigate.check_location(target)`

Checks if the player is at a location.

```lua
if hexis.navigate.check_location("pillar_1") then
    hexis.log.info("At pillar_1")
end

if hexis.navigate.check_location({x = 100, y = 65, z = 200}) then
    hexis.log.info("At coords")
end
```

### `hexis.navigate.look_at(target)`

Looks at a target position or named location.

```lua
hexis.navigate.look_at({x = 100, y = 65, z = 200})
hexis.navigate.look_at("pillar_1")
```

---

## Debug Tools

### `hexis.navigate.debug_heatmap(opts)`

Renders a pathfinding heatmap for debugging navigation issues.

```lua
hexis.navigate.debug_heatmap({
    radius = 20,
    height = 5
})
```

### `hexis.navigate.debug_heatmap_analysis(opts)`

Performs analysis on the pathfinding heatmap data.

```lua
hexis.navigate.debug_heatmap_analysis({
    radius = 20,
    height = 5
})
```

---

## Multi-Target Mining Navigation

:::tip When to use Multi-Target A*
Use `hexis.mining.mine_nearest()` when you have **multiple possible targets** (e.g., trees, ores, crops) and want the pathfinder to find the **closest reachable one by actual path cost** — not just Euclidean distance. This is significantly more efficient than sorting targets by distance and trying them one at a time with `hexis.navigate.to()`.
:::

### `hexis.mining.mine_nearest(options)`

Finds the nearest reachable block from a list using **Multi-Target A*** with a min-distance heuristic, then navigates to a standing position where the player can interact with it.

**Default: BLOCKING** — waits until navigation completes. Pass `async = true` to return immediately after starting navigation.

```lua
-- Basic blocking usage
local result = hexis.mining.mine_nearest({
    targets = trees,     -- Array of {x, y, z} positions
    distance = 1.0       -- How close to get to standing position
})

if result.success then
    hexis.log.info("Ready to mine at " .. result.target.x)

    if result.jump_mine then
        hexis.player.jump()
        hexis.wait(0.3)
    end

    hexis.mining.start_mining_async({
        x = result.aim_point.x,
        y = result.aim_point.y,
        z = result.aim_point.z
    })
end

-- Async mode — starts nav, returns immediately for scripts that need
-- to do work during navigation (e.g., opportunistic mining)
local result = hexis.mining.mine_nearest({
    targets = block_list,
    distance = 1.5,
    max_nodes = 200000,
    max_time_ms = 2000,
    allow_jump_mine = true,
    async = true
})

if result.success then
    -- Navigation already started — manage wait loop yourself
    while hexis.navigate.is_navigating() do
        -- do opportunistic stuff...
        hexis.wait(0.1)
    end
end
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `targets` | array | Required | Array of `{x, y, z}` block positions to search |
| `distance` | number | 1.0 | How close to navigate to the standing position |
| `max_nodes` | number | 50000 | Maximum A* nodes to expand |
| `max_time_ms` | number | 2000 | Maximum search time in milliseconds |
| `goal_tolerance` | number | 2.5 | Distance tolerance for reaching goal |
| `allow_jump_mine` | boolean | false | If true AND player has Jump Boost, sets `jump_mine = true` for overhead blocks |
| `async` | boolean | false | If true, starts navigation and returns immediately instead of blocking |

**Returns:** table with:

| Field | Type | Description |
|-------|------|-------------|
| `success` | boolean | Whether a target was found and navigation completed (or started, if async) |
| `target` | table | `{x, y, z}` of the block found |
| `standing_pos` | table | `{x, y, z}` where the player navigated to (or is navigating to) |
| `needs_jump` | boolean | Whether the block is overhead (requires jumping to reach) |
| `jump_mine` | boolean | `true` only if `needs_jump` AND `allow_jump_mine` AND player has Jump Boost |
| `has_jump_boost` | boolean | Whether player currently has Jump Boost effect |
| `aim_point` | table | `{x, y, z}` optimal point to aim at for mining |
| `path_cost` | number | A* path cost to the target |
| `nodes_examined` | number | Number of A* nodes examined |
| `compute_time_ms` | number | Search computation time |
| `failure_reason` | string | Reason for failure (only if `success` is false) |

:::warning Deprecated aliases
`hexis.navigate.to_nearest_block()` and `hexis.navigate.find_nearest_target()` have been **removed**. Use `hexis.mining.mine_nearest()` instead. The old `hexis.mining.find_nearest_reachable()` still works as a backward-compatible alias.
:::

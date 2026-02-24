---
sidebar_position: 4
title: Navigation
description: A* pathfinding and movement
---

# Navigation API

Namespace: `hexis.navigate`

:::info Not sure which function to use?
See [Choosing the Right Function](/guides/choosing-functions) for a decision tree and side-by-side comparison of all navigation and mining functions.
:::

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

## Approach Navigation

### `hexis.navigate.near(options)`

Navigates to a valid standing position **near** a solid block. Uses GoalApproach which finds positions with line-of-sight and exposed faces. Ideal for approaching TNT blocks, chests, or other interactable solid blocks where you need to stand nearby rather than on top.

**Blocking:** No (use `is_navigating()` to poll)

**Returns:** `true` if navigation started, `false` if target has no exposed faces or path failed

```lua
-- Approach a TNT block
local started = hexis.navigate.near({
    x = -464, y = 119, z = -81,
    range = 4.0
})

if started then
    while hexis.navigate.is_navigating() do
        hexis.wait(0.1)
    end
    hexis.log.info("Arrived near block!")
end

-- With custom min range (stay between 2 and 5 blocks away)
hexis.navigate.near({
    x = chest.x, y = chest.y, z = chest.z,
    range = 5.0,
    min_range = 2.0
})
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x, y, z` | number | required | Target solid block coordinates |
| `range` | number | `4.0` | Maximum approach distance |
| `min_range` | number | `1.0` | Minimum approach distance |

:::tip navigate.near() vs navigate.to() with distance
Use `navigate.near()` for solid blocks (TNT, chests, interactables) — it validates exposed faces and line-of-sight. Use `navigate.to()` with `distance` for navigating near air positions where the player could stand.
:::

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

## Async Navigation

### `hexis.navigate.start_async(options)`

Starts A* pathfinding and returns immediately. The script controls the wait loop, which allows for interrupts (competition events, danger detection, etc.).

**Blocking:** No (returns after path computation)

**Returns:** `true` if pathfinding started, `false` if no path found

```lua
-- Basic async navigation
local started = hexis.navigate.start_async({
    x = 100.5, y = 65, z = 200.5,
    distance = 2.0
})

if started then
    while hexis.navigate.is_navigating() do
        if not hexis.script.is_running() then break end
        -- Can do other things here (check events, update HUD, etc.)
        hexis.wait(0.05)
    end
end
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x, y, z` | number | required | Target coordinates |
| `distance` | number | 2.0 | Goal tolerance radius |
| `max_nodes` | int | -1 | Max A* nodes (-1 = use config default) |
| `max_time` | number | -1 | Max compute time in seconds |
| `reach_target` | table | nil | `{x, y, z}` block for mining-aware navigation (enables LOS-based early arrival) |

**With reach_target (mining-aware navigation):**

When `reach_target` is set, the pathfinder uses `GoalApproach.forBlockMining` and enables early arrival when the player has line-of-sight to the target block. This is what `mine_nearest()` uses internally.

```lua
hexis.navigate.start_async({
    x = vantage.x, y = vantage.y, z = vantage.z,
    distance = 1.5,
    reach_target = {x = ore.x, y = ore.y, z = ore.z}
})
```

:::tip When to use start_async vs to vs near
- **`start_async()`** — When you need to do things during navigation (check events, update HUD, handle interrupts). Most production scripts use this.
- **`to()`** — Simple blocking navigation where you just want to wait until arrival.
- **`near()`** — Approaching solid blocks that need line-of-sight validation (chests, TNT, NPC areas).

See [Choosing the Right Function](/guides/choosing-functions#navigateto-vs-navigatenear-vs-navigatestart_async) for a detailed comparison.
:::

---

## Water Navigation

### `hexis.navigate.swim_to(options)`

Underwater A* pathfinding using native Rust swim pathfinder.

**Blocking:** No (starts swim following, returns immediately)

**Returns:** `true` if path found and swim following started

```lua
local ok = hexis.navigate.swim_to({
    x = 100, y = 30, z = 200,
    max_nodes = 35000,
    heuristic_weight = 1.2
})

if ok then
    while hexis.navigate.is_swim_navigating() do
        hexis.wait(0.05)
    end
end
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x, y, z` | number | required | Target coordinates |
| `max_nodes` | int | 35000 | Max A* nodes |
| `heuristic_weight` | float | 1.2 | A* heuristic weight |

### `hexis.navigate.is_swim_navigating()`

Returns `true` if currently swim-navigating.

### `hexis.navigate.is_in_water()`

Returns `true` if player is in water.

### `hexis.navigate.is_swimming()`

Returns `true` if player is in swim mode.

### `hexis.navigate.is_underwater(pos)`

Returns `true` if position (or player, if no args) is underwater.

### `hexis.navigate.get_water_surface_y(x, z)`

Returns the Y level of the water surface at the given coordinates, or -1 if no water.

---

## Blacklist Management

### `hexis.navigate.blacklist(pos)`

Mark a position as unreachable. The pathfinder will avoid it.

```lua
hexis.navigate.blacklist({x = 100, y = 65, z = 200})
```

### `hexis.navigate.is_blacklisted(pos)`

Returns `true` if the position is blacklisted.

### `hexis.navigate.clear_blacklist(pos)`

Clear a specific position from the blacklist, or clear the entire blacklist if no args.

```lua
hexis.navigate.clear_blacklist({x = 100, y = 65, z = 200})  -- Clear one
hexis.navigate.clear_blacklist()  -- Clear all
```

### `hexis.navigate.get_blacklist_count()`

Returns the number of blacklisted positions.

---

## Camera Lock

Lock the camera on a target while the pathfinder uses WASD-only movement. Useful for mining while walking.

### `hexis.navigate.set_camera_lock(target, hard_lock)`

```lua
-- Soft lock (blends with path direction)
hexis.navigate.set_camera_lock({x = 100, y = 70, z = 200})

-- Hard lock (strict aim at target)
hexis.navigate.set_camera_lock({x = 100, y = 70, z = 200}, true)
```

### `hexis.navigate.clear_camera_lock()`

Release camera lock and return to normal navigation.

### `hexis.navigate.has_camera_lock()`

Returns `true` if camera lock is active.

### `hexis.navigate.find_ground_position(options)`

Find a valid standing position near a target. Returns the position closest to the target (not the player).

```lua
local pos = hexis.navigate.find_ground_position({
    x = tree.x, y = tree.y, z = tree.z,
    search_radius = 5
})

if pos then
    hexis.navigate.start_async({x = pos.x, y = pos.y, z = pos.z})
end
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
    hexis.wait(0.1)
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

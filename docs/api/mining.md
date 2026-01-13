---
sidebar_position: 13
title: Mining
description: Block breaking with smooth aiming
---

# Mining API

Namespace: `hexis.mining`

Block breaking with smooth aiming.

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

### `hexis.mining.stop()`

Stops current blocking mining operation.

```lua
hexis.mining.stop()
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

## Non-Blocking Mining (Advanced)

These primitives allow you to control mining while doing other things (like jumping).

### `hexis.mining.start_mining_async(options)`

Starts mining a block. **NON-BLOCKING** - returns immediately.

```lua
hexis.mining.start_mining_async({x = 100, y = 65, z = 200, aim_speed = 2.5})

-- Your custom loop
while not hexis.world.is_block_air(100, 65, 200) do
    hexis.mining.aim_tick()  -- Update aim each frame
    if hexis.player.is_on_ground then
        hexis.actions.jump()  -- Jump while mining!
    end
    hexis.sleep(50)
end

hexis.mining.stop_mining_async()
```

### `hexis.mining.aim_tick()`

Performs one frame of smooth aiming toward the async mining target.

### `hexis.mining.stop_mining_async()`

Stops non-blocking mining. Releases attack button.

### `hexis.mining.is_mining_async()`

Returns `true` if async mining is currently active.

---

## Multi-Target Pathfinding

### `hexis.mining.find_nearest_reachable(options)`

Finds the nearest reachable block from a list of targets using **Multi-Target A*** algorithm.

```lua
local result = hexis.mining.find_nearest_reachable({
    targets = trees,           -- Array of {x, y, z} positions
    max_nodes = 50000,         -- Optional: max search nodes (default 50000)
    max_time_ms = 2000,        -- Optional: max search time (default 2000ms)
    goal_tolerance = 2.5       -- Optional: how close to get (default 2.5)
})

if result.success then
    hexis.log.info("Found tree at " .. result.target.x .. ", " .. result.target.z)
    -- result.target = {x, y, z}           - The block to mine
    -- result.standing_pos = {x, y, z}     - Where to stand to mine it
    -- result.path = {{x,y,z}, ...}        - Path from player to standing position
    -- result.needs_jump = true/false      - Whether mining requires jumping
    -- result.aim_point = {x, y, z}        - Where to aim to mine the block
else
    hexis.log.warn("No reachable tree: " .. result.failure_reason)
end
```

---

## Smart Aim Points

### `hexis.mining.get_smart_aim_point(pos)`

Get the best visible point on a block for mining.

```lua
local aim = hexis.mining.get_smart_aim_point({x = 100, y = 65, z = 200})
-- aim may be off-center: {x = 100.9, y = 65.5, z = 200.5}
```

### `hexis.mining.start_mining_smart(pos)`

Start async mining with smart aim point selection.

```lua
hexis.mining.start_mining_smart({
    x = 100, y = 65, z = 200,
    aim_speed = 2.5
})
```

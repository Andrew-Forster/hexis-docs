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

### `hexis.navigate.mark_position()`

Marks the current player position (used by some conditions/utilities).

```lua
hexis.navigate.mark_position()
```

### `hexis.navigate.look_at(target)`

Looks at a target position or named location.

```lua
hexis.navigate.look_at({x = 100, y = 65, z = 200})
hexis.navigate.look_at("pillar_1")
```

---

## Multi-Target Navigation

### `hexis.navigate.to_nearest_block(options)`

Combines finding the nearest reachable block with automatic navigation. **BLOCKING** - waits until navigation completes.

```lua
local result = hexis.navigate.to_nearest_block({
    targets = trees,     -- Array of {x, y, z} positions
    distance = 1.0       -- How close to get to standing position
})

if result.success then
    -- Now at standing position, ready to mine result.target
    hexis.log.info("Ready to mine at " .. result.target.x)

    if result.needs_jump then
        hexis.actions.jump()
    end

    -- Start mining with the computed aim point
    hexis.mining.start_mining_async({
        x = result.aim_point.x,
        y = result.aim_point.y,
        z = result.aim_point.z
    })
end
```

### `hexis.navigate.find_nearest_target(options)`

Same as `hexis.mining.find_nearest_reachable()` but in the navigate namespace. Does NOT navigate.

---
sidebar_position: 2
title: Player API
description: Player information, position, and actions
---

# Player API

Namespace: `hexis.player`

---

## Properties (Read-Only)

Access via `hexis.player.<property>`:

| Property | Type | Description |
|----------|------|-------------|
| `health` | number | Current health |
| `health_percent` | number | Health as percentage (0-100) |
| `max_health` | number | Maximum health |
| `hunger` | number | Hunger level (0-20) |
| `x` | number | X coordinate |
| `y` | number | Y coordinate |
| `z` | number | Z coordinate |
| `position` | table | `{x, y, z}` table |
| `yaw` | number | Horizontal rotation (degrees) |
| `pitch` | number | Vertical rotation (degrees) |
| `is_sneaking` | boolean | Currently sneaking |
| `is_sprinting` | boolean | Currently sprinting |
| `is_flying` | boolean | Currently flying |
| `is_on_ground` | boolean | Standing on solid ground |
| `name` | string | Player username |

```lua
local hp = hexis.player.health
local pos = hexis.player.position
hexis.log.info("Position: " .. pos.x .. ", " .. pos.y .. ", " .. pos.z)
```

---

## Query Methods

### `hexis.player.get_nearest()`

Returns name of nearest player, or nil if none.

```lua
local nearest = hexis.player.get_nearest()
if nearest then
    hexis.log.info("Nearest player: " .. nearest)
end
```

### `hexis.player.horizontal_distance(location)`

Returns horizontal distance (ignoring Y) to location.

```lua
local dist = hexis.player.horizontal_distance({x = 100, z = 200})
if dist < 10 then
    hexis.log.info("Close to target!")
end
```

### `hexis.player.can_reach_block(pos)`

Returns `true` if the block at the given position is within mining range (~4.5 blocks) and has clear line of sight.

```lua
if hexis.player.can_reach_block({x = 100, y = 65, z = 200}) then
    hexis.log.info("Can mine this block!")
    hexis.mining.break_block({x = 100, y = 65, z = 200})
end
```

### `hexis.player.distance_to(pos)`

Returns 3D euclidean distance from player to position.

```lua
local dist = hexis.player.distance_to({x = 100, y = 65, z = 200})
hexis.log.info("Distance: " .. dist)
```

### `hexis.player.get_jump_boost_level()`

Returns the player's current Jump Boost level (0-5). Returns 0 if no jump boost.

```lua
local level = hexis.player.get_jump_boost_level()
if level > 0 then
    hexis.log.info("Jump Boost " .. level .. " active!")
end
```

---

## Action Methods

### `hexis.player.jump()`

Makes player jump if on ground.

```lua
hexis.player.jump()
hexis.sleep(500)
```

### `hexis.player.equip(opts)`

Equips an item from hotbar matching a pattern.

```lua
hexis.player.equip({pattern = "scythe"})
hexis.player.equip({name = "Juju Shortbow"})

-- Multiple fallbacks (tries in order)
hexis.player.equip({pattern = "scythe|sword"})
```

### `hexis.player.sneak(opts)`

Sneaks with configurable count and delay.

```lua
hexis.player.sneak({duration = 1000})  -- Sneak for 1 second
hexis.player.sneak({count = 3})        -- Sneak 3 times
```

### `hexis.player.look_at(opts)`

Looks at a target location with smooth or instant aiming.

```lua
-- Smooth aim (for human-like movement)
hexis.player.look_at({x = 100, y = 65, z = 200, speed = 2.0})

-- Instant aim (for fast reactions)
hexis.player.look_at({x = 100, y = 65, z = 200, instant = true})
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x, y, z` | number | Required | Target coordinates |
| `speed` | number | 3.0 | Aim speed multiplier |
| `instant` | boolean | false | Skip smooth interpolation, snap directly |

### `hexis.player.use_item()`

Uses (right-clicks) the held item.

```lua
hexis.player.use_item()
```

### `hexis.player.interact_block(pos, opts)`

Right-clicks a specific block at the given position.

```lua
hexis.player.interact_block({x = 100, y = 65, z = 200})
```

### `hexis.player.drop_item()`

Drops the currently held item.

```lua
hexis.player.drop_item()
```

### `hexis.player.interact_entity(opts)`

Clicks on (interacts with) an entity.

```lua
hexis.player.interact_entity({name = "Villager"})
```

### `hexis.player.sprint(opts)`

Toggles sprint on or off.

```lua
hexis.player.sprint({enabled = true})   -- Start sprinting
hexis.player.sprint({enabled = false})  -- Stop sprinting
```

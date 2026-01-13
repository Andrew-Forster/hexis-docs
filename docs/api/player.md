---
sidebar_position: 2
title: Player API
description: Player information, position, and hotbar access
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
| `held_item` | string | Name of held item (or nil) |
| `held_slot` | number | Current hotbar slot (0-8) |
| `name` | string | Player username |

```lua
local hp = hexis.player.health
local pos = hexis.player.position
hexis.log.info("Position: " .. pos.x .. ", " .. pos.y .. ", " .. pos.z)
```

---

## Methods

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

### `hexis.player.hotbar_contains(pattern)`

Returns `true` if any hotbar slot contains item matching pattern.

- Pattern is case-insensitive
- Supports partial matching
- Supports regex if pattern contains `|` or starts with `^`

```lua
if hexis.player.hotbar_contains("scythe") then
    hexis.log.info("Has a scythe!")
end

-- Regex pattern
if hexis.player.hotbar_contains("juju|terminator") then
    hexis.log.info("Has a bow!")
end
```

### `hexis.player.find_hotbar_slot(pattern)`

Returns slot index (0-8) of first item matching pattern, or -1 if not found.

```lua
local slot = hexis.player.find_hotbar_slot("aspect")
if slot >= 0 then
    hexis.log.info("Aspect of the End in slot " .. slot)
end
```

### `hexis.player.get_hotbar_items()`

Returns table of all hotbar item names (1-indexed, Lua style).

```lua
local items = hexis.player.get_hotbar_items()
for i, name in ipairs(items) do
    if name then
        hexis.log.info("Slot " .. i .. ": " .. name)
    end
end
```

### `hexis.player.jump()`

Makes player jump if on ground.

```lua
hexis.player.jump()
hexis.sleep(500)
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

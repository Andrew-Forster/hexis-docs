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

### `hexis.player.get_effect(name)`

Returns information about an active potion effect, or `nil` if not active.

Supports: `jump_boost`, `speed`, `haste`, `strength`, `regeneration`, `resistance`, `fire_resistance`, `water_breathing`, `invisibility`, `night_vision`, `slow_falling`, `absorption`, `saturation`, `slowness`, `mining_fatigue`, `nausea`, `blindness`, `hunger`, `weakness`, `poison`, `wither`, `health_boost`, `glowing`, `levitation`, `luck`

```lua
local jb = hexis.player.get_effect("jump_boost")
if jb then
    hexis.log.info("Jump Boost " .. jb.level .. " (" .. string.format("%.1f", jb.duration) .. "s)")
end

local haste = hexis.player.get_effect("haste")
if haste and haste.level >= 2 then
    hexis.log.info("Haste II+ active!")
end
```

| Field | Type | Description |
|-------|------|-------------|
| `active` | boolean | Always `true` when returned |
| `level` | number | Effect level (1 = I, 2 = II, etc.) |
| `amplifier` | number | Raw amplifier (level - 1) |
| `duration` | number | Remaining duration in seconds |
| `ambient` | boolean | `true` if from a beacon |

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

Smoothly rotates the camera toward a target location. Uses physics-based spring-damper movement for human-like aim.

:::warning Blocking Call
`look_at` is a **blocking call** — it does not return until the camera has settled within ~1° of the target (up to a 3-second timeout). **Do not call it in a tight loop.** Each invocation resets camera velocity, so calling it repeatedly prevents the camera from ever building speed, resulting in sluggish movement.
:::

**Correct pattern** — call once, then act:
```lua
-- Look at the target (blocks until settled)
hexis.player.look_at({x = 100, y = 65, z = 200})
-- Now act
hexis.player.use_item()
```

**Wrong pattern** — do NOT do this:
```lua
-- BAD: Calling look_at in a loop kills camera velocity each time
while true do
    hexis.player.look_at({x = target.x, y = target.y, z = target.z})
    hexis.player.use_item()
    hexis.wait(0.05)
end
```

```lua
-- Smooth aim (default, recommended)
hexis.player.look_at({x = 100, y = 65, z = 200})

-- Slower aim
hexis.player.look_at({x = 100, y = 65, z = 200, speed = 1.0})

-- Instant aim (rate-limited for safety, not truly instant)
hexis.player.look_at({x = 100, y = 65, z = 200, instant = true})
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x, y, z` | number | Required | Target coordinates |
| `speed` | number | 3.0 | Aim speed (1.0 = gentle, 3.0 = fast, 5.0 = aggressive) |
| `instant` | boolean | false | Skip smooth interpolation (still rate-limited) |
| `target` | string | - | Named target: `"nearest_entity"`, `"nearest_player"`, `"marked_position"` |

### `hexis.player.left_click()`

Performs a single left-click (attack). Uses direct client input simulation for proper hit detection.

```lua
-- Attack the entity you're looking at
hexis.player.look_at({x = 100, y = 65, z = 200, instant = true})
hexis.player.left_click()
```

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

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
hexis.wait(0.5)
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

Smoothly rotates the camera toward a target. Supports two modes:

#### Static Mode (coordinates / string targets)

Blocks until the camera settles within ~1° of the target (up to 3-second timeout). Uses physics-based spring-damper movement for human-like aim.

:::warning Blocking Call (Static Mode)
Static `look_at` is a **blocking call**. **Do not call it in a tight loop.** Each invocation resets camera velocity, so calling it repeatedly prevents the camera from ever building speed.
:::

```lua
-- Smooth aim at coordinates (blocks until settled)
hexis.player.look_at({x = 100, y = 65, z = 200})
hexis.player.use_item()

-- Named targets
hexis.player.look_at("nearest_entity")
hexis.player.look_at("nearest_player")
hexis.player.look_at("marked_position")

-- Speed control
hexis.player.look_at({x = 100, y = 65, z = 200, speed = 1.0})  -- Slow
hexis.player.look_at({x = 100, y = 65, z = 200, instant = true})  -- Rate-limited snap
```

#### Entity Tracking Mode (entity tables)

When passed an entity table (from `get_nearby_entities()`), enters **persistent tracking mode** — the camera follows the entity per-frame via a render callback. Blocks briefly until initially aimed (~3°), then returns while the camera **continues tracking**.

```lua
-- Get entity table with id field
local mobs = hexis.world.get_nearby_entities(10, {type = "tadpole"})
if #mobs > 0 then
    -- Camera tracks the entity per-frame (smooth, no stuttering)
    hexis.player.look_at(mobs[1])

    -- Act while camera is still tracking
    hexis.player.use_item()
    hexis.wait(0.3)
    hexis.player.use_item()  -- Camera still following entity
end
```

**Entity tracking behavior:**
- Camera keeps following the entity **after `look_at` returns**
- Tracking stops automatically when: entity dies/despawns, script ends, or a new `look_at` is called
- Calling `look_at(new_entity)` seamlessly switches to the new entity
- Calling `look_at({x, y, z})` stops entity tracking and does a static aim

:::tip Entity Tables
Any table with an `id` field triggers entity tracking mode. Tables from `hexis.world.get_nearby_entities()` and `hexis.combat.find_target()` both work.
:::

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x, y, z` | number | — | Target coordinates (static mode) |
| `speed` | number | 3.0 | Aim speed (1.0 = gentle, 3.0 = fast, 5.0 = aggressive) |
| `instant` | boolean | false | Skip smooth interpolation (still rate-limited, static only) |
| `target` | string | — | Named target: `"nearest_entity"`, `"nearest_player"`, `"marked_position"` |
| `id` | number | — | Entity ID (entity tracking mode — typically from entity table) |

### `hexis.player.left_click()`

Performs a single left-click (attack). Uses direct client input simulation for proper hit detection.

```lua
-- Attack the entity you're looking at
hexis.player.look_at({x = 100, y = 65, z = 200, instant = true})
hexis.player.left_click()
```

### `hexis.player.attack()`

Performs a single attack (left-click press + release). Simulates key input with a short hold time for reliable hit registration.

```lua
-- Break the block/entity you're looking at
hexis.player.attack()
```

### `hexis.player.swing_hand()`

Plays the hand swing animation without performing an attack. Visual only.

```lua
hexis.player.swing_hand()
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

---

## Camera Rotation

### `hexis.player.set_rotation(yaw, pitch, opts)`

Smoothly rotates the camera to the target angles. **Blocking** — returns when the camera settles within ~2° of the target (up to 3-second timeout).

```lua
-- Look north at a slight downward angle
hexis.player.set_rotation(180, 30)

-- Custom rotation speed
hexis.player.set_rotation(0, 80, {speed = 5.0})
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `yaw` | number | Required | Horizontal angle (-180 to 180) |
| `pitch` | number | Required | Vertical angle (-90 to 90) |
| `speed` | number | 3.0 | Rotation speed (1.0 = slow, 5.0 = fast) |

### `hexis.player.lock_rotation(yaw, pitch, opts)`

Locks the camera to specific angles continuously. **Non-blocking** — returns immediately while the camera stays locked. The lock persists until `unlock_rotation()` is called or the script ends.

```lua
-- Lock camera looking down at crops for farming
hexis.player.lock_rotation(0, 80, {speed = 3.0})

-- ... farming loop runs while camera stays locked ...

hexis.player.unlock_rotation()
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `yaw` | number | Required | Horizontal angle (-180 to 180) |
| `pitch` | number | Required | Vertical angle (-90 to 90) |
| `speed` | number | 3.0 | Rotation speed (1.0 = slow, 5.0 = fast) |

### `hexis.player.unlock_rotation()`

Releases the camera rotation lock, returning camera control to the player.

```lua
hexis.player.unlock_rotation()
```

### `hexis.player.is_rotation_locked()`

Returns `true` if the camera is currently locked by `lock_rotation()`.

```lua
if hexis.player.is_rotation_locked() then
    hexis.log.info("Camera is locked")
end
```

---

## Raycasting

### `hexis.player.raycast(distance)`

Casts a ray from the player's eye position in the look direction. Returns block hit info or `nil`.

```lua
local hit = hexis.player.raycast(4.5)
if hit then
    hexis.log.info("Looking at: " .. hit.block_name .. " at " .. hit.x .. "," .. hit.y .. "," .. hit.z)
end
```

| Return Field | Type | Description |
|-------------|------|-------------|
| `block_name` | string | Block registry name (e.g., `"wheat"`) |
| `x, y, z` | number | Block position |
| `side` | string | Hit face: `"up"`, `"down"`, `"north"`, `"south"`, `"east"`, `"west"` |
| `distance` | number | Distance from player eye to hit point |

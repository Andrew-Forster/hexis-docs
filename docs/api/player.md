---
sidebar_position: 2
title: Player API
description: Player information, position, and actions
---

# Player API

Namespace: `hexis.player`

:::tip Related APIs
- For **walking to places**, see the [Navigation API](/api/navigation) — don't use player actions for pathfinding
- For **finding entities**, see [`hexis.world.get_nearby_entities()`](/api/world) in the World API
- For **combat**, see the [Combat API](/api/combat)
:::

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

### `hexis.player.jump(opts)`

Makes player jump. Supports one-shot and continuous hold modes.

```lua
-- Single jump
hexis.player.jump()

-- Hold jump continuously (for climbing, swimming up)
hexis.player.jump({hold = true})

-- Release jump
hexis.player.jump({hold = false})
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

Sneaks with configurable modes: toggle, hold, counted, or timed.

```lua
-- Hold sneak indefinitely
hexis.player.sneak({hold = true})

-- Release sneak
hexis.player.sneak({hold = false})

-- Timed hold (sneak for 1.5 seconds, then release)
hexis.player.sneak({hold = true, duration = 1.5})

-- Counted toggles (e.g., spam sneak 3 times with 0.3s gap)
hexis.player.sneak({count = 3, delay = 0.3})
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `hold` | boolean | nil | `true` to hold, `false` to release |
| `duration` | number | nil | Hold duration in seconds (with `hold = true`) |
| `count` | number | nil | Number of sneak toggles |
| `delay` | number | `0.3` | Delay between toggles in seconds |

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

### `hexis.player.attack(opts)`

Performs a left-click attack. Supports one-shot and continuous hold modes.

```lua
-- Single attack
hexis.player.attack()

-- Hold attack continuously
hexis.player.attack({hold = true})

-- Release held attack
hexis.player.attack({hold = false})
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `hold` | boolean | nil | `true` to hold, `false` to release. Omit for one-shot. |

### `hexis.player.swing_hand()`

Plays the hand swing animation without performing an attack. Visual only.

```lua
hexis.player.swing_hand()
```

### `hexis.player.use_item(opts)`

Uses (right-clicks) the held item. Supports one-shot and continuous hold modes.

```lua
-- Single use
hexis.player.use_item()

-- Hold continuously (for bows, fishing rods, etc.)
hexis.player.use_item({hold = true})

-- Release
hexis.player.use_item({hold = false})
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

:::warning Deprecated
`set_rotation()`, `lock_rotation()`, and `unlock_rotation()` are **deprecated**. Use `look_at()` with yaw/pitch parameters instead:

```lua
-- Old: hexis.player.set_rotation(180, 30)
hexis.player.look_at({yaw = 180, pitch = 30})

-- Old: hexis.player.lock_rotation(0, 80)
hexis.player.look_at({yaw = 0, pitch = 80, hold = true})

-- Old: hexis.player.unlock_rotation()
hexis.player.look_at(nil)
```
:::

### `hexis.player.is_rotation_locked()`

Returns `true` if the camera is currently locked (via `look_at({hold = true})` or legacy `lock_rotation`).

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

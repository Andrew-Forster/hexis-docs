---
sidebar_position: 5
title: Combat
description: Automated combat, targeting, and pursuit
---

# Combat API

Namespace: `hexis.combat`

Automated combat with entity targeting, pursuit AI, and manual combat primitives.

:::info Choosing an Approach
- **`start()`** — Background combat loop (auto-targeting, auto-attacking). Best for AFK grinding.
- **`engage()`** — Fight a single entity your script provides. Best for bosses and slayers.
- **Async combat** — Manual tick-based control. Best for custom combat logic.
- **Pursuit primitives** — Chase an entity without attacking. Best for positioning before fighting.
:::

---

## Combat Loop

### `hexis.combat.start(options)`

Starts a background combat loop that automatically targets and attacks entities.

**Blocking:** No (runs in background, use `stop()` to end)

```lua
hexis.combat.start({
    targets = {"Enderman", "Zealot"},
    style = "ranged",
    weapon = "Juju Shortbow",
    radius = 15,
    aim_speed = 1.0,
    attack_cps = 12,
})
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `targets` | string[] | required | Entity names to target |
| `style` | string | `"melee"` | `"ranged"` or `"melee"` |
| `weapon` | string | nil | Weapon name to equip |
| `radius` | number | `10` | Search radius for entities |
| `aim_speed` | number | `1.0` | Camera aim speed multiplier |
| `attack_cps` | number | `10` | Clicks per second |

### `hexis.combat.stop()`

Stops the combat loop and releases camera control.

```lua
hexis.combat.stop()
```

### `hexis.combat.is_active()`

Returns `true` if combat loop is running.

---

## Hunt Mode

### `hexis.combat.hunt(options)`

Hunt mode: automatically scans for, pursues, and attacks entities. Java handles target selection.

```lua
hexis.combat.hunt({
    type = "Enderman",
    hunt_radius = 30,
    timeout = 10
})
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | required | Entity type to hunt |
| `hunt_radius` | number | `20` | Maximum hunt distance |
| `timeout` | number | `5` | Timeout in seconds |

---

## Engaged Combat

### `hexis.combat.engage(options)`

Fights a single entity provided by the script. **Blocking** — returns when the mob dies, escapes, times out, or the player dies. Unlike `hunt()` which scans for targets, `engage()` receives the target from Lua, letting scripts handle target selection (boss detection, ownership checks, etc.).

**Returns:** string — `"killed"`, `"escaped"`, `"timeout"`, `"lost"`, or `"died"`

```lua
local boss = hexis.combat.find_boss({
    boss_name = "Sven Packmaster",
    entity_type = "wolf",
    radius = 64
})

if boss then
    local result = hexis.combat.engage({
        entity = boss,
        style = "engaged",
        attack_range = 3.0,
        cps = 7,
        tracking_speed = 2.5,
        timeout = 15
    })

    if result == "killed" then
        hexis.log.info("Boss defeated!")
    end
end
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `entity` | table | required | Entity table with `id` field |
| `style` | string | `"engaged"` | `"engaged"` (kiting) or `"1tap"` (stationary) |
| `attack_range` | number | `3.0` | Maximum attack distance |
| `cps` | number | `7` | Clicks per second |
| `tracking_speed` | number | `2.5` | Camera tracking speed multiplier |
| `timeout` | number | `15` | Maximum combat duration in seconds |
| `kite_min_range` | number | `1.5` | Minimum kiting distance |
| `kite_optimal_range` | number | `2.0` | Optimal kiting distance |
| `kite_max_range` | number | `2.5` | Maximum kiting distance |

**Return Values:**

| Value | Description |
|-------|-------------|
| `"killed"` | Target entity died or was removed |
| `"escaped"` | Target moved out of reachable range |
| `"timeout"` | Combat duration exceeded timeout |
| `"lost"` | Target lost (despawned, teleported) |
| `"died"` | Player died during combat |

:::tip When to use engage() vs hunt() vs start()
- **`engage()`** — Your script handles target selection (boss detection, ownership). Blocking, returns result.
- **`hunt()`** — Java handles scanning and target selection. Blocking.
- **`start()`** — Background combat loop. Non-blocking. Best for grinding while your script does other things.
:::

---

## Targeting

### `hexis.combat.find_target(options)`

Finds the best matching entity using configurable priority and filters.

```lua
local target = hexis.combat.find_target({
    type = "Enderman",
    radius = 20,
    priority = "closest",
    require_los = true
})

if target then
    hexis.log.info("Found: " .. target.name .. " at " .. target.distance)
end
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | nil | Entity type to search for |
| `radius` | number | `20` | Search radius |
| `priority` | string | `"closest"` | `"closest"` or `"lowest_health"` |
| `require_los` | boolean | `false` | Require line of sight |

Returns an entity table with `id`, `name`, `x`, `y`, `z`, `distance`, etc., or `nil` if no match.

### `hexis.combat.find_boss(options)`

Finds boss entities matching specific criteria. Designed for Hypixel slayer bosses.

```lua
local boss = hexis.combat.find_boss({
    boss_name = "Sven Packmaster",
    entity_type = "wolf",
    radius = 64
})
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `boss_name` | string | nil | Boss display name pattern |
| `entity_type` | string | nil | Entity type (e.g., `"wolf"`) |
| `radius` | number | `64` | Search radius |

### `hexis.combat.get_targets(distance)`

Returns table of entity names within distance.

```lua
local targets = hexis.combat.get_targets(20)
for _, name in ipairs(targets) do
    hexis.log.info("Target: " .. name)
end
```

---

## Validation Helpers

### `hexis.combat.is_valid(entity)`

Returns `true` if the entity still exists in the world.

### `hexis.combat.is_alive(entity)`

Returns `true` if the entity's health is above 0.

### `hexis.combat.has_los(entity)`

Returns `true` if the player has line of sight to the entity (lenient — single ray).

### `hexis.combat.has_los_strict(entity)`

Returns `true` if the player has clear line of sight (strict — 3+ rays from different angles).

### `hexis.combat.distance_to(entity)`

Returns the Euclidean distance to the entity.

### `hexis.combat.blacklist(entity, duration_ms)`

Temporarily ignore an entity for the given duration in milliseconds.

```lua
hexis.combat.blacklist(entity, 5000)  -- Ignore for 5 seconds
```

### `hexis.combat.is_blacklisted(entity)`

Returns `true` if the entity is currently blacklisted.

---

## Async Combat

Manual tick-based combat where your script controls every frame. Use this when you need custom logic between attacks (ability usage, positioning, conditional behavior).

### `hexis.combat.start_async(options)`

Starts async combat mode. **Non-blocking** — you must call `tick()` every frame in your loop.

```lua
hexis.combat.start_async({
    cps = 10,
    tracking_speed = 2.5
})
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `cps` | number | `10` | Clicks per second |
| `tracking_speed` | number | `2.5` | Camera tracking speed |

### `hexis.combat.set_target(entity)`

Sets the current target for async combat. Pass an entity table from `find_target()` or `get_nearby_entities()`.

```lua
local target = hexis.combat.find_target({type = "Enderman", radius = 20})
if target then
    hexis.combat.set_target(target)
end
```

### `hexis.combat.tick()`

Updates aim and attack for async combat. **Call every frame.**

```lua
hexis.combat.start_async({cps = 10})

while hexis.script.is_running() do
    local target = hexis.combat.find_target({type = "Enderman", radius = 20})
    if target then
        hexis.combat.set_target(target)
    end
    hexis.combat.tick()
    hexis.wait(0.05)
end

hexis.combat.stop_async()
```

### `hexis.combat.stop_async()`

Stops async combat and releases camera control.

### `hexis.combat.is_async_active()`

Returns `true` if async combat is running.

### `hexis.combat.has_target()`

Returns `true` if a valid target is set.

---

## Pursuit

Chase an entity without attacking. Useful for positioning before combat or following NPCs.

### `hexis.combat.pursue(entity)`

Starts non-blocking pursuit. The pathfinder navigates toward the entity and updates the path as it moves.

```lua
local boss = hexis.combat.find_boss({boss_name = "Sven Packmaster"})
if boss then
    hexis.combat.pursue(boss)
    hexis.combat.set_camera_lock(boss)

    while hexis.combat.is_pursuing() and hexis.script.is_running() do
        hexis.combat.pursuit_tick()
        if hexis.combat.pursuit_distance() < 3.0 then
            break
        end
        hexis.wait(0.05)
    end

    hexis.combat.pursue_stop()
end
```

### `hexis.combat.pursue_stop()`

Stops pursuit and releases navigation.

### `hexis.combat.is_pursuing()`

Returns `true` if currently pursuing.

### `hexis.combat.pursuit_distance()`

Returns the current distance to the pursuit target.

### `hexis.combat.pursuit_tick()`

Updates pursuit pathfinding. **Call every frame during pursuit.**

---

## Behavior & Camera

### `hexis.combat.set_behavior(behavior)`

Sets the combat movement behavior.

| Behavior | Description |
|----------|-------------|
| `"normal"` | Standard combat movement |
| `"backup"` | Walk backward while fighting |
| `"strafe"` | Circle-strafe around the target |

```lua
hexis.combat.set_behavior("strafe")
```

### `hexis.combat.set_kite_range(min, optimal, max)`

Configures kiting distances for `engage()` with engaged style.

```lua
hexis.combat.set_kite_range(1.5, 2.5, 3.5)
```

### `hexis.combat.set_camera_lock(entity)`

Locks the camera on a specific entity per-frame.

### `hexis.combat.clear_camera_lock()`

Releases the camera lock.

---

## Attack Primitives

Low-level attack functions for precise control over individual attacks.

### `hexis.combat.in_range(entity, range)`

Returns `true` if the entity is within the given attack range.

```lua
if hexis.combat.in_range(target, 3.0) then
    hexis.combat.swing()
end
```

### `hexis.combat.can_attack()`

Returns `true` if the attack cooldown is ready.

### `hexis.combat.swing()`

Performs a single weapon swing (left-click attack).

---

## Example: Custom Slayer Loop

```lua
function hexis.main()
    while hexis.script.is_running() do
        local boss = hexis.combat.find_boss({
            boss_name = "Sven Packmaster",
            entity_type = "wolf",
            radius = 64
        })

        if boss then
            -- Pursue until in range
            hexis.combat.pursue(boss)
            hexis.combat.set_camera_lock(boss)

            while hexis.combat.is_pursuing() and hexis.script.is_running() do
                hexis.combat.pursuit_tick()
                if hexis.combat.pursuit_distance() < 3.0 then
                    break
                end
                hexis.wait(0.05)
            end
            hexis.combat.pursue_stop()

            -- Fight
            local result = hexis.combat.engage({
                entity = boss,
                style = "engaged",
                timeout = 30
            })

            hexis.combat.clear_camera_lock()
            hexis.log.info("Combat result: " .. result)
        end

        hexis.wait(1.0)
    end
end
```

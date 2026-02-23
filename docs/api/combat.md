---
sidebar_position: 5
title: Combat
description: Automated combat and targeting
---

# Combat API

Namespace: `hexis.combat`

Automated combat with entity targeting and attack patterns.

:::caution Beta Feature

The Combat API is in **beta** and may have occasional issues with targeting or attack timing. Core functionality works, but edge cases are still being refined. Report any issues you encounter.

:::

---

## Combat Loop

### `hexis.combat.start(options)`

Starts a combat loop that automatically targets and attacks entities.

**Blocking:** No (runs in background, use `hexis.combat.stop()` to stop)

```lua
hexis.combat.start({
    targets = {"Enderman", "Zealot"},  -- Entity types to target
    style = "ranged",                   -- "ranged" or "melee"
    weapon = "Juju Shortbow",          -- Weapon to equip
    radius = 15,                        -- Search radius
    aim_speed = 1.0,                    -- Aim speed multiplier
    attack_cps = 12,                    -- Clicks per second
    id = "my_combat"                    -- Optional: loop identifier
})
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `targets` | string[] | required | Entity names to target |
| `style` | string | `"melee"` | `"ranged"` or `"melee"` |
| `weapon` | string | nil | Weapon name to equip |
| `radius` | number | `10` | Search radius for entities |
| `aim_speed` | number | `1.0` | Camera aim speed multiplier |
| `attack_cps` | number | `10` | Clicks per second |
| `id` | string | nil | Optional identifier for pause/resume |

### `hexis.combat.stop()`

Stops the combat loop.

```lua
hexis.combat.stop()
```

### `hexis.combat.is_active()`

Returns `true` if combat loop is running.

```lua
if hexis.combat.is_active() then
    hexis.log.info("Combat active!")
end
```

---

## Single Attacks

### `hexis.combat.attack(target, options)`

Performs a single attack on target.

```lua
hexis.combat.attack("nearest_mob", {count = 1, cps = 12})
```

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `target` | string | Entity name or `"nearest_mob"` |
| `options.count` | number | Number of attacks |
| `options.cps` | number | Clicks per second |

---

## Hunt Mode

### `hexis.combat.hunt(options)`

Hunt mode: pursue and attack entities. Automatically navigates to targets.

```lua
hexis.combat.hunt({
    type = "Enderman",
    hunt_radius = 30,
    timeout = 10000
})
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | required | Entity type to hunt |
| `hunt_radius` | number | `20` | Maximum hunt distance |
| `timeout` | number | `5000` | Timeout in milliseconds |

---

## Engaged Combat

### `hexis.combat.engage(options)`

Fights a single entity provided by the script. **Blocking** — returns when the mob dies, escapes, times out, or the player dies. Unlike `hunt()` which scans for targets, `engage()` receives the target from Lua, letting scripts handle target selection (boss detection, ownership checks, etc.).

**Returns:** string — `"killed"`, `"escaped"`, `"timeout"`, `"lost"`, or `"died"`

```lua
-- Find a boss, then engage it
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
    elseif result == "died" then
        hexis.log.error("Player died!")
    end
end
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `entity` | table | required | Entity table with `id` (network ID) and/or `x, y, z` position |
| `style` | string | `"engaged"` | `"engaged"` (kiting movement) or `"1tap"` (stationary) |
| `attack_range` | number | `3.0` | Maximum attack distance |
| `cps` | number | `7` | Clicks per second |
| `tracking_speed` | number | `2.5` | Camera tracking speed multiplier |
| `timeout` | number | `15` | Maximum combat duration in seconds |
| `kite_min_range` | number | `1.5` | Minimum kiting distance (engaged style) |
| `kite_optimal_range` | number | `2.0` | Optimal kiting distance (engaged style) |
| `kite_max_range` | number | `2.5` | Maximum kiting distance (engaged style) |

**Return Values:**

| Value | Description |
|-------|-------------|
| `"killed"` | Target entity died or was removed |
| `"escaped"` | Target moved out of reachable range |
| `"timeout"` | Combat duration exceeded timeout |
| `"lost"` | Target lost (despawned, teleported) |
| `"died"` | Player died during combat |

:::tip When to use engage() vs hunt()
Use `engage()` when your script handles target selection — boss detection, ownership validation, zone filtering, etc. Use `hunt()` when you want Java to handle scanning and target selection automatically.
:::

---

## Target Detection

### `hexis.combat.get_targets(distance)`

Returns table of entity names within distance.

```lua
local targets = hexis.combat.get_targets(20)
for _, name in ipairs(targets) do
    hexis.log.info("Target: " .. name)
end
```

### `hexis.combat.get_nearest_target(options)`

Get the nearest entity matching criteria.

```lua
local target = hexis.combat.get_nearest_target({
    types = {"Enderman", "Zealot"},
    max_distance = 30
})

if target then
    hexis.log.info("Nearest: " .. target.name .. " at " .. target.distance)
end
```

---

## Combat Styles

### Ranged Combat

For bows, crossbows, and other ranged weapons:

```lua
hexis.combat.start({
    targets = {"Enderman", "Zealot", "Voidling Extremist"},
    style = "ranged",
    weapon = "Juju Shortbow",
    radius = 25,           -- Larger radius for ranged
    attack_cps = 10,       -- Bow draw speed
    aim_speed = 1.5        -- Slightly faster aim for moving targets
})
```

### Melee Combat

For swords and melee weapons:

```lua
hexis.combat.start({
    targets = {"Zombie", "Skeleton"},
    style = "melee",
    weapon = "Diamond Sword",
    radius = 5,            -- Closer range for melee
    attack_cps = 12,       -- Sword swing speed
    aim_speed = 2.0        -- Fast aim for close quarters
})
```

---

## Example Usage

### Basic Combat Loop

```lua
-- Start ranged combat
hexis.combat.start({
    targets = {"Enderman", "Zealot", "Voidling Extremist"},
    style = "ranged",
    weapon = "Juju Shortbow",
    radius = 20,
    attack_cps = 10
})

-- Main loop
local kills = 0
while hexis.running() do
    -- Update HUD with combat stats
    hexis.hud.set_var("kills", kills)
    hexis.sleep(100)
end

-- Stop combat when script ends
hexis.combat.stop()
```

### Combat with Navigation

```lua
function hexis.main()
    local spawn_points = {
        {x = 100, y = 65, z = 200},
        {x = 150, y = 65, z = 250},
        {x = 200, y = 65, z = 200}
    }

    while hexis.running() do
        -- Check for nearby targets
        local targets = hexis.combat.get_targets(30)

        if #targets > 0 then
            -- Start combat if targets found
            hexis.combat.start({
                targets = {"Enderman"},
                style = "ranged",
                weapon = "Juju Shortbow",
                radius = 25
            })

            -- Wait until no more targets
            while #hexis.combat.get_targets(30) > 0 and hexis.running() do
                hexis.sleep(500)
            end

            hexis.combat.stop()
        else
            -- Navigate to next spawn point
            local next_spawn = spawn_points[math.random(#spawn_points)]
            hexis.navigation.walk_to(next_spawn)
        end

        hexis.sleep(100)
    end
end
```

### Conditional Combat

```lua
function hexis.main()
    while hexis.running() do
        -- Only fight if health is good
        local health = hexis.player.get_health()

        if health > 10 then
            -- Check for targets
            local target = hexis.combat.get_nearest_target({
                types = {"Enderman"},
                max_distance = 20
            })

            if target then
                hexis.combat.start({
                    targets = {"Enderman"},
                    style = "ranged",
                    weapon = "Juju Shortbow"
                })

                -- Fight until target dead or health low
                while target and health > 5 and hexis.running() do
                    health = hexis.player.get_health()
                    target = hexis.combat.get_nearest_target({
                        types = {"Enderman"},
                        max_distance = 20
                    })
                    hexis.sleep(100)
                end

                hexis.combat.stop()
            end
        else
            -- Heal up
            hexis.log.warn("Low health, waiting to heal...")
            hexis.sleep(5000)
        end

        hexis.sleep(100)
    end
end
```

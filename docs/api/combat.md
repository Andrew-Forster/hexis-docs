---
sidebar_position: 5
title: Combat
description: Automated combat and targeting
---

# Combat API

Namespace: `hexis.combat`

Automated combat with entity targeting and attack patterns.

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

---

## Hunt Mode

### `hexis.combat.hunt(options)`

Hunt mode: pursue and attack entities.

```lua
hexis.combat.hunt({
    type = "Enderman",
    hunt_radius = 30,
    timeout = 10000
})
```

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

---

## Example Usage

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
while hexis.running() do
    -- Update HUD with combat stats
    hexis.hud.set_var("kills", kills)
    hexis.sleep(100)
end

-- Stop combat when script ends
hexis.combat.stop()
```

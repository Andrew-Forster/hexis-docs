---
sidebar_position: 10
title: Conditions
description: Boolean conditions for game state checks
---

# Conditions API

Namespace: `hexis.conditions`

Boolean conditions for game state checks.

---

## Player Detection

```lua
hexis.conditions.player_nearby(distance)        -- Any player nearby
hexis.conditions.no_players_nearby(distance)    -- No players nearby
hexis.conditions.player_within(distance, ms)    -- Player lingering
hexis.conditions.player_visible(distance, ms)   -- Player in line of sight
hexis.conditions.player_sneaking(distance)      -- Sneaking player nearby
```

:::tip Alternative Properties
`player_sneaking()` checks for *other* sneaking players nearby. To check if *your* player is sneaking, use `hexis.player.is_sneaking`.
:::

### Examples

```lua
-- Check if any player is within 30 blocks
if hexis.conditions.player_nearby(30) then
    hexis.log.warn("Player detected nearby!")
end

-- Check if a player has been within 10 blocks for 5 seconds
if hexis.conditions.player_within(10, 5000) then
    hexis.log.warn("Player lingering close by!")
end
```

---

## Entity Detection

```lua
hexis.conditions.mob_within(distance, ms)       -- Mob nearby
hexis.conditions.entity_within(distance, ms)    -- Any entity nearby
```

### Examples

```lua
-- Check for mobs within 20 blocks
if hexis.conditions.mob_within(20) then
    hexis.combat.start({...})
end
```

---

## State Checks

```lua
hexis.conditions.player_health("lt", 10)        -- Health comparison
hexis.conditions.tablist_contains(pattern)      -- Tablist has entry
hexis.conditions.distance_from_marked("lt", 5)  -- Distance from marked pos
```

:::tip Moved Functions
- `inventory_full()` has moved to `hexis.inventory.is_full()`
- `gui_open()` has moved to `hexis.gui.is_open()`
- `player_y()` can also be checked directly with `hexis.player.y`
:::

### Health Comparison

```lua
-- Check if health is less than 10
if hexis.conditions.player_health("lt", 10) then
    hexis.log.warn("Low health!")
    hexis.player.use_item()  -- Use healing item
end

-- Comparison operators: "lt", "gt", "eq", "lte", "gte"
```

### Y Position Check

```lua
-- Check if player is above Y=64
if hexis.player.y > 64 then
    hexis.log.info("Above sea level")
end
```

### Tablist Check

```lua
-- Check area via tablist
if hexis.conditions.tablist_contains("Area: The Park") then
    hexis.log.info("In The Park")
end
```

---

## Utility Conditions

```lua
hexis.conditions.random(0.5)     -- 50% chance
hexis.conditions.always()        -- Always true
```

### Examples

```lua
-- Random break (50% chance)
if hexis.conditions.random(0.5) then
    hexis.log.info("Taking a break...")
    hexis.wait(5.0)
end

-- 10% chance
if hexis.conditions.random(0.1) then
    hexis.player.jump()
end
```

---

## Example: Safety Check

```lua
-- Combined safety check
local function is_safe()
    return hexis.conditions.no_players_nearby(30)
       and not hexis.inventory.is_full()
       and hexis.conditions.player_health("gt", 5)
end

while hexis.running() do
    if is_safe() then
        -- Continue farming
    else
        hexis.log.warn("Safety check failed, pausing...")
        hexis.wait(5.0)
    end
end
```

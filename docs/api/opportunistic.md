---
sidebar_position: 16
title: Opportunistic
description: Target detection during navigation
---

# Opportunistic API

Namespace: `hexis.opportunistic`

Register targets (blocks/entities) to interact with **during navigation**. The system detects targets near the calculated path and handles detours automatically.

This is useful for:
- Breaking flowering azaleas while traveling to trees (Competition Mode)
- Collecting items/entities along the way to a destination
- Mining ore veins spotted during navigation

---

## Concept

Instead of going strictly from A to B, opportunistic targets allow the script to take small detours for valuable targets near the path. Loop prevention ensures we don't get stuck in infinite detours.

---

## Registration

### `hexis.opportunistic.register(config)`

Register a new opportunistic target type.

```lua
hexis.opportunistic.register({
    type = "block",                    -- "block" or "entity"
    patterns = {"flowering_azalea"},   -- Block IDs or entity types to match
    radius = 3.0,                      -- Max distance from path to consider
    action = "break",                  -- "break", "interact", "attack", "callback"
    priority = 1,                      -- Lower = higher priority
    max_detours = 4                    -- Max detours per navigation (optional)
})
```

**Parameters:**

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `type` | string | "block" | Target type: "block" or "entity" |
| `patterns` | array/string | Required | Block IDs or entity types to match (partial, case-insensitive) |
| `radius` | number | 6.0 | Maximum distance from path to consider a target |
| `action` | string | "break" / "interact" | What to do: "break", "interact", "attack", "callback" |
| `priority` | number | 1 | Priority (lower = checked first) |
| `max_detours` | number | 4 | Maximum detours per navigation |

### `hexis.opportunistic.clear()`

Clear all registered targets.

```lua
hexis.opportunistic.clear()
```

---

## Candidate Management

### `hexis.opportunistic.set_candidates(positions)`

Set candidate positions from route data. These are checked against the navigation path.

```lua
local all_blocks = current_route:get_blocks()
hexis.opportunistic.set_candidates(all_blocks)
```

### `hexis.opportunistic.add_candidate(x, y, z)`

Add a single candidate position.

```lua
hexis.opportunistic.add_candidate(100, 65, 200)
```

---

## State Management

### `hexis.opportunistic.reset_navigation()`

Reset per-navigation state (detour count, handled positions). Call this when starting new navigation.

```lua
-- Before each navigate call
hexis.opportunistic.reset_navigation()
hexis.navigate.to({x = 100, y = 64, z = 200})
```

### `hexis.opportunistic.set_max_detours(n)`

Set maximum detours allowed per navigation.

```lua
hexis.opportunistic.set_max_detours(6)  -- Allow up to 6 detours
```

---

## State Queries

### `hexis.opportunistic.is_active()`

Returns `true` if any targets are registered.

```lua
if hexis.opportunistic.is_active() then
    hexis.log.info("Opportunistic targets enabled")
end
```

### `hexis.opportunistic.is_at_max_detours()`

Returns `true` if maximum detours reached for current navigation.

```lua
if hexis.opportunistic.is_at_max_detours() then
    hexis.log.info("Max detours reached, skipping opportunistic targets")
end
```

### `hexis.opportunistic.get_detour_count()`

Returns current detour count for this navigation.

```lua
local count = hexis.opportunistic.get_detour_count()
hexis.log.info("Detours so far: " .. count)
```

---

## Complete Example: Competition Mode

```lua
-- Register flowering azaleas as opportunistic targets
if config.competition_mode then
    hexis.opportunistic.clear()
    hexis.opportunistic.register({
        type = "block",
        patterns = {"flowering_azalea"},
        radius = config.competition_radius,
        action = "break",
        max_detours = 4
    })

    -- Set candidates from route
    local all_blocks = current_route:get_blocks()
    hexis.opportunistic.set_candidates(all_blocks)
end

-- During navigation loop, the system will automatically:
-- 1. Detect azaleas near the path
-- 2. Pause navigation
-- 3. Detour to azalea
-- 4. Break it
-- 5. Resume navigation
-- 6. Track detours to prevent infinite loops
```

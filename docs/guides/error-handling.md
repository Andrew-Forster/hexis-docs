---
sidebar_position: 2
title: Error Handling
description: Handling errors and edge cases in scripts
---

# Error Handling

## Using pcall

Wrap risky operations in `pcall` to catch errors:

```lua
local success, err = pcall(function()
    hexis.navigate.to({x = 0, y = 0, z = 0})
end)

if not success then
    hexis.log.error("Navigation failed: " .. tostring(err))
end
```

---

## Common Error Patterns

### Navigation Failures

```lua
local success = hexis.navigate.to({x = 100, y = 64, z = 200})
if not success then
    hexis.log.warn("Path unreachable, trying alternative...")
    -- Try alternative approach
end
```

### GUI Not Found

```lua
local slot = hexis.gui.find({name = "Diamond"})
if not slot then
    hexis.log.warn("Item not found in GUI")
    hexis.gui.close()
    return
end
```

### Missing Route

```lua
local route = hexis.routes.load("my_route")
if not route then
    hexis.log.error("Route not found!")
    hexis.script.stop()
    return
end
```

---

## Script Stop Behavior

When a script stops (error or manual):

1. Combat loop stops
2. Movement stops
3. Camera control released
4. Input blocking disabled
5. Staff detection disabled
6. HUD hidden

All cleanup is automatic.

---

## Graceful Degradation

Handle partial failures gracefully:

```lua
-- Try primary method, fall back to alternative
local block = route:get_nearest_block({max_distance = 50})
if not block then
    hexis.log.info("No blocks nearby, expanding search...")
    block = route:get_nearest_block({max_distance = 100})
end

if not block then
    hexis.log.warn("No blocks available, waiting...")
    hexis.wait(5.0)
end
```

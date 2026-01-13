---
sidebar_position: 9
title: Events
description: Event listeners and callbacks
---

# Events API

Namespace: `hexis.events`

Register callbacks for game events.

---

## Event Listeners

### `hexis.events.on(type, pattern, callback)`

Registers an event listener.

**Types:** `"sound"`, `"chat"`

```lua
-- Sound event
local id = hexis.events.on("sound", "experience_orb", function(sound)
    hexis.log.info("XP sound: " .. sound)
end)

-- Chat event
hexis.events.on("chat", "RARE DROP", function(message)
    hexis.log.info("Got rare drop: " .. message)
end)
```

### `hexis.events.remove(id)`

Removes an event listener by ID.

```lua
local id = hexis.events.on("sound", "orb", handler)
-- Later...
hexis.events.remove(id)
```

### `hexis.events.clear()`

Removes all event listeners.

```lua
hexis.events.clear()
```

---

## Timers

### `hexis.events.every(seconds, callback)`

Runs callback every N seconds.

```lua
hexis.events.every(5, function()
    hexis.log.info("5 seconds passed")
end)
```

### `hexis.events.after(seconds, callback)`

Runs callback once after N seconds.

```lua
hexis.events.after(10, function()
    hexis.log.info("10 seconds have passed")
end)
```

---

## Example Usage

```lua
local kills = 0

-- Track kills via sound
hexis.events.on("sound", "experience_orb", function()
    kills = kills + 1
    hexis.hud.set_var("kills", kills)
end)

-- Track rare drops via chat
hexis.events.on("chat", "RARE DROP", function(message)
    hexis.actions.notify({
        title = "Rare Drop!",
        message = message
    })
end)

-- Periodic stats update
hexis.events.every(60, function()
    local elapsed = hexis.timer.elapsed()
    local rate = kills / (elapsed / 3600)
    hexis.hud.set_var("kills_per_hour", hexis.format.number(rate))
end)
```

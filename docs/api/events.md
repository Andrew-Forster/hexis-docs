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

**Types:** `"sound"`, `"chat"`, `"tick"`

```lua
-- Sound event (callback receives a table with sound data)
local id = hexis.events.on("sound", "experience_orb", function(event)
    hexis.log.info("XP sound at: " .. event.x .. ", " .. event.y .. ", " .. event.z)
end)

-- Chat event
hexis.events.on("chat", "RARE DROP", function(message)
    hexis.log.info("Got rare drop: " .. message)
end)

-- Tick event (~20 per second)
hexis.events.on("tick", nil, function()
    -- Runs every game tick
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

## Event Processing

### `hexis.events.process()`

Manually process queued tick events. Useful when you need to force-process events outside the normal tick cycle.

```lua
hexis.events.process()
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

---

## Sound Event Data

Sound event callbacks receive a table with the following fields:

| Field | Type | Description |
|-------|------|-------------|
| `id` | string | Sound identifier (e.g., `"entity.fishing_bobber.splash"`) |
| `volume` | number | Sound volume |
| `pitch` | number | Sound pitch |
| `timestamp` | number | When the sound was played |
| `x` | number | X coordinate of sound source |
| `y` | number | Y coordinate of sound source |
| `z` | number | Z coordinate of sound source |

```lua
hexis.events.on("sound", "entity.fishing_bobber.splash", function(event)
    hexis.log.info("Splash at: " .. event.x .. ", " .. event.y .. ", " .. event.z)
    hexis.log.info("Volume: " .. event.volume .. " Pitch: " .. event.pitch)
end)
```

---

## Example Usage

```lua
local kills = 0

-- Track kills via sound (with position)
hexis.events.on("sound", "experience_orb", function(event)
    kills = kills + 1
    hexis.hud.set_var("kills", kills)
    hexis.log.debug("XP at: " .. event.x .. ", " .. event.y .. ", " .. event.z)
end)

-- Track rare drops via chat
hexis.events.on("chat", "RARE DROP", function(message)
    hexis.player.use_item()  -- Celebration right-click
end)

-- Per-tick processing
hexis.events.on("tick", nil, function()
    -- Check something every tick
    if hexis.player.health_percent < 20 then
        hexis.log.warn("Low health!")
    end
end)

-- Periodic stats update
hexis.events.every(60, function()
    local elapsed = hexis.timer.elapsed()
    local rate = kills / (elapsed / 3600)
    hexis.hud.set_var("kills_per_hour", hexis.format.number(rate))
end)
```

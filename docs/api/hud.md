---
sidebar_position: 11
title: HUD
description: Custom HUD overlays
---

# HUD API

Namespace: `hexis.hud`

Create custom HUD overlays for displaying script statistics.

---

## Creating HUDs

### `hexis.hud.create(config)`

Creates a HUD with title and elements.

```lua
hexis.hud.create({
    title = "Zealot Farmer",
    elements = {
        {type = "stat", label = "Kills", value = "{kills}"},
        {type = "stat", label = "Time", value = "{elapsed_time}"},
        {type = "stat", label = "$/hr", value = "{profit_per_hour}"}
    }
})
```

Variables in curly braces `{variable}` are interpolated from values set with `set_var()`.

---

## Updating Values

### `hexis.hud.set_var(name, value)`

Sets a HUD variable for interpolation.

```lua
hexis.hud.set_var("kills", 42)
hexis.hud.set_var("elapsed_time", "1h 23m")
hexis.hud.set_var("profit_per_hour", "1.5M")
```

### `hexis.hud.set_state(state)`

Sets HUD state (triggers animations).

```lua
hexis.hud.set_state("combat")
hexis.hud.set_state("idle")
```

---

## Visibility

### `hexis.hud.show()`

Shows the HUD.

```lua
hexis.hud.show()
```

### `hexis.hud.hide()`

Hides the HUD.

```lua
hexis.hud.hide()
```

---

## Timer Integration

### `hexis.hud.start_timer()`

Starts the built-in session timer.

```lua
hexis.hud.start_timer()
```

### `hexis.hud.stop_timer()`

Stops the built-in session timer.

```lua
hexis.hud.stop_timer()
```

---

## Example Usage

```lua
-- Create HUD at script start
hexis.hud.create({
    title = "Enderman Slayer",
    elements = {
        {type = "stat", label = "Kills", value = "{kills}"},
        {type = "stat", label = "Time", value = "{time}"},
        {type = "stat", label = "Kills/hr", value = "{rate}"},
        {type = "stat", label = "Eyes", value = "{eyes}"}
    }
})

hexis.hud.show()
hexis.hud.start_timer()

local kills = 0
local eyes = 0

-- Track kills via sound
hexis.events.on("sound", "experience_orb", function()
    kills = kills + 1
    hexis.hud.set_var("kills", kills)
end)

-- Track eye drops
hexis.events.on("chat", "Summoning Eye", function()
    eyes = eyes + 1
    hexis.hud.set_var("eyes", eyes)
end)

-- Main loop
while hexis.running() do
    -- Update time
    hexis.hud.set_var("time", hexis.timer.formatted())

    -- Update rate
    local elapsed = hexis.timer.elapsed()
    if elapsed > 0 then
        local rate = kills / (elapsed / 3600)
        hexis.hud.set_var("rate", hexis.format.number(rate))
    end

    hexis.wait(1.0)
end

hexis.hud.stop_timer()
hexis.hud.hide()
```

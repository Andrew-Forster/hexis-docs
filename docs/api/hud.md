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

## Multi-State HUDs

Most production scripts use multi-state HUDs — different layouts for different script phases. Each state has its own elements and subtitle.

### `hexis.hud.add_state(name, config)`

Adds a named state to the HUD. Call after `create()` but before `show()`.

```lua
hexis.hud.create({position = "top-right", width = 260})

hexis.hud.add_state("idle", {
    elements = {
        {type = "title", value = "My Script", subtitle = "Idle"},
        {type = "stat", label = "Mined", value = "{mined}"},
        {type = "stat", label = "Time", value = "{elapsed_time}"},
    }
})

hexis.hud.add_state("mining", {
    elements = {
        {type = "title", value = "My Script", subtitle = "Mining..."},
        {type = "stat", label = "Target", value = "{target_name}"},
        {type = "stat", label = "Mined", value = "{mined}"},
    }
})

hexis.hud.set_state("idle")
hexis.hud.show()
hexis.hud.start_timer()
```

**Element Types:**

| Type | Fields | Description |
|------|--------|-------------|
| `title` | `value`, `subtitle` | Header bar with optional subtitle |
| `stat` | `label`, `value` | Key-value stat row. Supports `{variable}` interpolation |

### `hexis.hud.set_state(state)`

Switches to a named state with smooth transition animation.

```lua
hexis.hud.set_state("mining")
hexis.hud.set_var("target_name", "Diamond Ore")
```

---

## Updating Values

### `hexis.hud.set_var(name, value)`

Sets a HUD variable for `{variable}` interpolation in stat values.

```lua
hexis.hud.set_var("kills", 42)
hexis.hud.set_var("elapsed_time", "1h 23m")
hexis.hud.set_var("profit_per_hour", "1.5M")
```

:::tip Built-in Variables
`{elapsed_time}` is automatically populated by `start_timer()` — no need to update it manually.
:::

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

## Example: Simple HUD

```lua
hexis.hud.create({
    title = "Enderman Slayer",
    elements = {
        {type = "stat", label = "Kills", value = "{kills}"},
        {type = "stat", label = "Time", value = "{elapsed_time}"},
        {type = "stat", label = "Kills/hr", value = "{rate}"},
    }
})

hexis.hud.show()
hexis.hud.start_timer()

local kills = 0

hexis.events.on("sound", "experience_orb", function()
    kills = kills + 1
    hexis.hud.set_var("kills", kills)
end)

while hexis.running() do
    local elapsed = hexis.timer.elapsed()
    if elapsed > 0 then
        hexis.hud.set_var("rate", hexis.format.number(kills / (elapsed / 3600)))
    end
    hexis.wait(1.0)
end
```

---

## Example: Multi-State HUD

```lua
hexis.hud.create({position = "top-right", width = 260})

hexis.hud.add_state("navigating", {
    elements = {
        {type = "title", value = "Foraging Macro", subtitle = "Walking..."},
        {type = "stat", label = "Target", value = "{target}"},
        {type = "stat", label = "Mined", value = "{mined}"},
        {type = "stat", label = "Time", value = "{elapsed_time}"},
    }
})

hexis.hud.add_state("mining", {
    elements = {
        {type = "title", value = "Foraging Macro", subtitle = "Mining"},
        {type = "stat", label = "Tree", value = "{tree_type}"},
        {type = "stat", label = "Mined", value = "{mined}"},
        {type = "stat", label = "Time", value = "{elapsed_time}"},
    }
})

hexis.hud.set_state("navigating")
hexis.hud.show()
hexis.hud.start_timer()

-- Switch states as script progresses
hexis.hud.set_state("mining")
hexis.hud.set_var("tree_type", "Dark Oak")
hexis.hud.set_var("mined", 42)
```

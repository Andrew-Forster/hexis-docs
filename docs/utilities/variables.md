---
sidebar_position: 4
title: Variables
description: Persistent script variables and tablist access
---

# Variables

## Script Variables

Namespace: `hexis.var`

Store and retrieve script variables.

### `hexis.var.set(name, value)`

Set a variable value.

```lua
hexis.var.set("kills", 0)
hexis.var.set("last_position", {x = 100, y = 64, z = 200})
```

### `hexis.var.get(name)`

Get a variable value.

```lua
local kills = hexis.var.get("kills")
kills = kills + 1
hexis.var.set("kills", kills)
```

### `hexis.var.exists(name)`

Check if a variable exists.

```lua
if hexis.var.exists("kills") then
    local kills = hexis.var.get("kills")
end
```

---

## Tablist

Namespace: `hexis.tablist`

Access the server tablist for game state information.

### `hexis.tablist.contains(pattern)`

Check if tablist contains a pattern.

```lua
if hexis.tablist.contains("Area: The Park") then
    hexis.log.info("In The Park")
end

if hexis.tablist.contains("Purse: ") then
    hexis.log.info("Has coins displayed")
end
```

---

## Script Configuration

Namespace: `hexis.config`

Define user-configurable settings that appear in the Hexis UI when users run your script. Each config call returns its current value, so you can assign directly.

### Factory Methods

#### `hexis.config.slider(label, min, max, default, step)`

Draggable slider for continuous numeric ranges.

```lua
local radius = hexis.config.slider("Hunt Radius", 10, 50, 30, 1)
local speed = hexis.config.slider("Aim Speed", 1.0, 3.0, 2.5, 0.1)
```

#### `hexis.config.stepper(label, min, max, default, step)`

Button stepper (+/-) for discrete numeric values. Use this instead of slider when precision matters.

```lua
local max_trees = hexis.config.stepper("Max Trees", 1, 20, 5, 1)
local chain_limit = hexis.config.stepper("Chain Limit", 1, 10, 5, 1)
```

#### `hexis.config.toggle(label, default)`

Boolean on/off toggle.

```lua
local auto_sell = hexis.config.toggle("Auto Sell", true)
local debug_mode = hexis.config.toggle("Debug Mode", false)
```

#### `hexis.config.dropdown(label, options, default)`

Dropdown selector for choosing between named options.

```lua
local mode = hexis.config.dropdown("Mining Mode", {"Efficient", "Speed", "Safe"}, "Efficient")
local tool = hexis.config.dropdown("Tool", {"Pickaxe", "Drill", "Gauntlet"}, "Pickaxe")
```

#### `hexis.config.item_selector(label, items, default)`

Item picker for selecting from a list of items.

```lua
local crop = hexis.config.item_selector("Crop", {"Wheat", "Carrot", "Potato"}, "Wheat")
```

### Reading Config Values

Config factory methods return the current value directly. Call them at the top of your script (outside `main()`) to define settings that appear in the UI.

```lua
-- Define config at script level (runs before main)
local hunt_radius = hexis.config.slider("Hunt Radius", 10, 50, 30, 1)
local auto_sell = hexis.config.toggle("Auto Sell", true)
local mode = hexis.config.dropdown("Mode", {"Farm", "Combat"}, "Farm")

function hexis.main()
    hexis.log.info("Radius: " .. hunt_radius)
    hexis.log.info("Auto sell: " .. tostring(auto_sell))
    hexis.log.info("Mode: " .. mode)
end
```

:::warning Legacy Pattern
The old `hexis.config({...})` table syntax and `hexis.config.get(id)` pattern are deprecated. Use the factory methods above instead — they're simpler and type-safe.
:::

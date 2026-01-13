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

## Config Access

### `hexis.config.get(id)`

Get a config value set by `hexis.config()`.

```lua
-- In setup:
hexis.config({
    {id = "hunt_radius", type = "slider", default = 30, min = 10, max = 50}
})

-- In main:
local radius = hexis.config.get("hunt_radius")
```

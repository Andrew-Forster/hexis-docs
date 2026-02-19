---
sidebar_position: 2
title: Script Lifecycle
description: Script metadata, types, configuration, and lifecycle management
---

# Script Lifecycle

## Script Types

Every script is either **active** or **passive**. Set via the `type` field in `hexis.script()`.

| Behavior | Active (default) | Passive |
|----------|------------------|---------|
| Concurrent execution | Only **one** active script at a time | **Multiple** passive scripts simultaneously |
| Mod menu opens | Script **stops** | Script **keeps running** |
| Session persistence | Does **not** persist across sessions | **Persists** across Minecraft sessions |
| Typical pattern | Main loop with navigation/combat | Event-driven listeners, overlays, detectors |

### Active Scripts

Active scripts are the default. They control the player — pathfinding, mining, combat, etc. Only one can run at a time because they take control of movement and camera.

```lua
hexis.script({
    name = "Zealot Grinder",
    description = "Farms zealots in The End",
    -- type defaults to "active"
})

while true do
    hexis.combat.hunt("Zealot", {radius = 30})
    hexis.wait(0.5)
end
```

### Passive Scripts

Passive scripts run in the background alongside active scripts. They observe, display overlays, or react to events without controlling the player.

```lua
hexis.script({
    name = "Zone Overlay",
    type = "passive",
    description = "Shows player counts above zones",
})

while true do
    update_zone_labels()
    hexis.wait(10)
end
```

:::tip When to use passive
Use `type = "passive"` for scripts that:
- Display HUD overlays or world text labels
- Monitor chat or sound events
- Detect other players (e.g., macro detection)
- Don't need movement, combat, or camera control
:::

---

## `hexis.script(metadata)`

Defines script metadata. Must be called at the top of your script, before any logic.

```lua
hexis.script({
    name = "My Script",
    version = "1.0",
    author = "YourName",
    category = "Farming",
    description = "Farms wheat in the garden",
    icon = "https://sky.coflnet.com/static/icon/THEORETICAL_HOE_WHEAT_3",
    type = "active",

    input_blocking = {
        block_camera = true,
        block_movement = true,
        block_item_change = true,
        block_inventory = false,
    },

    staff_detection = true,
})
```

### Metadata Fields

| Field | Type | Required | Default | Description |
|-------|------|----------|---------|-------------|
| `name` | string | Yes | — | Display name in Hexis menu |
| `description` | string | Yes | — | Script description shown in menu |
| `author` | string | No | — | Script author name |
| `version` | string | No | — | Version string (e.g., `"1.0"`) |
| `category` | string | No | — | Category for menu grouping |
| `icon` | string | No | — | Icon URL for mod menu |
| `type` | string | No | `"active"` | `"active"` or `"passive"` — see [Script Types](#script-types) |
| `input_blocking` | table | No | all `true` | Controls which player inputs are blocked |
| `staff_detection` | boolean | No | `false` | Auto-pause when staff detected nearby |

### Icon URL

Use the Coflnet Skyblock icon API for item icons:

```lua
icon = "https://sky.coflnet.com/static/icon/ITEM_ID"
```

Or the mcicons API for block/item thumbnails:

```lua
icon = "https://mcicons.ccleaf.com/thumbnails/50.%20Icons/Barrier.png"
```

### Input Blocking

Controls which player inputs are blocked while the script runs. Only relevant for active scripts.

```lua
input_blocking = {
    block_camera = true,      -- Prevent player camera movement
    block_movement = true,    -- Prevent WASD movement
    block_item_change = true, -- Prevent hotbar slot changes
    block_inventory = false,  -- Prevent opening inventory
}
```

Passive scripts typically set all to `false` or omit entirely:

```lua
input_blocking = {
    block_camera = false,
    block_movement = false,
    block_item_change = false,
}
```

### Staff Detection

When `staff_detection = true`, the script automatically pauses if a Hypixel staff member is detected nearby and resumes when they leave.

---

## `hexis.config(options)`

Defines GUI configuration options. Creates sliders, toggles, and dropdowns in the Hexis menu. Returns a config table for reading values.

```lua
local config = hexis.config({
    radius = hexis.config.slider("Hunt Radius", 10, 50, 30, 5),
    auto_sell = hexis.config.toggle("Auto Sell", true),
    weapon = hexis.config.dropdown("Weapon", {
        {"juju", "Juju Shortbow"},
        {"term", "Terminator"},
        {"hyp", "Hyperion"},
    }, "juju"),
})
```

### Factory Methods

#### `hexis.config.slider(label, min, max, default, step?)`

Numeric slider with optional step size.

```lua
speed = hexis.config.slider("Aim Speed", 0.1, 5.0, 1.0)
accuracy = hexis.config.slider("Detection Threshold (%)", 50, 95, 85, 5)
```

#### `hexis.config.toggle(label, default)`

Boolean on/off toggle.

```lua
enabled = hexis.config.toggle("Auto Sell", true)
debug = hexis.config.toggle("Debug Mode", false)
```

#### `hexis.config.dropdown(label, options, default)`

Selection list. Options are `{value, display_label}` pairs.

```lua
mode = hexis.config.dropdown("Mode", {
    {"grind", "Grind Mobs"},
    {"farm", "Farm Crops"},
}, "grind")
```

#### `hexis.config.item_selector(label, items, default)`

Item selection from a list.

```lua
tool = hexis.config.item_selector("Tool", {"Treecapitator", "Jungle Axe"}, "Treecapitator")
```

### Accessing Config Values

Read values directly from the returned config table:

```lua
local config = hexis.config({ ... })

-- Direct field access (reactive — always returns current value)
local radius = config.radius
local sell = config.auto_sell
```

---

## Script Stop Behavior

When a script stops (error, `hexis.script.stop()`, or user toggle):

1. Combat loop stops
2. Movement stops
3. Camera control released
4. Input blocking disabled
5. Staff detection disabled
6. HUD hidden
7. World text labels cleared
8. Block highlights cleared
9. Entity glow effects removed
10. Event listeners removed

All cleanup is automatic — you don't need to manually stop anything.

---

## Full Example

```lua
hexis.script({
    name = "Galatea Forager",
    version = "2.1",
    author = "Hexis",
    category = "Foraging",
    description = "Automated foraging on Galatea Island",
    icon = "https://sky.coflnet.com/static/icon/TREECAPITATOR_AXE",
    type = "active",
    staff_detection = true,
})

local config = hexis.config({
    speed = hexis.config.slider("Aim Speed", 0.5, 3.0, 1.5),
    sell = hexis.config.toggle("Auto Sell", true),
})

local tree_mining = require("hypixel/lib/tree_mining")

while true do
    tree_mining.mine_nearest_tree({aim_speed = config.speed})

    if config.sell and hexis.inventory.is_full() then
        -- sell logic
    end

    hexis.wait(0.1)
end
```

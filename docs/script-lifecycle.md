---
sidebar_position: 2
title: Script Lifecycle
description: Script metadata, configuration, and lifecycle management
---

# Script Lifecycle

## `hexis.script(metadata)`

Defines script metadata. Must be called before `hexis.main()`.

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `name` | string | Yes | Display name in Hexis menu |
| `description` | string | Yes | Script description |
| `author` | string | No | Script author |
| `version` | string | No | Version string (e.g., "1.0.0") |
| `category` | string | No | Category folder (e.g., "farming", "combat") |
| `icon` | string | No | Icon URL for mod menu |
| `input_blocking` | table | No | Input blocking configuration |
| `staff_detection` | boolean | No | Enable staff detection auto-disable |

### Icon URL

The `icon` field allows you to specify a custom icon for your script in the mod menu. The recommended format is to use the Coflnet Skyblock icon API:

```lua
icon = "https://sky.coflnet.com/static/icon/ITEM_ID"
```

**Common item IDs:**
- Combat: `SUMMONING_EYE`, `ASPECT_OF_THE_DRAGONS`, `REVENANT_VISCERA`
- Farming: `THEORETICAL_HOE_WHEAT_3`, `ENCHANTED_SUGAR_CANE`, `ENCHANTED_GOLDEN_CARROT`
- Mining: `DIVAN_DRILL`, `MITHRIL_ORE`, `PERFECT_RUBY_GEM`
- Foraging: `TREECAPITATOR_AXE`
- Fishing: `ROD_OF_THE_SEA`

### Input Blocking Options

```lua
input_blocking = {
    block_camera = true,      -- Prevent player camera movement
    block_movement = true,    -- Prevent WASD movement
    block_item_change = true, -- Prevent hotbar slot changes
    block_inventory = false   -- Prevent opening inventory
}
```

---

## `hexis.config(options)`

Defines GUI configuration options. Creates sliders, toggles, and dropdowns in Hexis menu.

```lua
hexis.config({
    {
        id = "hunt_radius",
        label = "Hunt Radius",
        type = "slider",
        default = 30,
        min = 10,
        max = 50,
        step = 1           -- Optional
    },
    {
        id = "auto_sell",
        label = "Auto Sell",
        type = "toggle",
        default = true
    },
    {
        id = "weapon",
        label = "Weapon",
        type = "dropdown",
        default = "Juju Shortbow",
        options = {"Juju Shortbow", "Terminator", "Hyperion"}
    }
})
```

### Config Types

| Type | Description | Extra Fields |
|------|-------------|--------------|
| `slider` | Numeric slider | `min`, `max`, `step` (optional) |
| `toggle` | On/off toggle | None |
| `dropdown` | Selection list | `options` (array of strings) |

### Accessing Config Values

```lua
local range = hexis.config.get("hunt_radius")
local auto_sell = hexis.config.get("auto_sell")
```

---

## Script Stop Behavior

When a script stops (error or `hexis.script.stop()`):

1. Combat loop stops
2. Movement stops
3. Camera control released
4. Input blocking disabled
5. Staff detection disabled
6. HUD hidden

All cleanup is automatic - you don't need to manually stop anything.

---
sidebar_position: 1
slug: /
title: Getting Started
description: Introduction to the Hexis Lua scripting API
---

# Hexis Lua API Reference

**Version:** 0.7.95
**Engine:** LuaJ (Lua 5.2 compatible)
**Last Updated:** January 2026

---

## Overview

Hexis uses Lua for scripting automation. Scripts are placed in:

```
config/hexis/scripts/
```

## Script Structure

Every script must call `hexis.script()` with metadata and define a main entry point:

```lua
-- Define script metadata
hexis.script({
    name = "My Script",
    description = "What this script does",
    author = "YourName",
    version = "1.0.0",
    category = "farming",

    -- Optional: Custom icon for mod menu (use Coflnet item IDs)
    icon = "https://sky.coflnet.com/static/icon/THEORETICAL_HOE_WHEAT_3",

    -- Optional: Input blocking while script runs
    input_blocking = {
        block_camera = true,
        block_movement = true,
        block_item_change = true,
        block_inventory = false
    },

    -- Optional: Staff detection auto-disable
    staff_detection = true
})

-- Define configuration options (creates GUI sliders/toggles)
hexis.config({
    {
        id = "attack_range",
        label = "Attack Range",
        type = "slider",
        default = 5,
        min = 1,
        max = 10
    }
})

-- Main function - called when script starts
function hexis.main()
    hexis.log.info("Script started!")

    while hexis.running() do
        -- Your logic here
        hexis.sleep(1000)
    end

    hexis.log.info("Script stopped!")
end
```

## What's Next?

- **[Script Lifecycle](./script-lifecycle)** - Learn about script metadata and configuration
- **[Core API](./api/core)** - Essential functions like `running()` and `sleep()`
- **[Player API](./api/player)** - Player information and hotbar access
- **[Navigation API](./api/navigation)** - Pathfinding and movement
- **[Quick Reference](./quick-reference)** - Common patterns at a glance

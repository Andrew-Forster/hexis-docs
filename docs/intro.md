---
sidebar_position: 1
slug: /
title: Introduction
description: Introduction to the Hexis Lua scripting API
---

# Hexis Documentation

Welcome to the Hexis documentation. Hexis is a powerful Lua scripting engine for Minecraft that enables intelligent automation through a comprehensive API.

**Current Version:** 1.0.0
**Minecraft:** 1.21.8 (Fabric)
**Lua Engine:** LuaJ (Lua 5.2 compatible)

---

## New to Hexis?

If you're just getting started, follow these steps:

1. **[Install Hexis](/getting-started/installation)** - Set up Fabric and install the mod
2. **[Script Lifecycle](/script-lifecycle)** - Understand how scripts work
3. **[Quick Reference](/quick-reference)** - See common patterns at a glance

---

## Your First Script

Scripts are Lua files placed in `.minecraft/config/hexis/scripts/`. Here's a minimal example:

```lua
hexis.script({
    name = "Hello World",
    description = "My first script",
    author = "YourName",
    version = "1.0.0"
})

function hexis.main()
    hexis.log.info("Hello, Hexis!")

    while hexis.running() do
        -- Your automation logic here
        hexis.wait(1)
    end

    hexis.log.info("Goodbye!")
end
```

Press **Right Shift** in-game to open the Hexis menu and run your script.

---

## API Overview

Hexis provides a rich set of APIs organized by functionality:

### Core
- **[Core API](/api/core)** - Script control (`running()`, `sleep()`, `wait()`)
- **[Logging](/utilities/logging)** - Debug output and notifications
- **[Timer](/utilities/timer)** - Session timing and stopwatch
- **[Variables](/utilities/variables)** - Runtime state storage

### Player & World
- **[Player](/api/player)** - Position, health, hotbar, inventory state
- **[World](/api/world)** - Block queries, entity detection, visualization
- **[Spatial](/api/spatial)** - Line of sight, danger analysis, walkability
- **[Conditions](/api/conditions)** - Boolean checks for game state

### Navigation
- **[Navigation](/api/navigation)** - A* pathfinding, etherwarp, movement
- **[Movement](/api/movement)** - Low-level movement control
- **[Routes](/api/routes)** - Route file loading and traversal

### Actions & Combat
- **[Actions](/api/actions)** - Jump, sneak, equip, use items
- **[Combat](/api/combat)** - Targeting, attacking, pursuit
- **[Mining](/api/mining)** - Block breaking with smart aiming

### GUI & Inventory
- **[GUI](/api/gui)** - Window interaction, item clicking
- **[Inventory](/api/inventory)** - Inventory manipulation
- **[HUD](/api/hud)** - On-screen display with variables

### Events & Communication
- **[Events](/api/events)** - Sound, chat, and timer listeners
- **[Chat](/api/chat)** - Send messages and execute commands

---

## Example: Simple Farming Script

```lua
hexis.script({
    name = "Simple Farmer",
    description = "Farms crops in a loop",
    author = "YourName",
    version = "1.0.0",
    category = "farming"
})

hexis.config({
    hexis.config.slider("Speed", 1, 10, 5, 1)
})

function hexis.main()
    local crops_harvested = 0

    hexis.hud.create({
        width = 200,
        elements = {
            {type = "TITLE", text = "Simple Farmer"},
            {type = "STAT", label = "Harvested", value = "{crops}"}
        }
    })

    while hexis.running() do
        -- Find nearby crops
        local crops = hexis.world.scan_blocks({
            names = {"wheat", "carrots", "potatoes"},
            radius = 10
        })

        for _, crop in ipairs(crops) do
            if not hexis.running() then break end

            -- Navigate to crop
            hexis.navigate.to({x = crop.x, y = crop.y, z = crop.z, distance = 1})

            -- Break it
            hexis.mining.break_block({x = crop.x, y = crop.y, z = crop.z})

            crops_harvested = crops_harvested + 1
            hexis.hud.set_var("crops", crops_harvested)
        end

        hexis.wait(1)
    end
end
```

---

## Getting Help

- **[Discord](https://discord.gg/TNVyFgBqYz)** - Join the community for help and script sharing
- **[Best Practices](/guides/best-practices)** - Write better, safer scripts
- **[Error Handling](/guides/error-handling)** - Debug common issues

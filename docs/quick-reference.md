---
sidebar_position: 100
title: Quick Reference
description: Common patterns and frequently used code snippets
---

# Quick Reference

Common patterns for Hexis scripting.

---

## Main Loop Pattern

```lua
while hexis.running() do
    -- logic
    hexis.wait(0.1)
end
```

---

## Check and Equip Item

```lua
if hexis.inventory.contains("scythe") then
    hexis.player.equip({name = "scythe"})
end
```

---

## Combat Loop

```lua
hexis.combat.start({targets = {"Enderman"}, style = "ranged"})
-- Later...
hexis.combat.stop()
```

---

## Navigate and Wait

```lua
hexis.navigate.to({x = 100, y = 64, z = 200})
```

---

## GUI Interaction

```lua
hexis.gui.safe_mode()
hexis.gui.open()
hexis.wait(0.3)
hexis.gui.click_item({name = "Confirm"})
hexis.gui.close()
```

---

## Inventory Management

```lua
-- Select a slot
hexis.inventory.select_slot(0)

-- Find an item
local slot = hexis.inventory.find_slot("aspect")
if slot >= 0 then
    hexis.inventory.select_slot(slot)
end

-- Check if inventory is full
if hexis.inventory.is_full() then
    hexis.log.warn("Full!")
end
```

---

## Player Actions

```lua
-- Use held item (right-click)
hexis.player.use_item()

-- Drop item
hexis.player.drop_item()

-- Interact with a block
hexis.player.interact_block({x = 100, y = 65, z = 200})

-- Look at position
hexis.player.look_at({x = 100, y = 65, z = 200, speed = 2.0})

-- Sprint
hexis.player.sprint({enabled = true})

-- Check potion effects
local haste = hexis.player.get_effect("haste")
if haste then hexis.log.info("Haste " .. haste.level) end
```

---

## World Highlights

```lua
-- Highlight a block
hexis.world.highlight.block({x = 100, y = 65, z = 200}, {r = 1, g = 0, b = 0, a = 0.6})

-- Zone box (two corners, custom fill/border/thickness)
local id = hexis.world.highlight_zone(
    {x = 90, y = 60, z = 190},
    {x = 110, y = 70, z = 210},
    { fill = {r = 0, g = 1, b = 0, a = 0.1}, border = {r = 0, g = 1, b = 0, a = 0.8} }
)
hexis.world.remove_zone_highlight(id)  -- Remove later

-- World text
hexis.world.text_at({x = 100, y = 66, z = 200}, "Target")

-- Clear all highlights
hexis.world.highlight.clear()
```

---

## Event Listener

```lua
hexis.events.on("sound", "experience_orb", function()
    kills = kills + 1
    hexis.hud.set_var("kills", kills)
end)

-- Tick event
hexis.events.on("tick", nil, function()
    -- runs every game tick
end)
```

---

## HUD Setup

```lua
hexis.hud.create({
    title = "My Script",
    elements = {
        {type = "stat", label = "Kills", value = "{kills}"},
        {type = "stat", label = "Time", value = "{elapsed_time}"},
    }
})

hexis.hud.set_var("kills", 0)
hexis.hud.show()
```

---

## Mining Loop

```lua
hexis.mining.start_loop({
    id = "farming",
    max_distance = 50,
    aim_speed = 2.5,
    chain_mining = true
})
-- Later...
hexis.mining.stop_loop()
```

---

## Load Libraries

```lua
local tree_mining = require("hypixel/lib/tree_mining")
local island_nav = require("hypixel/lib/island_nav")
```

---

## Route Loading

```lua
local route = hexis.routes.load("foraging/park/Park_Foraging")
if route then
    hexis.log.info("Loaded: " .. route.name)
    hexis.log.info("Blocks: " .. route.block_count)
end
```

---

## Error Handling

```lua
local success, err = pcall(function()
    hexis.navigate.to({x = 0, y = 0, z = 0})
end)

if not success then
    hexis.log.error("Navigation failed: " .. tostring(err))
end
```

---

## Logging

```lua
hexis.log.info("Information message")
hexis.log.debug("Debug message")       -- Only in debug mode
hexis.log.warn("Warning message")
hexis.log.error("Error message")
```

---

## Timer

```lua
hexis.timer.start()
-- ... do stuff ...
hexis.log.info("Elapsed: " .. hexis.timer.formatted())
hexis.timer.stop()
```

---

## Format Numbers

```lua
hexis.format.duration(123)      -- "2m 3s"
hexis.format.number(15320)      -- "15.3k"
hexis.format.coins(15320)       -- "15.3k"
```

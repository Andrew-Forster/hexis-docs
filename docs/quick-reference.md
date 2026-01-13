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
    hexis.sleep(100)
end
```

---

## Check and Equip Item

```lua
if hexis.player.hotbar_contains("scythe") then
    hexis.actions.equip({name = "scythe"})
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
hexis.sleep(300)
hexis.gui.click_item({name = "Confirm"})
hexis.gui.close()
```

---

## Event Listener

```lua
hexis.events.on("sound", "experience_orb", function()
    kills = kills + 1
    hexis.hud.set_var("kills", kills)
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

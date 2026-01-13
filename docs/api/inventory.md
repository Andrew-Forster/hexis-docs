---
sidebar_position: 7
title: Inventory
description: Inventory and hotbar management
---

# Inventory API

:::note API Status
Currently inventory operations are split between `hexis.player` (hotbar) and `hexis.gui` (containers). A unified `hexis.inventory` API is planned.
:::

---

## Hotbar Operations

### Checking Items

```lua
-- Check if item exists
if hexis.player.hotbar_contains("scythe") then
    hexis.log.info("Has a scythe!")
end

-- Supports regex patterns
if hexis.player.hotbar_contains("juju|terminator") then
    hexis.log.info("Has a bow!")
end
```

### Finding Slots

```lua
-- Find the slot of an item
local slot = hexis.player.find_hotbar_slot("scythe")
if slot >= 0 then
    hexis.log.info("Scythe in slot " .. slot)
end
```

### Listing Items

```lua
-- Get all hotbar items
local items = hexis.player.get_hotbar_items()
for i, name in ipairs(items) do
    if name then
        hexis.log.info("Slot " .. i .. ": " .. name)
    end
end
```

### Equipping Items

```lua
-- Equip by pattern
hexis.actions.equip({pattern = "scythe"})

-- Equip by name
hexis.actions.equip({name = "Juju Shortbow"})

-- Multiple fallbacks (tries in order)
hexis.actions.equip({pattern = "scythe|sword"})
```

---

## Container Operations

Container operations require the GUI to be open.

```lua
-- Open inventory
hexis.gui.safe_mode()
hexis.gui.open()
hexis.sleep(300)

-- Find an item
local slot = hexis.gui.find({name = "Diamond Sword"})
if slot then
    hexis.gui.click(slot)
end

-- Close when done
hexis.gui.close()
```

---

## Example: Full Inventory Workflow

```lua
-- Check hotbar first
if hexis.player.hotbar_contains("scythe") then
    -- Already have it, just equip
    hexis.actions.equip({pattern = "scythe"})
else
    -- Need to get from inventory
    hexis.gui.safe_mode()
    hexis.gui.open()
    hexis.sleep(300)

    local slot = hexis.gui.find({name = "Scythe"})
    if slot then
        -- Move to hotbar
        hexis.gui.click(slot)
        hexis.sleep(100)
        hexis.gui.switch_hotbar(0)
        hexis.gui.click(slot)
    end

    hexis.gui.close()
end
```

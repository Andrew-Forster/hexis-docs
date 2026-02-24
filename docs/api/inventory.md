---
sidebar_position: 7
title: Inventory
description: Inventory and hotbar management
---

# Inventory API

Namespace: `hexis.inventory`

Manage the player's hotbar and inventory state.

---

## Properties (Read-Only)

| Property | Type | Description |
|----------|------|-------------|
| `hexis.inventory.held_slot` | number | Current selected hotbar slot (0-8) |
| `hexis.inventory.held_item` | string | Name of held item (or nil) |

```lua
local slot = hexis.inventory.held_slot
local item = hexis.inventory.held_item
hexis.log.info("Slot " .. slot .. ": " .. (item or "empty"))
```

---

## Methods

### `hexis.inventory.select_slot(n)`

Select a hotbar slot (0-8).

```lua
hexis.inventory.select_slot(0)  -- Select first slot
hexis.inventory.select_slot(8)  -- Select last slot
```

### `hexis.inventory.find_slot(pattern)`

Find the first hotbar slot matching a pattern. Returns slot index (0-8) or -1 if not found.

- Pattern is case-insensitive
- Supports partial matching
- Supports regex if pattern contains `|` or starts with `^`

```lua
local slot = hexis.inventory.find_slot("aspect")
if slot >= 0 then
    hexis.log.info("Aspect of the End in slot " .. slot)
    hexis.inventory.select_slot(slot)
end

-- Regex pattern
local bow_slot = hexis.inventory.find_slot("juju|terminator")
```

### `hexis.inventory.contains(pattern)`

Returns `true` if any hotbar slot contains an item matching the pattern.

```lua
if hexis.inventory.contains("scythe") then
    hexis.log.info("Has a scythe!")
end

-- Regex pattern
if hexis.inventory.contains("juju|terminator") then
    hexis.log.info("Has a bow!")
end
```

### `hexis.inventory.get_hotbar_items()`

Returns a table of all hotbar item names (1-indexed, Lua style).

```lua
local items = hexis.inventory.get_hotbar_items()
for i, name in ipairs(items) do
    if name then
        hexis.log.info("Slot " .. i .. ": " .. name)
    end
end
```

### `hexis.inventory.is_full()`

Returns `true` if the player's inventory is full.

```lua
if hexis.inventory.is_full() then
    hexis.log.warn("Inventory full! Need to sell.")
end
```

### `hexis.inventory.open()`

Opens the player inventory screen.

```lua
hexis.inventory.open()
hexis.wait(0.3)
```

### `hexis.inventory.close()`

Closes the current GUI/inventory screen.

```lua
hexis.inventory.close()
```

---

## Example: Equip Workflow

```lua
-- Check hotbar first
if hexis.inventory.contains("scythe") then
    hexis.player.equip({pattern = "scythe"})
else
    -- Need to get from inventory
    hexis.gui.safe_mode()
    hexis.inventory.open()
    hexis.wait(0.3)

    local slot = hexis.gui.find({name = "Scythe"})
    if slot then
        hexis.gui.click(slot)
        hexis.wait(0.1)
        hexis.gui.switch_hotbar(0)
        hexis.gui.click(slot)
    end

    hexis.inventory.close()
end
```

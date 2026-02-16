---
sidebar_position: 6
title: GUI
description: Container and inventory interactions
---

# GUI API

Namespace: `hexis.gui`

:::warning Movement Restriction
GUI operations require the inventory/container to be OPEN. The player CANNOT move while interacting with GUIs. This is enforced automatically.
:::

---

## Safe Mode

### `hexis.gui.safe_mode()`

Stops ALL activity (combat, movement, camera) before GUI interaction.

**Call this before any GUI operation to ensure clean state.**

```lua
hexis.gui.safe_mode()
hexis.gui.open()
```

---

## Opening/Closing

### `hexis.gui.open()`

Opens player inventory.

```lua
hexis.gui.safe_mode()
hexis.gui.open()
hexis.sleep(300)
```

### `hexis.gui.close()`

Closes current GUI.

```lua
hexis.gui.close()
```

### `hexis.gui.wait_for(title, timeout)`

Waits for a GUI with matching title to open.

```lua
hexis.gui.wait_for("Bazaar", 5000)  -- Wait up to 5 seconds
```

---

## State Checks

### `hexis.gui.is_open()`

Returns `true` if any GUI screen is open.

```lua
if hexis.gui.is_open() then
    hexis.log.info("GUI is open")
end
```

### `hexis.gui.get_title()`

Returns current GUI title, or nil if none open.

```lua
local title = hexis.gui.get_title()
if title then
    hexis.log.info("Current GUI: " .. title)
end
```

### `hexis.gui.has_title(pattern)`

Returns `true` if current GUI title contains pattern.

```lua
if hexis.gui.has_title("Bazaar") then
    hexis.log.info("Bazaar is open!")
end
```

### `hexis.gui.get_hovered_item()`

Returns information about the item currently under the cursor, or nil if no item is hovered.

```lua
local item = hexis.gui.get_hovered_item()
if item then
    hexis.log.info("Hovering: " .. item.name)
end
```

---

## Finding Items

### `hexis.gui.find(options)`

Finds an item in current GUI.

```lua
local slot = hexis.gui.find({
    name = "Diamond",           -- Item name (partial match)
    lore = "Click to buy",     -- Lore text (partial match)
    type = "hopper"            -- Item type
})

if slot then
    hexis.log.info("Found in slot " .. slot)
end
```

### `hexis.gui.get_slot_info(slot)`

Gets detailed information about a slot.

Returns a table with: `id`, `name`, `type`, `row`, `col`, `color`, `empty`, `lore`

```lua
local info = hexis.gui.get_slot_info(5)
if info then
    hexis.log.info("Slot 5 has: " .. info.name)
end
```

---

## Clicking

### `hexis.gui.click(slot)`

Clicks a slot by index.

```lua
hexis.gui.click(slot)
hexis.sleep(200)  -- Wait for response
```

### `hexis.gui.click_item(options)`

Find and click an item in one step.

```lua
hexis.gui.click_item({
    name = "Confirm",
    required = true,      -- Fail if not found
    action = "shift",     -- "shift" or "right"
    delay = 0.2           -- Delay after click
})
```

### `hexis.gui.click_item_by_lore(pattern)`

Find and click item by lore text.

```lua
hexis.gui.click_item_by_lore("Click to sell")
```

---

## Hotbar

### `hexis.gui.switch_hotbar(slot)`

Switches to hotbar slot (0-8).

```lua
hexis.gui.switch_hotbar(0)  -- Switch to first slot
```

---

## Example Usage

```lua
-- Open bazaar and buy item
hexis.gui.safe_mode()
hexis.chat.command("/bz")
hexis.gui.wait_for("Bazaar", 5000)

local slot = hexis.gui.find({name = "Buy Instantly"})
if slot then
    hexis.gui.click(slot)
    hexis.sleep(300)
    hexis.gui.click_item({name = "Confirm", required = true})
end

hexis.gui.close()
```

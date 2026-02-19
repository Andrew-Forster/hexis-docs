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

Gets detailed information about a single slot.

Returns a table with: `id`, `name`, `type`, `row`, `col`, `color`, `empty`, `lore`, `count`, `has_glint`

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Slot index |
| `name` | string | Item display name |
| `type` | string | Item type identifier |
| `row` | number | Row in container (0-indexed) |
| `col` | number | Column in container (0-indexed) |
| `color` | string | Dyed color name ("red", "blue", etc. or "none") |
| `empty` | boolean | Whether slot is empty |
| `count` | number | Stack size (0 if empty) |
| `has_glint` | boolean | Whether item has enchantment glint (foil effect) |
| `lore` | table | Array of lore line strings |

```lua
local info = hexis.gui.get_slot_info(5)
if info and not info.empty then
    hexis.log.info("Slot 5: " .. info.name .. " x" .. info.count)
    if info.has_glint then
        hexis.log.info("  Has enchantment glint!")
    end
end
```

### `hexis.gui.get_slots(from, to)`

Bulk-scans a range of slots and returns an array of slot info tables. Each entry has the same fields as `get_slot_info`.

```lua
-- Scan all container slots (e.g., first 54 slots of a double chest)
local slots = hexis.gui.get_slots(0, 53)
for _, slot in ipairs(slots) do
    if not slot.empty and slot.has_glint then
        hexis.log.info("Glinting item at slot " .. slot.id .. ": " .. slot.name)
    end
end
```

### `hexis.gui.get_container_size()`

Returns the number of container slots (excluding player inventory). Useful to know the range for `get_slots`.

```lua
local size = hexis.gui.get_container_size()
local slots = hexis.gui.get_slots(0, size - 1)
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

## Slot Watcher

Main-thread slot watcher for detecting item changes in real-time. Useful for games like Chronomatron where items change too fast for cross-thread polling to catch.

The watcher runs on the main client tick thread, detecting changes via both individual slot packets and bulk content packets. Changes are queued and consumed from Lua via `poll_slot_changes()`.

### `hexis.gui.watch_slots(slot_ids)`

Start watching specific slots for item changes.

| Parameter | Type | Description |
|-----------|------|-------------|
| `slot_ids` | table | Array of slot indices to watch |

```lua
-- Watch slots 12, 13, 14 and the control slot
hexis.gui.watch_slots({12, 13, 14, 49})
```

### `hexis.gui.poll_slot_changes()`

Drains all pending slot change events from the watcher queue. Returns an array of change tables.

Each change table has:

| Field | Type | Description |
|-------|------|-------------|
| `slot` | number | Slot index that changed |
| `type` | string | Item type identifier |
| `name` | string | Item display name |
| `has_foil` | boolean | Whether item has enchantment glint |

```lua
local changes = hexis.gui.poll_slot_changes()
for _, c in ipairs(changes) do
    if c.has_foil then
        hexis.log.info("Slot " .. c.slot .. " gained foil: " .. c.name)
    end
end
```

### `hexis.gui.stop_watching()`

Stops the slot watcher and clears all state.

```lua
hexis.gui.stop_watching()
```

:::tip When to Use
Use the slot watcher when you need to detect **transient** item changes that happen faster than your script's poll rate. For static reads, `get_slot_info()` is simpler and sufficient.
:::

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

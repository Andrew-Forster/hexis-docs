---
sidebar_position: 1
title: Best Practices
description: Guidelines for writing effective and safe scripts
---

# Best Practices

## Human-Like Behavior

To appear human and avoid detection:

- **Use variable delays** - Don't use fixed 100ms everywhere
- **Don't move camera instantly** - Use smooth aim speeds
- **Include occasional pauses** - Random micro-breaks
- **Vary attack timing** - Don't attack at exact intervals

```lua
-- Bad: Fixed timing
hexis.sleep(100)

-- Good: Variable timing
hexis.sleep(math.random(80, 150))
```

---

## Movement + Inventory

**You cannot walk while inventory is open.**

The **GUI Interaction Guard** automatically enforces safety when you click in a container:
- First click is delayed 200-500ms after the container opens (prevents ChestStealer detection)
- Consecutive clicks have a 100-150ms minimum gap
- Pathfinder, camera tracking, and movement keys are automatically stopped on first click
- Movement stays blocked until the container closes

```lua
-- Safe by default — no manual delays needed
hexis.chat.command("/bz")
hexis.gui.wait_for("Bazaar", 5)
hexis.gui.click_item({ name = "Buy Instantly" })  -- Auto-delayed safely
hexis.wait(0.3)
hexis.gui.click_item({ name = "Confirm", required = true })
hexis.gui.close()
```

For minigame scripts that need fast clicking (Harp, Chronomatron), use `unsafe = true`:

```lua
hexis.gui.click({ slot = note_slot, unsafe = true })  -- Skip inter-click delay
```

:::note
`hexis.gui.safe_mode()` is still available but mostly redundant — only needed if you want to stop movement **before** opening a container.
:::

---

## Staff Detection

When `staff_detection = true` in script metadata:
- Monitors for staff activity
- Auto-disables script if detected
- Sends system notification

Pause/resume manually around warps:

```lua
hexis.script.pause_staff_detection()
hexis.chat.command("/hub")
hexis.sleep(5000)  -- Wait for teleport
hexis.script.resume_staff_detection()
```

---

## Resource Cleanup

Scripts automatically clean up when stopped, but for long-running scripts:

```lua
-- Register cleanup for event listeners
local sound_id = hexis.events.on("sound", "pattern", handler)

-- Later, if you need to remove it:
hexis.events.remove(sound_id)

-- Or clear all events:
hexis.events.clear()
```

---

## Efficient Loops

Use `yield()` in tight loops to prevent freezing:

```lua
for i = 1, 1000 do
    -- Processing
    if i % 100 == 0 then
        hexis.yield()  -- Let other things run
    end
end
```

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

The script will automatically stop all movement when opening GUIs:
- Pathfinder stops
- Movement keys released
- Camera control released

Always call `hexis.gui.safe_mode()` before GUI operations:

```lua
hexis.gui.safe_mode()  -- Stop all activity first
hexis.gui.open()
hexis.sleep(300)
-- ... GUI operations ...
hexis.gui.close()
```

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

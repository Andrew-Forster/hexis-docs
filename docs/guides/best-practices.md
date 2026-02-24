---
sidebar_position: 1
title: Best Practices
description: Guidelines for writing effective and safe scripts
---

# Best Practices

## Pick the Right Function

The most common source of bugs is using the wrong API for the job. Before writing any logic, ask yourself:

- **Am I breaking a block?** Use `hexis.mining.*`
- **Am I walking somewhere?** Use `hexis.navigate.*`
- **Am I interacting with an entity?** Use `hexis.player.interact_entity()`
- **Am I clicking in a menu?** Use `hexis.gui.*`

See [Choosing the Right Function](/guides/choosing-functions) for a full decision tree.

---

## Navigation Patterns

### Use `start_async` for production scripts

Most working scripts use `start_async()` instead of `to()` because it lets you handle interrupts during navigation:

```lua
hexis.navigate.start_async({
    x = target.x, y = target.y, z = target.z,
    distance = 2.0
})

while hexis.navigate.is_navigating() do
    if not hexis.script.is_running() then return end
    -- Can check for competition events, danger, etc.
    hexis.wait(0.05)
end
```

### Use `near()` for solid blocks

When approaching something you'll interact with (chest, NPC area, TNT), use `near()` — it validates line-of-sight and exposed faces:

```lua
hexis.navigate.near({
    x = chest.x, y = chest.y, z = chest.z,
    range = 3.0
})
```

### Always check `is_running()` in wait loops

Every polling loop should have an exit condition:

```lua
-- Good: Can be stopped cleanly
while hexis.navigate.is_navigating() do
    if not hexis.script.is_running() then return end
    hexis.wait(0.05)
end

-- Bad: Blocks forever if script is stopped
while not hexis.navigate.arrived() do
    hexis.wait(0.1)
end
```

---

## Mining Patterns

### Use sessions for multi-block mining

Sessions keep the attack key held between blocks, preventing camera stutter:

```lua
hexis.mining.start_session()
for _, block in ipairs(blocks) do
    if not hexis.script.is_running() then break end
    hexis.mining.mine_block({x = block.x, y = block.y, z = block.z})
end
hexis.mining.end_session()
```

### Prefer `mine_block()` over async primitives

`mine_block()` handles the full pipeline (vantage finding, navigation, aiming, mining). The async primitives (`start_mining_async`, `aim_tick`) are deprecated — only use them if you need frame-by-frame control.

---

## Human-Like Behavior

To appear human and avoid detection:

- **Use variable delays** — Don't use fixed 100ms everywhere
- **Don't move camera instantly** — Use smooth aim speeds
- **Include occasional pauses** — Random micro-breaks
- **Vary attack timing** — Don't attack at exact intervals

```lua
-- Bad: Fixed timing
hexis.wait(0.1)

-- Good: Variable timing
hexis.wait(math.random(80, 150) / 1000)
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

## Entity Interaction

Hypixel NPCs are armor stands. Find them by name, then interact:

```lua
local entities = hexis.world.get_nearby_entities(6, {type = "armor_stand"})
for _, entity in ipairs(entities) do
    if entity.name and entity.name:find("Emissary") then
        hexis.player.look_at(entity)
        hexis.wait(0.2)
        hexis.player.interact_entity(entity.id)
        break
    end
end
```

:::warning
`get_nearby_entities` requires a **table** for the filter parameter: `{type = "armor_stand"}`, not just the string `"armor_stand"`.
:::

---

## Timing

All timing in Hexis uses **seconds**, never milliseconds.

```lua
hexis.wait(1.5)           -- 1.5 seconds
hexis.wait(0.05)          -- 50 milliseconds
hexis.wait(500)           -- THIS IS 500 SECONDS, not 500ms!
```

For random delays, divide by 1000:

```lua
hexis.wait(math.random(200, 500) / 1000)  -- 200-500ms
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
hexis.wait(5.0)  -- Wait for teleport
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

---

## Script Structure

For complex scripts, use a state machine pattern. It's easier to debug and extend than deeply nested if/else chains:

```lua
local state = "setup"

local handlers = {
    setup = function() --[[ ... ]] return "navigate" end,
    navigate = function() --[[ ... ]] return "mine" end,
    mine = function() --[[ ... ]] return "navigate" end,
}

function hexis.main()
    while hexis.script.is_running() do
        state = handlers[state]()
        hexis.wait(0.05)
    end
end
```

See [Common Patterns](/guides/common-patterns#state-machine-pattern) for a full example.

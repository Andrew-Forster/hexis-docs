---
sidebar_position: 4
title: Common Patterns
description: Copy-paste recipes for common scripting tasks
---

# Common Patterns

Real-world recipes you can copy and adapt. Each pattern shows the recommended approach for a common scripting task.

---

## Navigate to the Nearest Location from a List

When you have multiple positions (e.g., NPC locations, warp pads) and want to walk to the closest one.

```lua
local locations = {
    {x = 42.5, y = 134, z = 21.5},
    {x = -73.5, y = 153, z = -10.5},
    {x = 89.5, y = 198, z = -92},
}

-- Find closest by Euclidean distance
local function find_closest(positions)
    local best, best_dist = nil, math.huge
    for _, pos in ipairs(positions) do
        local dist = hexis.player.distance_to(pos)
        if dist < best_dist then
            best_dist = dist
            best = pos
        end
    end
    return best, best_dist
end

local target, dist = find_closest(locations)
hexis.log.info(string.format("Closest is %.0f blocks away", dist))

-- Navigate there
hexis.navigate.near({
    x = target.x, y = target.y, z = target.z,
    range = 4.0
})

while hexis.navigate.is_navigating() do
    if not hexis.script.is_running() then return end
    hexis.wait(0.05)
end
```

:::tip
Use `navigate.near()` when approaching a solid block or NPC area. Use `navigate.to()` when you want to stand at the exact coordinates.
:::

---

## Find and Interact with an NPC

Most Hypixel NPCs are armor stands. Find them by name, look at them, and right-click.

```lua
local function interact_with_npc(name_pattern, search_radius)
    search_radius = search_radius or 6

    local entities = hexis.world.get_nearby_entities(search_radius, {type = "armor_stand"})
    if not entities then return false end

    for _, entity in ipairs(entities) do
        if entity.name and entity.name:find(name_pattern) then
            hexis.player.look_at(entity)
            hexis.wait(0.2)
            hexis.player.interact_entity(entity.id)
            return true
        end
    end

    hexis.log.warn("NPC not found: " .. name_pattern)
    return false
end

-- Usage
interact_with_npc("Emissary")
interact_with_npc("Bazaar")
```

---

## Use an Item (Royal Pigeon, Warp Items)

Equip an item from the hotbar and use it.

```lua
local function use_item_by_name(item_name)
    local slot = hexis.inventory.find_slot(item_name)
    if not slot or slot < 0 then
        hexis.log.warn(item_name .. " not found in hotbar")
        return false
    end

    hexis.inventory.select_slot(slot)
    hexis.wait(0.2)
    hexis.player.use_item()
    return true
end

-- Usage
if use_item_by_name("Royal Pigeon") then
    hexis.wait(1.0)  -- Wait for teleport
    hexis.log.info("Teleported via pigeon")
end
```

---

## Claim Items from a GUI

Open a menu, find items matching a pattern, click them, close.

```lua
local function claim_from_gui(menu_title, item_name, lore_pattern, timeout)
    timeout = timeout or 3

    hexis.gui.wait_for(menu_title, timeout)
    if not hexis.gui.has_title(menu_title) then
        hexis.log.warn(menu_title .. " did not open")
        return 0
    end

    hexis.wait(math.random(500, 1000) / 1000)

    local claimed = 0
    while true do
        local slot = hexis.gui.find({
            name = item_name,
            lore = lore_pattern,
        })
        if not slot or slot < 0 then break end

        hexis.gui.click(slot)
        claimed = claimed + 1
        hexis.wait(math.random(300, 600) / 1000)
    end

    hexis.gui.close()
    return claimed
end

-- Usage
local count = claim_from_gui("Commissions", "Commission", "Click to claim")
hexis.log.info("Claimed " .. count .. " commissions")
```

---

## Mine Blocks from a Scan

Scan for blocks, find the nearest reachable one, mine it.

```lua
local function mine_scanned_blocks(patterns, radius)
    local blocks = hexis.world.scan_blocks({
        match_patterns = patterns,
        radius = radius or 30
    })

    if #blocks == 0 then
        hexis.log.info("No blocks found")
        return false
    end

    hexis.log.info("Found " .. #blocks .. " blocks")

    -- Find and navigate to nearest reachable
    local result = hexis.mining.mine_nearest({
        targets = blocks,
        async = true,
        max_nodes = 100000,
        allow_jump_mine = true
    })

    if not result.success then
        hexis.log.warn("No reachable block: " .. (result.failure_reason or "unknown"))
        return false
    end

    -- Wait for navigation
    while hexis.navigate.is_navigating() do
        if not hexis.script.is_running() then return false end
        hexis.wait(0.05)
    end

    -- Mine it
    local mine_result = hexis.mining.mine_block({
        x = result.target.x,
        y = result.target.y,
        z = result.target.z,
        navigate = false  -- Already at vantage
    })

    return mine_result.success
end

-- Usage
mine_scanned_blocks({"diamond_ore", "deepslate_diamond_ore"}, 40)
```

---

## Multi-Block Mining Session

Mine multiple blocks efficiently with smooth transitions.

```lua
local function mine_block_list(blocks)
    if #blocks == 0 then return 0 end

    local mined = 0
    hexis.mining.start_session()

    for _, block in ipairs(blocks) do
        if not hexis.script.is_running() then break end

        local result = hexis.mining.mine_block({
            x = block.x, y = block.y, z = block.z,
            timeout = 5.0,
            navigate = true
        })

        if result.success then
            mined = mined + 1
            hexis.hud.set_var("mined", mined)
        else
            hexis.log.debug("Skipped block: " .. result.reason)
        end
    end

    hexis.mining.end_session()
    return mined
end
```

---

## Async Navigation with Interrupts

Navigate somewhere but stay responsive to events (competition, danger).

```lua
local interrupted = false

-- Listen for danger while navigating
local danger_id = hexis.events.on("chat", "DANGER", function()
    interrupted = true
    hexis.navigate.stop()
end)

-- Start async navigation
hexis.navigate.start_async({
    x = target.x, y = target.y, z = target.z,
    distance = 2.0
})

-- Poll loop with interrupt checking
while hexis.navigate.is_navigating() do
    if not hexis.script.is_running() then break end
    if interrupted then
        hexis.log.warn("Navigation interrupted!")
        break
    end
    hexis.wait(0.05)
end

hexis.events.remove(danger_id)
```

---

## Warp with Staff Detection Pause

Safely teleport without triggering staff detection false positives.

```lua
local function safe_warp(command, wait_time)
    wait_time = wait_time or 5.0

    hexis.script.pause_staff_detection()
    hexis.chat.command(command)
    hexis.wait(wait_time)
    hexis.script.resume_staff_detection()
end

-- Usage
safe_warp("/hub")
safe_warp("/warp mines", 3.0)
```

---

## HUD with Multiple States

Set up a HUD that changes based on what your script is doing.

```lua
hexis.hud.create({position = "top-right", width = 260})

hexis.hud.add_state("idle", {
    elements = {
        {type = "title", value = "Commission Macro", subtitle = "Idle"},
        {type = "stat", label = "Claimed", value = "{claimed}"},
        {type = "stat", label = "Time", value = "{elapsed_time}"},
    }
})

hexis.hud.add_state("navigating", {
    elements = {
        {type = "title", value = "Commission Macro", subtitle = "Walking..."},
        {type = "stat", label = "Target", value = "{target_name}"},
        {type = "stat", label = "Distance", value = "{distance}"},
    }
})

hexis.hud.add_state("claiming", {
    elements = {
        {type = "title", value = "Commission Macro", subtitle = "Claiming"},
        {type = "stat", label = "Claimed", value = "{claimed}"},
    }
})

hexis.hud.set_state("idle")
hexis.hud.show()
hexis.hud.start_timer()

-- Switch states as your script progresses
hexis.hud.set_state("navigating")
hexis.hud.set_var("target_name", "Emissary #3")
-- ...later...
hexis.hud.set_state("claiming")
```

---

## Robust Navigation with Retry

Navigate somewhere with a fallback if the first attempt fails.

```lua
local function navigate_with_retry(target, max_attempts)
    max_attempts = max_attempts or 3

    for attempt = 1, max_attempts do
        local started = hexis.navigate.near({
            x = target.x, y = target.y, z = target.z,
            range = 4.0
        })

        if not started then
            hexis.log.warn(string.format("Nav attempt %d/%d failed to start", attempt, max_attempts))
            hexis.wait(1.0)
        else
            while hexis.navigate.is_navigating() do
                if not hexis.script.is_running() then return false end
                hexis.wait(0.05)
            end

            -- Check if we actually arrived
            local dist = hexis.player.distance_to(target)
            if dist < 6.0 then
                return true
            end

            hexis.log.warn(string.format("Still %.1f blocks away, retrying...", dist))
            hexis.navigate.clear_blacklist()
        end
    end

    hexis.log.error("Failed to reach target after " .. max_attempts .. " attempts")
    return false
end
```

---

## State Machine Pattern

Structure complex scripts as a state machine for clarity and reliability.

```lua
local STATE = {
    SETUP = "setup",
    NAVIGATE = "navigate",
    MINE = "mine",
    SELL = "sell",
}

local state = STATE.SETUP
local stats = {mined = 0}

local handlers = {
    [STATE.SETUP] = function()
        hexis.hud.set_state("active")
        hexis.hud.start_timer()
        return STATE.NAVIGATE
    end,

    [STATE.NAVIGATE] = function()
        local result = hexis.mining.mine_nearest({
            targets = get_available_blocks(),
            async = true
        })
        if not result.success then
            hexis.wait(2.0)
            return STATE.NAVIGATE
        end

        while hexis.navigate.is_navigating() do
            hexis.wait(0.05)
        end
        return STATE.MINE
    end,

    [STATE.MINE] = function()
        -- Mine the block...
        stats.mined = stats.mined + 1
        hexis.hud.set_var("mined", stats.mined)

        if hexis.inventory.is_full() then
            return STATE.SELL
        end
        return STATE.NAVIGATE
    end,

    [STATE.SELL] = function()
        -- Sell logic...
        return STATE.NAVIGATE
    end,
}

-- Main loop
function hexis.main()
    while hexis.script.is_running() do
        local handler = handlers[state]
        if handler then
            state = handler()
        else
            hexis.log.error("Unknown state: " .. state)
            break
        end
        hexis.wait(0.05)
    end
end
```

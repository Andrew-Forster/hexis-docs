---
sidebar_position: 3
title: Choosing the Right Function
description: How to pick the correct API for navigation, mining, and interaction
---

# Choosing the Right Function

Hexis has many functions that sound similar but do very different things. This guide helps you pick the right one for your task.

---

## The Golden Rule

> **Mining functions are for mining blocks. Navigation functions are for moving to places.**

If you're not breaking a block, you almost certainly want a `hexis.navigate` function, not a `hexis.mining` function.

---

## "I want to go somewhere"

Use the **Navigation API** (`hexis.navigate`).

| Situation | Function | Why |
|-----------|----------|-----|
| Walk to coordinates | [`navigate.to()`](/api/navigation#hexisnavigatetotarget) | General-purpose A* pathfinding |
| Walk near a solid block (chest, TNT, NPC) | [`navigate.near()`](/api/navigation#hexisnavigatenearoptions) | Validates line-of-sight and exposed faces |
| Walk somewhere while doing other things | [`navigate.start_async()`](/api/navigation#hexisnavigatestart_asyncoptions) | Non-blocking, you control the wait loop |
| Teleport with Aspect of the End | [`navigate.etherwarp()`](/api/navigation#etherwarp) | Etherwarp with aim handling |
| Swim underwater | [`navigate.swim_to()`](/api/navigation#hexisnavigateswim_tooptions) | Native underwater A* pathfinding |

### Example: Navigate to an NPC

```lua
-- Find the closest NPC position
local closest = nil
local closest_dist = math.huge
for _, pos in ipairs(npc_positions) do
    local dist = hexis.player.distance_to(pos)
    if dist < closest_dist then
        closest_dist = dist
        closest = pos
    end
end

-- Navigate there
hexis.navigate.near({
    x = closest.x, y = closest.y, z = closest.z,
    range = 4.0
})

while hexis.navigate.is_navigating() do
    if not hexis.script.is_running() then return end
    hexis.wait(0.05)
end
```

:::danger Common Mistake
Do NOT use `hexis.mining.mine_nearest()` to navigate to NPCs, emissaries, or any non-block position. `mine_nearest` runs A* specifically to find **minable block vantage points** — it will fail or behave unexpectedly if the targets aren't actual blocks.
:::

---

## "I want to mine a block"

Use the **Mining API** (`hexis.mining`).

| Situation | Function | Why |
|-----------|----------|-----|
| Mine one specific block | [`mining.mine_block()`](/api/mining#hexisminingmine_blockoptions) | Handles navigation + aiming + mining automatically |
| Find the nearest mineable block from a list | [`mining.mine_nearest()`](/api/mining#hexisminingmine_nearestoptions) | Multi-Target A* finds the closest reachable block by path cost |
| Pick the best block to mine (smart scoring) | [`mining.select_target_smart()`](/api/mining#hexisminingselect_target_smartoptions) | Cluster-aware, adjacency-scored target selection |
| Check if a block is reachable right now | [`mining.check_current_reach()`](/api/mining#hexisminingcheck_current_reachpos) | Quick reach check from current position |
| Mine many blocks continuously | [`mining.start_session()`](/api/mining#mining-sessions) + `mine_block()` loop | Keeps attack held between blocks for smooth transitions |

### Example: Mine Nearest Ore

```lua
-- Scan for ores
local ores = hexis.world.scan_blocks({
    match_patterns = {"diamond_ore"},
    radius = 30
})

-- Find and navigate to nearest reachable ore
local result = hexis.mining.mine_nearest({
    targets = ores,
    async = true
})

if result.success then
    -- Wait for navigation
    while hexis.navigate.is_navigating() do
        hexis.wait(0.05)
    end

    -- Mine it
    hexis.mining.mine_block({
        x = result.target.x,
        y = result.target.y,
        z = result.target.z,
        navigate = false  -- Already at vantage point
    })
end
```

---

## "I want to interact with an entity"

Use **Player API** (`hexis.player`) + **World API** (`hexis.world`).

| Situation | Function | Why |
|-----------|----------|-----|
| Find nearby entities | [`world.get_nearby_entities()`](/api/world) | Searches by radius and type |
| Look at something | [`player.look_at()`](/api/player) | Smooth camera aim |
| Right-click an entity | [`player.interact_entity()`](/api/player) | NPC interaction |
| Right-click a block | [`player.interact_block()`](/api/player) | Chest/crafting table interaction |
| Use held item | [`player.use_item()`](/api/player) | Right-click with current item |

### Example: Interact with NPC

```lua
-- Find armor stands near player (Hypixel NPCs are armor stands)
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

---

## "I want to open a menu and click items"

Use the **GUI API** (`hexis.gui`).

| Situation | Function | Why |
|-----------|----------|-----|
| Wait for a menu to open | [`gui.wait_for(title, timeout)`](/api/gui) | Blocks until menu appears |
| Find an item in a menu | [`gui.find({name, lore})`](/api/gui) | Returns slot index |
| Click a slot | [`gui.click(slot)`](/api/gui) | Clicks with anti-cheat delays built in |
| Find and click in one step | [`gui.click_item({name})`](/api/gui) | Combines find + click |
| Close the menu | [`gui.close()`](/api/gui) | Closes current container |

### Example: Claim Items from Menu

```lua
hexis.gui.wait_for("Commissions", 3)

if hexis.gui.has_title("Commissions") then
    -- Loop to claim all available items
    while true do
        local slot = hexis.gui.find({
            name = "Commission",
            lore = "Click to claim",
        })
        if not slot or slot < 0 then break end

        hexis.gui.click(slot)
        hexis.wait(math.random(400, 800) / 1000)
    end
    hexis.gui.close()
end
```

---

## Side-by-Side Comparison

### navigate.to() vs navigate.near() vs navigate.start_async()

| | `navigate.to()` | `navigate.near()` | `navigate.start_async()` |
|---|---|---|---|
| **Blocking** | Yes | No (poll with `is_navigating()`) | No (poll with `is_navigating()`) |
| **Best for** | Walking to open positions | Approaching solid blocks | Navigation while multitasking |
| **Goal type** | Air block (player standing pos) | Solid block (chest, ore, NPC area) | Any coordinates |
| **Validates LOS** | No | Yes (exposed faces + line of sight) | Optional via `reach_target` |
| **When to use** | Simple point-to-point | Interacting with blocks/nearby entities | Mining scripts, competition scripts |

### mine_nearest() vs mine_block() vs select_target_smart()

| | `mine_nearest()` | `mine_block()` | `select_target_smart()` |
|---|---|---|---|
| **Input** | List of block positions | Single block position | List of block positions |
| **Navigates** | Yes (to vantage point) | Yes (to vantage point) | No (returns info only) |
| **Mines the block** | No | Yes | No |
| **Use case** | "Which of these blocks should I mine next?" | "Mine this specific block" | "Score these blocks by mining efficiency" |
| **Returns** | Target + standing position + aim point | Success/failure + reason | Target + score + path info |

### When to use mining vs navigation

```
Do you need to break a block?
├── YES → Use hexis.mining.*
│   ├── Know which block? → mine_block()
│   ├── Have a list, need nearest? → mine_nearest()
│   └── Want smart selection? → select_target_smart() then mine_block()
│
└── NO → Use hexis.navigate.*
    ├── Going to open space? → navigate.to()
    ├── Approaching a solid block? → navigate.near()
    └── Need to do stuff while walking? → navigate.start_async()
```

---

## Common Mistakes

### Using mine_nearest to navigate

```lua
-- WRONG: mine_nearest is for mining, not navigation
local result = hexis.mining.mine_nearest({
    targets = npc_positions,  -- These aren't mineable blocks!
})

-- RIGHT: Use navigate.near for walking to locations
local closest = find_closest(npc_positions)
hexis.navigate.near({
    x = closest.x, y = closest.y, z = closest.z,
    range = 4.0
})
```

### Using navigate.to for solid blocks

```lua
-- WRONG: navigate.to targets air positions, not solid blocks
hexis.navigate.to({x = chest.x, y = chest.y, z = chest.z})

-- RIGHT: navigate.near validates LOS and exposed faces
hexis.navigate.near({
    x = chest.x, y = chest.y, z = chest.z,
    range = 3.0
})
```

### Forgetting to poll async navigation

```lua
-- WRONG: Starting async nav but never waiting
hexis.navigate.start_async({x = 100, y = 65, z = 200})
hexis.mining.mine_block({x = 100, y = 70, z = 200})  -- Player hasn't arrived yet!

-- RIGHT: Wait for navigation to complete
hexis.navigate.start_async({x = 100, y = 65, z = 200})
while hexis.navigate.is_navigating() do
    if not hexis.script.is_running() then return end
    hexis.wait(0.05)
end
-- Now safe to proceed
```

### Mining without a session (multi-block)

```lua
-- SUBOPTIMAL: Camera stutters between blocks
for _, block in ipairs(blocks) do
    hexis.mining.mine_block({x = block.x, y = block.y, z = block.z})
end

-- BETTER: Session keeps attack held for smooth transitions
hexis.mining.start_session()
for _, block in ipairs(blocks) do
    hexis.mining.mine_block({x = block.x, y = block.y, z = block.z})
end
hexis.mining.end_session()
```

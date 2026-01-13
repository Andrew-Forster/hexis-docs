---
sidebar_position: 3
title: World
description: Query and interact with the game world
---

# World API

Namespace: `hexis.world`

Query and interact with the game world.

---

## Methods

### `hexis.world.get_block(x, y, z)`

Returns information about a block at the given position.

```lua
local block = hexis.world.get_block(100, 65, 200)
if not block.is_air then
    hexis.log.info("Block type: " .. block.name)
end
```

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Block translation key (e.g., "minecraft:oak_log") |
| `is_air` | boolean | True if block is air |
| `is_solid` | boolean | True if block is solid |

### `hexis.world.is_block_air(x, y, z)`

Quick check if a block is air.

```lua
if hexis.world.is_block_air(100, 65, 200) then
    hexis.log.info("Block was broken!")
end
```

---

## Connected Blocks

### `hexis.world.get_connected_blocks(pos, options)`

Performs a flood-fill search to find all connected blocks matching specified patterns.

Useful for:
- Finding all logs in a tree
- Finding all ore blocks in a vein
- Detecting connected structure blocks

```lua
-- Find all logs connected to trunk at position
local tree_blocks = hexis.world.get_connected_blocks(
    {x = 100, y = 65, z = 200},
    {
        match_patterns = {"log", "wood", "stripped"},  -- Block ID must contain one of these
        max_blocks = 200,                               -- Maximum blocks to return
        include_diagonals = true                        -- 26-connectivity vs 6-connectivity
    }
)

hexis.log.info("Tree has " .. #tree_blocks .. " blocks")
for _, pos in ipairs(tree_blocks) do
    hexis.log.debug("Block at: " .. pos.x .. ", " .. pos.y .. ", " .. pos.z)
end
```

---

## Tree Highlighting

### `hexis.world.set_tree_highlight(blocks, color)`

Highlights multiple blocks representing a tree or structure.

```lua
local tree_blocks = hexis.world.get_connected_blocks(trunk_pos, {})
hexis.world.set_tree_highlight(tree_blocks, {
    r = 0.5, g = 1.0, b = 0.5, a = 0.6  -- Light green
})
```

### `hexis.world.clear_tree_highlight()`

Clears all tree highlight blocks.

```lua
hexis.world.clear_tree_highlight()
```

---

## Player Detection

### `hexis.world.get_nearby_players(radius, options)`

Returns table of players within radius.

```lua
local players = hexis.world.get_nearby_players(30, {
    exclude_self = true,
    filter_tablist = true  -- Only include tablist-verified players
})

for _, player in ipairs(players) do
    hexis.log.info(player.name .. " at distance " .. player.distance)
end
```

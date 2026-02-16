---
sidebar_position: 3
title: World
description: Query and interact with the game world
---

# World API

Namespace: `hexis.world`

Query and interact with the game world.

---

## Block Queries

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

### `hexis.world.get_block_state(x, y, z)`

Returns a table with the block id and all block state properties (age, facing, etc).

```lua
local state = hexis.world.get_block_state(100, 65, 200)
hexis.log.info("Block: " .. state.id)

-- Access state properties
if state.facing then
    hexis.log.info("Facing: " .. state.facing)
end
if state.age then
    hexis.log.info("Age: " .. state.age)
end
```

### `hexis.world.is_block_air(x, y, z)`

Quick check if a block is air.

```lua
if hexis.world.is_block_air(100, 65, 200) then
    hexis.log.info("Block was broken!")
end
```

### `hexis.world.scan_blocks(opts)`

Scan blocks in a radius matching patterns. Returns results sorted by distance.

```lua
local blocks = hexis.world.scan_blocks({
    names = {"wheat", "carrots", "potatoes"},
    radius = 10
})

for _, block in ipairs(blocks) do
    hexis.log.info("Found " .. block.name .. " at " .. block.x .. ", " .. block.y .. ", " .. block.z)
end
```

### `hexis.world.get_crosshair_target(range)`

Returns the block the player is currently looking at within the given range.

```lua
local target = hexis.world.get_crosshair_target(5)
if target then
    hexis.log.info("Looking at: " .. target.name .. " at " .. target.x .. ", " .. target.y .. ", " .. target.z)
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

## Highlights

Render visual highlights on blocks, entities, and text in the world.

### `hexis.world.highlight.block(pos, color)`

Highlights a single block.

```lua
hexis.world.highlight.block({x = 100, y = 65, z = 200}, {r = 1, g = 0, b = 0, a = 0.6})
```

### `hexis.world.highlight.clear_blocks()`

Clears all block highlights.

```lua
hexis.world.highlight.clear_blocks()
```

### `hexis.world.highlight.entity(id, color)`

Highlights an entity by ID.

```lua
hexis.world.highlight.entity(entity_id, {r = 0, g = 1, b = 0, a = 0.5})
```

### `hexis.world.highlight.clear_entities()`

Clears all entity highlights.

```lua
hexis.world.highlight.clear_entities()
```

### `hexis.world.highlight.tree(blocks, color)`

Highlights multiple blocks representing a tree or structure.

```lua
local tree_blocks = hexis.world.get_connected_blocks(trunk_pos, {})
hexis.world.highlight.tree(tree_blocks, {
    r = 0.5, g = 1.0, b = 0.5, a = 0.6  -- Light green
})
```

### `hexis.world.highlight.clear_tree()`

Clears all tree highlight blocks.

```lua
hexis.world.highlight.clear_tree()
```

### `hexis.world.highlight.text(pos, text_or_opts)`

Renders floating text at a world position.

```lua
-- Simple text
hexis.world.highlight.text({x = 100, y = 66, z = 200}, "Hello!")

-- With options
hexis.world.highlight.text({x = 100, y = 66, z = 200}, {
    text = "Target",
    color = {r = 1, g = 1, b = 0}
})
```

### `hexis.world.highlight.clear_text()`

Clears all highlight text.

```lua
hexis.world.highlight.clear_text()
```

### `hexis.world.highlight.clear()`

Clears ALL highlight types (blocks, entities, tree, text).

```lua
hexis.world.highlight.clear()
```

---

## World Text (Aliases)

These are convenience aliases for `hexis.world.highlight.text` and `hexis.world.highlight.clear_text`.

### `hexis.world.text_at(pos, text_or_opts)`

Renders floating text at a world position.

```lua
hexis.world.text_at({x = 100, y = 66, z = 200}, "Hello!")
```

### `hexis.world.clear_text()`

Clears all world text.

```lua
hexis.world.clear_text()
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

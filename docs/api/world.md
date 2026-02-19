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

-- Fluid blocks include extra properties
if state.is_fluid then
    hexis.log.info("Source block: " .. tostring(state.is_source))
    hexis.log.info("Fluid level: " .. state.fluid_level)
end
```

Fluid blocks (water, lava) include additional fields:

| Field | Type | Description |
|-------|------|-------------|
| `is_fluid` | boolean | `true` if block contains fluid |
| `is_source` | boolean | `true` if source block (not flowing) |
| `fluid_level` | number | Fluid level (8 = full source, 1-7 = flowing) |

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

### `hexis.world.highlight.glow(entity_id, options)`

Adds a model-contour glow outline and translucent tint fill to an entity. Unlike `highlight.entity()` which draws a bounding box, this renders directly on the entity's 3D model (including armor and held items).

```lua
-- Simple glow with default red
hexis.world.highlight.glow(entity.id)

-- Custom color (r, g, b values 0-1)
hexis.world.highlight.glow(entity.id, {r = 0, g = 1, b = 0, a = 0.4})

-- Separate outline and tint colors
hexis.world.highlight.glow(entity.id, {
    outline = {r = 1, g = 0, b = 0},          -- Red edge outline
    tint = {r = 1, g = 0, b = 0, a = 0.3}     -- Semi-transparent red fill
})
```

| Option | Type | Description |
|--------|------|-------------|
| `r, g, b` | number | Color (0-1) applied to both outline and tint |
| `a` | number | Tint alpha (0-1, default 0.33) |
| `outline` | table | `{r, g, b}` for outline edge color only |
| `tint` | table | `{r, g, b, a}` for model fill color only |

### `hexis.world.highlight.unglow(entity_id)`

Removes glow from a specific entity.

```lua
hexis.world.highlight.unglow(entity.id)
```

### `hexis.world.highlight.glow_rainbow(entity_id)`

Sets a rainbow cycling glow effect on an entity. The color smoothly cycles through the full spectrum on a 3-second loop.

```lua
hexis.world.highlight.glow_rainbow(target.id)
```

### `hexis.world.highlight.clear_glow()`

Clears all glow highlights and rainbow effects.

```lua
hexis.world.highlight.clear_glow()
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

Clears ALL highlight types (blocks, entities, glow, tree, zones, animated, text).

```lua
hexis.world.highlight.clear()
```

---

## Zone Highlights

Render 3D boxes between two corner positions with full control over fill color, border color, and border thickness. Useful for visualizing areas, debug zones, and spatial regions.

### `hexis.world.highlight_zone(min, max, options)`

Renders a 3D box between two corner block positions. Returns a zone **ID** (number) for later removal.

Coordinates are block positions — the zone expands to cover the full block at each corner (e.g., `{x=0}` to `{x=5}` covers 6 blocks).

```lua
-- Basic zone with defaults (green, translucent fill, solid border)
local id = hexis.world.highlight_zone(
    { x = 100, y = 60, z = 200 },
    { x = 110, y = 65, z = 210 }
)

-- Custom colors and thickness
local id = hexis.world.highlight_zone(
    { x = 100, y = 60, z = 200 },
    { x = 110, y = 65, z = 210 },
    {
        fill = { r = 1.0, g = 0.0, b = 0.0, a = 0.1 },     -- Translucent red fill
        border = { r = 1.0, g = 0.0, b = 0.0, a = 0.8 },   -- Solid red border
        thickness = 0.06                                       -- Thicker border lines
    }
)
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `fill` | table | `{r=0.2, g=1.0, b=0.2, a=0.15}` | Fill color `{r, g, b, a}` (0-1) |
| `border` | table | `{r=0.2, g=1.0, b=0.2, a=1.0}` | Border color `{r, g, b, a}` (0-1) |
| `thickness` | number | `0.04` | Border line thickness |

### `hexis.world.remove_zone_highlight(id)`

Removes a specific zone by its ID (returned from `highlight_zone`).

```lua
local id = hexis.world.highlight_zone(min, max)
-- Later...
hexis.world.remove_zone_highlight(id)
```

### `hexis.world.clear_zone_highlights()`

Clears all zone highlights created by the current script.

```lua
hexis.world.clear_zone_highlights()
```

Also available via the highlight subtable:
- `hexis.world.highlight.zone(min, max, opts)` — same as `highlight_zone`
- `hexis.world.highlight.remove_zone(id)` — same as `remove_zone_highlight`
- `hexis.world.highlight.clear_zones()` — same as `clear_zone_highlights`

---

## Animated Block Highlights

Smooth animated highlights that lerp between positions. Useful for showing current and next mining/navigation targets.

### `hexis.world.highlight_block_animated(pos, color, speed)`

Sets a smooth animated highlight on a block with exponential ease-out interpolation.

```lua
-- Default cyan highlight
hexis.world.highlight_block_animated({x = 100, y = 65, z = 200})

-- Custom color and speed
hexis.world.highlight_block_animated(
    {x = 100, y = 65, z = 200},
    {r = 1.0, g = 0.5, b = 0.0, a = 0.8},  -- Orange
    20.0                                       -- Faster animation
)
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `pos` | table | Required | `{x, y, z}` block position |
| `color` | table | `{r=0.2, g=0.8, b=1.0, a=0.8}` | Color `{r, g, b, a}` (0-1) |
| `speed` | number | `15.0` | Animation speed (higher = faster lerp) |

### `hexis.world.highlight_secondary_target(pos, color, speed)`

Sets a secondary/preview highlight. More transparent and slower — useful for showing "next target" while mining current block.

```lua
hexis.world.highlight_secondary_target(
    {x = 105, y = 65, z = 200},
    {r = 0.5, g = 0.5, b = 0.8, a = 0.4},  -- Dim purple
    8.0                                        -- Slow animation
)
```

### `hexis.world.clear_animated_highlight()`

Clears the primary animated highlight with a smooth fade-out.

### `hexis.world.clear_secondary_highlight()`

Clears the secondary animated highlight.

### `hexis.world.is_highlight_active()`

Returns `true` if an animated highlight is currently active.

---

## Water Detection

### `hexis.world.find_water(radius)`

Finds the nearest water block within the given radius. Returns `{x, y, z}` at the water surface, or `nil`.

```lua
local water = hexis.world.find_water(20)
if water then
    hexis.log.info("Water at: " .. water.x .. ", " .. water.y .. ", " .. water.z)
end
```

### `hexis.world.is_in_water()`

Returns `true` if the player is currently in water.

### `hexis.world.is_water_at(x, y, z)`

Returns `true` if the block at the given position is water.

```lua
if hexis.world.is_water_at(100, 64, 200) then
    hexis.log.info("Water block!")
end
```

---

## Block Utilities

### `hexis.world.has_exposed_face(x, y, z)`

Returns `true` if the block has at least one non-solid neighbor (i.e., it's not fully buried). Useful for filtering scan results to only mineable blocks.

```lua
local blocks = hexis.world.scan_blocks({match_patterns = {"diamond_ore"}, radius = 10})
for _, b in ipairs(blocks) do
    if hexis.world.has_exposed_face(b.x, b.y, b.z) then
        hexis.log.info("Exposed ore at " .. b.x .. "," .. b.y .. "," .. b.z)
    end
end
```

### `hexis.world.watch_block(x, y, z)`

Start watching a block position for state changes. Changes fire via `block_change` events.

```lua
hexis.world.watch_block(100, 65, 200)
```

### `hexis.world.unwatch_block(x, y, z)`

Stop watching a specific block position.

### `hexis.world.clear_watches()`

Clear all block watches.

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

## Entity Queries

### `hexis.world.get_nearby_entities(radius, options)`

Returns a table of entities within the given radius. Supports filtering by type.

```lua
-- Get all entities within 10 blocks
local entities = hexis.world.get_nearby_entities(10)

-- Filter by type
local zombies = hexis.world.get_nearby_entities(15, {type = "zombie"})

-- Fishing bobber detection
local bobbers = hexis.world.get_nearby_entities(30, {type = "fishing_bobber"})
for _, b in ipairs(bobbers) do
    if b.is_own_projectile then
        hexis.log.info("My bobber at: " .. b.x .. ", " .. b.y .. ", " .. b.z)
    end
end
```

Each entity table contains:

| Field | Type | Description |
|-------|------|-------------|
| `name` | string | Entity display name |
| `type` | string | Entity type (e.g., `"Zombie"`) |
| `type_id` | string | Registry ID (e.g., `"minecraft:zombie"`) |
| `x, y, z` | number | Entity position |
| `distance` | number | Distance from player |
| `aim_point` | table | `{x, y, z}` — eye position for living entities, bounding box center for others |
| `box` | table | Bounding box dimensions |

**Fishing bobber entities** include additional fields:

| Field | Type | Description |
|-------|------|-------------|
| `is_own_projectile` | boolean | `true` if this bobber belongs to the player |
| `owner` | string | Name of the player who cast this bobber |

```lua
-- Aim at nearest entity using aim_point
local mobs = hexis.world.get_nearby_entities(10, {type = "zombie"})
if #mobs > 0 then
    hexis.player.look_at(mobs[1].aim_point)
    hexis.player.left_click()
end
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

### `hexis.world.players_in_zone(zone, options)`

Counts players within a zone AABB.

```lua
local result = hexis.world.players_in_zone(
    { min = {x = 90, y = 60, z = 190}, max = {x = 110, y = 80, z = 210} },
    { exclude_self = true, filter_tablist = true }
)

hexis.log.info("Players in zone: " .. result.count)
for _, name in ipairs(result.names) do
    hexis.log.info("  - " .. name)
end
```

| Field | Type | Description |
|-------|------|-------------|
| `count` | number | Number of players found |
| `names` | table | Array of player name strings |

---
sidebar_position: 3
title: World
description: Query and interact with the game world
---

# World API

Namespace: `hexis.world`

Query and interact with the game world.

:::tip Related APIs
- For **mining** blocks, see the [Mining API](/api/mining)
- For **navigating** to blocks, see the [Navigation API](/api/navigation)
- For **entity interaction**, see the [Player API](/api/player) (`interact_entity`, `look_at`)
- For help choosing the right function, see [Choosing the Right Function](/guides/choosing-functions)
:::

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

Renders floating NanoVG text at a world position. Uses Inter font for crisp, non-pixelated text.

```lua
-- Simple text
hexis.world.highlight.text({x = 100, y = 66, z = 200}, "Hello!")

-- With options
hexis.world.highlight.text({x = 100, y = 66, z = 200}, {
    text = "Target",
    color = 0xFFFFFF00,         -- ARGB yellow
    bg = 0xB2000000,            -- 70% opacity black
    font_size = 16,             -- Pixel size (default 13)
    font_weight = "bold",       -- "bold", "medium", or "regular"
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | string | `""` | The text to display |
| `id` | string | auto-generated | Label ID for later removal via `remove_text(id)` |
| `color` | number | `0xFFFFFFFF` | Text color (ARGB hex) |
| `bg` | number | `0xB2000000` | Background pill color (ARGB hex, 70% black) |
| `font_size` | number | `13` | Font size in pixels |
| `font_weight` | string | `"bold"` | Font weight: `"bold"`, `"medium"`, or `"regular"` |

### `hexis.world.highlight.clear_text()`

Clears all highlight text (both world and entity text).

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

### `hexis.world.set_highlight_esp(enabled)`

Toggle ESP mode for animated highlights. When enabled (default), highlights render through walls. When disabled, highlights are occluded by blocks.

```lua
-- Disable ESP (normal depth testing)
hexis.world.set_highlight_esp(false)

-- Enable ESP (visible through walls, default)
hexis.world.set_highlight_esp(true)
```

Also available as `hexis.world.highlight.set_esp(enabled)`.

---

## Block Pattern Listeners

Watch for block changes matching a pattern in real-time. Useful for detecting crop growth, block breaks, or world events.

### `hexis.world.on_block_pattern(pattern, callback)`

Registers a listener that fires when any block matching the pattern changes. Returns a listener ID for later removal.

The callback receives a table with `{x, y, z, old_name, new_name, is_air}`.

```lua
-- Watch for wheat becoming fully grown
local listener_id = hexis.world.on_block_pattern("wheat", function(event)
    hexis.log.info("Wheat changed at " .. event.x .. "," .. event.y .. "," .. event.z)
    hexis.log.info("  " .. event.old_name .. " -> " .. event.new_name)
end)

-- Later: remove the listener
hexis.world.remove_block_pattern(listener_id)
```

### `hexis.world.remove_block_pattern(id)`

Removes a block pattern listener by its ID.

---

## Line-of-Sight Stand Position

### `hexis.world.find_los_stand_pos(target, options)`

Finds a position where the player can stand and have line of sight to a target. Useful for finding positions to interact with entities or blocks without pathfinding.

```lua
local pos = hexis.world.find_los_stand_pos(
    {x = 100, y = 65, z = 200},
    {max_range = 20}
)

if pos then
    hexis.log.info("Stand at: " .. pos.x .. ", " .. pos.y .. ", " .. pos.z)
    -- pos.aim = {x, y, z} — where to look
    -- pos.distance = distance to target
end
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `target` | table | required | `{x, y, z}` position to see |
| `max_range` | number | 20.0 | Maximum search range |

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

## World Text

NanoVG-rendered text in world space. Uses Inter font for crisp, resolution-independent text. Both static (world position) and entity-following variants available.

### `hexis.world.text_at(pos, text_or_opts)`

Renders floating NanoVG text at a world position. Returns a label ID string.

```lua
-- Simple text
hexis.world.text_at({x = 100, y = 66, z = 200}, "Hello!")

-- With full options
local id = hexis.world.text_at({x = 100, y = 66, z = 200}, {
    text = "Spawn Point",
    id = "spawn_label",         -- Reusable ID for upsert
    color = 0xFF00FF00,         -- Green text (ARGB)
    bg = 0xB2000000,            -- 70% opacity black bg
    font_size = 16,
    font_weight = "medium",     -- "bold", "medium", "regular"
})
```

### `hexis.world.text_at_entity(entity_id, opts)`

Renders NanoVG text that follows an entity. Text floats above the entity's head.

```lua
hexis.world.text_at_entity(player.id, {
    text = "Target",
    color = 0xFFFF4444,         -- Red text
    bg = 0xB2000000,            -- 70% opacity black bg
    y_offset = 0.5,             -- Blocks above head (default 0.5)
    font_size = 13,
    font_weight = "bold",
})
```

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `text` | string | `""` | The text to display |
| `color` | number | `0xFFFF4444` | Text color (ARGB hex) |
| `bg` | number | `0xB2000000` | Background pill color (ARGB hex) |
| `y_offset` | number | `0.5` | Blocks above entity head |
| `font_size` | number | `13` | Font size in pixels |
| `font_weight` | string | `"bold"` | Font weight: `"bold"`, `"medium"`, or `"regular"` |

### `hexis.world.remove_text(id)`

Remove a specific world text label by its ID.

### `hexis.world.remove_entity_text(entity_id)`

Remove the text label from a specific entity.

### `hexis.world.clear_text()`

Clears all world text and entity text for this script.

### `hexis.world.clear_entity_text()`

Clears only entity-following text labels for this script.

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

**Armor stand entities** include additional fields:

| Field | Type | Description |
|-------|------|-------------|
| `is_small` | boolean | Whether the armor stand is small |
| `is_marker` | boolean | Whether the armor stand is a marker |
| `is_invisible` | boolean | Whether the armor stand is invisible |
| `head_texture` | string | Base64-encoded skin texture from the skull on the armor stand's head slot (if present). Useful for identifying custom entities like Hypixel SkyBlock pests |

```lua
-- Find pest entities by head texture
local entities = hexis.world.get_nearby_entities(50, "armor_stand")
for _, e in ipairs(entities) do
    if e.head_texture then
        hexis.log.info("ArmorStand with custom head at " .. e.x .. "," .. e.y .. "," .. e.z)
    end
end
```

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
    hexis.player.attack()
end
```

---

## Player Detection

### `hexis.world.get_nearby_players(radius, options)`

Returns table of players within radius. Each player has `id` (entity ID), `name`, position (`x`, `y`, `z`), and `distance`.

```lua
local players = hexis.world.get_nearby_players(30, {
    exclude_self = true,
    filter_tablist = true  -- Only include tablist-verified players
})

for _, player in ipairs(players) do
    hexis.log.info(player.name .. " (id=" .. player.id .. ") at distance " .. player.distance)
end
```

| Field | Type | Description |
|-------|------|-------------|
| `id` | number | Entity ID (use with `text_at_entity`, `glow_entity`, etc.) |
| `name` | string | Player display name |
| `x, y, z` | number | Player position |
| `distance` | number | Distance from local player |

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

---
sidebar_position: 12
title: Routes
description: Route management and navigation
---

# Routes API

Namespace: `hexis.routes`

Manage and use saved routes for navigation and block targeting.

---

## Listing Routes

### `hexis.routes.list()`

Returns table of all route names.

```lua
local routes = hexis.routes.list()
for _, name in ipairs(routes) do
    hexis.log.info("Route: " .. name)
end
```

### `hexis.routes.list_with(required_types)`

Returns table of route keys that include specific capabilities.

`required_types` is a Lua array of strings:
- `"mineable_blocks"`
- `"zones"`
- `"mobs"`
- `"travel_points"`
- `"etherwarp_points"`

```lua
local routes = hexis.routes.list_with({"mineable_blocks", "zones"})
for _, key in ipairs(routes) do
    hexis.log.info("Candidate route: " .. key)
end
```

### `hexis.routes.list_categories()`

Returns table of all route categories (directories).

```lua
local categories = hexis.routes.list_categories()
for _, cat in ipairs(categories) do
    hexis.log.info("Category: " .. cat)
end
```

---

## Loading Routes

### `hexis.routes.load(name)`

Loads a route by name.

```lua
local route = hexis.routes.load("foraging/park/Park_Foraging")
if route then
    hexis.log.info("Loaded route: " .. route.name)
    hexis.log.info("Blocks: " .. route.block_count)
    hexis.log.info("Zones: " .. route.zone_count)
end
```

### `hexis.routes.exists(name)`

Returns `true` if a route exists.

```lua
if hexis.routes.exists("foraging/park/Park_Foraging") then
    hexis.log.info("Route exists")
end
```

### `hexis.routes.get_capabilities(route)`

Returns a Lua array of capability strings present in the loaded route.

```lua
local route = hexis.routes.load("foraging/park/Park_Foraging")
local caps = hexis.routes.get_capabilities(route)
for _, cap in ipairs(caps) do
    hexis.log.info("Capability: " .. cap)
end
```

---

## Route Object

The `route` returned by `hexis.routes.load(...)` is a Lua table with metadata + helper methods.

**Fields:**
- `route.name`, `route.category`, `route.description`, `route.area`
- `route.size`
- `route.block_count`, `route.zone_count`, `route.mob_count`, `route.travel_count`, `route.etherwarp_count`

---

## Block Methods

### `route:get_blocks()`

Returns all mineable block entries.

### `route:get_nearest_block(options)`

Returns nearest available block (or `nil`).

```lua
local block = route:get_nearest_block({max_distance = 50})
if block then
    hexis.log.info(string.format("Nearest block: %d %d %d (dist=%.1f)",
        block.x, block.y, block.z, block.distance))
end
```

### `route:mark_complete(x, y, z, cooldown_seconds)`

Marks a block as completed and puts it on cooldown.

```lua
route:mark_complete(block.x, block.y, block.z, 20)
```

### `route:get_available_block_count()`

Returns how many blocks are currently available (not on cooldown).

---

## Zone Methods

### `route:get_zones()` / `route:get_zone(id)`

Returns zones or a single zone. A zone table has:
- `id`, `type`, `label`
- `min = {x,y,z}`, `max = {x,y,z}`

### `route:get_zone_at_player()`

Returns the zone the player is currently inside (or `nil`).

### `route:is_in_zone(x, y, z, zone_type)`

Checks whether a position is inside a given zone type (default type is `"island"`).

---

## Zone Groups

Routes support **zone groups** for merging multiple zones into a logical area.

```lua
local route = hexis.routes.load("foraging/park/Park_Foraging")
-- Zone groups are automatically applied when use_zones = true
hexis.mining.start_loop({
    id = "foraging",
    use_zones = true  -- Will respect zone groups
})
```

### `route:get_zone_groups()`

Returns a Lua array of zone group names.

### `route:get_zones_in_group(group_name)`

Returns a Lua array of zone tables belonging to the group.

### `route:get_group_for_zone(zone_id)`

Returns the group name for a given zone ID.

### `route:get_ungrouped_zones()`

Returns a Lua array of zone tables that are not in any group.

---

## Mob Methods

### `route:get_mobs()` / `route:get_mob(id)` / `route:get_mobs_by_priority()`

Returns mob definitions from the route.

---

## Travel/Etherwarp Methods

### `route:get_travel_points()`

Returns travel waypoints.

### `route:get_etherwarp_points()`

Returns etherwarp destinations.

### `route:get_nearest_etherwarp()`

Returns the nearest etherwarp point (or `nil`).

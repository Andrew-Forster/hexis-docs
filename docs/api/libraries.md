---
sidebar_position: 15
title: Script Libraries
description: Reusable Lua libraries for common automation patterns
---

# Script Libraries

Hexis ships reusable Lua libraries that encapsulate common automation patterns. Libraries are loaded with `require()` and live in `config/hexis/scripts/`.

---

## Loading Libraries

### `require(name)`

Loads a library using standard Lua `require()` with sandboxed path resolution.

```lua
local tree_mining = require("hypixel/lib/tree_mining")
local island_nav = require("hypixel/lib/island_nav")
local Competition = require("hypixel/lib/competition")
```

Libraries are loaded once and cached. The return value is the library's module table.

---

## tree_mining

Tree mining orchestration. Scans connected log blocks and mines them with retry logic, deprioritization, and callbacks.

```lua
local tree_mining = require("hypixel/lib/tree_mining")
```

### `tree_mining.scan_tree(trunk_pos, opts)`

Scans connected log blocks from a trunk position using flood-fill.

```lua
local blocks = tree_mining.scan_tree({x = 100, y = 65, z = 200}, {
    patterns = {"log", "wood", "stripped"},  -- Block name patterns (default)
    max_blocks = 400,                         -- Max blocks to scan (default 400)
    include_diagonals = true                  -- Include diagonal connections (default true)
})
-- Returns array of {x, y, z} positions
```

### `tree_mining.mine_spot(trunk_pos, opts)`

Mines a single block (treecapitator mode). Navigates if needed.

```lua
local result = tree_mining.mine_spot({x = 100, y = 65, z = 200}, {
    aim_speed = 2.5,       -- Aim speed (default 2.5)
    timeout = 3.0,         -- Per-block timeout (default 3.0)
    allow_jump = false,    -- Allow jump mining (default false)
    search_radius = 5      -- Vantage search radius (default 5)
})
-- result.success = bool, result.reason = string
```

### `tree_mining.mine_all(trunk_pos, opts)`

Mines all connected blocks in a tree. The main entry point for tree mining scripts.

```lua
local result = tree_mining.mine_all({x = 100, y = 65, z = 200}, {
    patterns = {"log", "wood", "stripped"},  -- Block patterns to match
    aim_speed = 2.5,
    timeout = 3.0,
    allow_jump = true,           -- Jump-mine overhead blocks
    max_block_failures = 3,      -- Skip block after N failures (default 3)
    search_radius = 5,
    max_blocks = 400,

    -- Callbacks
    on_block_mined = function(block)
        -- Called after each block is successfully mined
    end,
    on_unreachable = function(block, aim_point)
        -- Called when a block can't be reached (nav_failed or no vantage)
        -- Use this for axe throwing or other fallback strategies
    end,
    on_abort = function()
        -- Return true to abort mining (e.g., tree regeneration detected)
        return false
    end
})

-- result.success = bool
-- result.blocks_mined = number
-- result.blocks_total = number
-- result.reason = "complete", "aborted", "too_many_failures", "all_failed", "max_attempts", "stopped"
```

**Block Priority:** Blocks are mined bottom-up (lower Y first), then by distance. Failed blocks are deprioritized with a cooldown before retry.

**Example: Foraging with regen detection**

```lua
local regen_detected = false
hexis.events.on("chat", "regenerating", function()
    regen_detected = true
end)

local result = tree_mining.mine_all(trunk, {
    allow_jump = true,
    on_abort = function() return regen_detected end,
    on_unreachable = function(block)
        hexis.player.look_at({x = block.x + 0.5, y = block.y + 0.5, z = block.z + 0.5, speed = 2.5})
        hexis.player.use_item()
        hexis.wait(1.0)
    end
})
```

---

## competition

Agatha Contest mode library. Handles opportunistic azalea breaking and tadpole catching during navigation. Uses an OOP pattern with per-instance state.

```lua
local Competition = require("hypixel/lib/competition")
```

### `Competition.new(opts)`

Creates a new Competition instance.

```lua
local comp = Competition.new({
    route = current_route,             -- Route object (for block scanning)
    aim_speed = 2.5,                   -- Aim speed for mining/catching
    radius = 7,                        -- Scan radius for nearby targets
    equip_axe_fn = equip_best_axe      -- Callback to equip axe (returns bool)
})
```

### Instance Methods

#### `comp:check_azaleas_during_nav(max_per_trip)`

Check for and mine nearby flowering azaleas during navigation. Call in your nav wait loop.

```lua
while hexis.navigate.is_navigating() do
    local broken, interrupted = comp:check_azaleas_during_nav(6)
    if interrupted then
        break  -- Navigation was stopped for a detour
    end
    hexis.wait(0.1)
end
```

#### `comp:check_tadpoles()`

Check for and catch nearby tadpoles. Requires a fishing net in hotbar. Returns `true` if navigation was interrupted.

```lua
if comp:check_tadpoles() then
    -- Navigation was stopped to catch a tadpole
end
```

#### `comp:has_fishing_net()`

Returns `true` if a fishing net was found in the hotbar.

#### `Competition.is_any_azalea(block_name)`

Static method. Returns `true` if the block name contains "azalea". Useful for filtering azaleas out of tree targets.

```lua
if not Competition.is_any_azalea(block_name) then
    table.insert(targets, block)
end
```

### Instance State

| Field | Type | Description |
|-------|------|-------------|
| `comp.azaleas_mined` | int | Total azaleas broken |
| `comp.tadpoles_caught` | int | Total tadpoles caught |

---

## island_nav

Inter-island navigation with BFS pathfinding, launch pad detection, and world warp handling. Designed for The Park island network.

```lua
local island_nav = require("hypixel/lib/island_nav")
```

### `island_nav.get_current_island(route)`

Detects which island the player is on using zone detection, cached state, and tablist fallback.

```lua
local island = island_nav.get_current_island(current_route)
-- Returns: "hub", "birch", "spruce", "dark_oak", "savanna", "jungle", "fig", or nil
```

### `island_nav.travel_to(target_island, route)`

Navigates to a target island via BFS shortest path. Handles launch pads (with sound detection) and world warps automatically.

```lua
local success = island_nav.travel_to("jungle", current_route)
if not success then
    hexis.log.warn("Failed to reach jungle")
end
```

**Supported Islands:** hub, birch, spruce, dark_oak, savanna, jungle, fig (Galatea)

### `island_nav.safe_navigate(target, error_context)`

Navigate to a position with failure handling. On failure, shows a notification and stops the script.

```lua
island_nav.safe_navigate({x = -315, y = 80, z = -10}, "spruce bridge")
```

---
sidebar_position: 15
title: Spatial
description: Environment awareness and safety analysis
---

# Spatial API

Namespace: `hexis.spatial`

Environment awareness for safe movement decisions. Essential for:
- Safe strafing (avoiding cliffs)
- Position safety analysis
- Raycast/line of sight checks
- Smart block targeting

---

## Cliff/Ledge Detection

### `hexis.spatial.get_deepest_drop(pos)`

Get the deepest drop in any cardinal direction from position.

```lua
local drop = hexis.spatial.get_deepest_drop({x = 100, y = 65, z = 200})
if drop >= 4 then
    hexis.log.warn("Dangerous cliff nearby!")
end
```

Returns: 0 = safe, higher numbers = more dangerous

### `hexis.spatial.is_position_safe(pos)`

Quick safety check - can stand there without falling?

```lua
if hexis.spatial.is_position_safe({x = 100, y = 65, z = 200}) then
    hexis.navigate.to({x = 100, y = 65, z = 200})
end
```

---

## Wall Distance

### `hexis.spatial.get_wall_distance(pos)`

Get distance to nearest wall (1-5 blocks).

```lua
local wall_dist = hexis.spatial.get_wall_distance(player_pos)
-- 1 = touching wall, 5 = 4+ blocks away
```

---

## Position Analysis

### `hexis.spatial.analyze_position(pos)`

Get detailed safety breakdown for a position.

```lua
local analysis = hexis.spatial.analyze_position({x = 100, y = 65, z = 200})
-- analysis = {
--     total_penalty = 45.0,
--     drop_depth = 2,
--     wall_distance = 3,
--     is_corridor = false,
--     cardinal_obstacles = 1,
--     diagonal_obstacles = 0,
--     is_walkable = true,
--     danger_reason = "Near wall",
--     severity = "CAUTION"
-- }
```

### `hexis.spatial.get_danger_level(pos)`

Quick danger level check.

Returns: `"SAFE"`, `"CAUTION"`, `"RISKY"`, `"DANGER"`, `"DEADLY"`, or `"BLOCKED"`

---

## Walkability

### `hexis.spatial.can_stand_at(pos)`

Check if player can stand at position (has floor and headroom).

### `hexis.spatial.can_walk_through(pos)`

Check if block at position is passable.

### `hexis.spatial.can_walk_on(pos)`

Check if block at position can be stood on.

---

## Safe Strafe Direction

### `hexis.spatial.get_safe_strafe_direction(toward_pos)`

Calculate safe strafe direction toward a target, avoiding cliffs.

```lua
local strafe = hexis.spatial.get_safe_strafe_direction(target_block)
if strafe.is_safe then
    hexis.movement.set_strafe_intensity(strafe.intensity)
else
    hexis.log.warn("Can't safely strafe toward target")
end
```

Returns: `{intensity, is_safe, drop_depth}` or `nil`

---

## Raycast / Line of Sight

### `hexis.spatial.raycast(target_pos)`

Raycast from player eye to position.

```lua
local hit = hexis.spatial.raycast({x = 100, y = 65, z = 200})
if hit.hit then
    hexis.log.info("Hit block at " .. hit.block_pos.x .. ", " .. hit.block_pos.y)
    hexis.log.info("Distance: " .. hit.distance .. ", Side: " .. hit.side)
else
    hexis.log.info("Clear line of sight, distance: " .. hit.distance)
end
```

### `hexis.spatial.has_line_of_sight(pos)`

Quick check if player has LOS to position.

---

## Smart Aim Points

### `hexis.spatial.get_smart_aim_point(block_pos)`

Get the best visible point on a block for aiming. May return off-center coordinates to avoid occlusion!

```lua
local aim = hexis.spatial.get_smart_aim_point({x = 100, y = 65, z = 200})
if aim then
    hexis.actions.look_at(aim)
end
```

### `hexis.spatial.get_visible_aim_points(block_pos)`

Get all visible aim points on a block (for retry logic).

### `hexis.spatial.can_hit_block(block_pos)`

Check if we can mine/hit this block, accounting for obstructions.

---

## Example: Safe Navigation

```lua
local function navigate_safely(target)
    local analysis = hexis.spatial.analyze_position(target)

    if analysis.severity == "DEADLY" or analysis.severity == "BLOCKED" then
        hexis.log.error("Target position is unsafe: " .. analysis.danger_reason)
        return false
    end

    if analysis.severity == "DANGER" then
        hexis.log.warn("Target is risky, proceeding with caution...")
    end

    return hexis.navigate.to(target)
end
```

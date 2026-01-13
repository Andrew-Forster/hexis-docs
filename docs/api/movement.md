---
sidebar_position: 14
title: Movement
description: Direct WASD control
---

# Movement API

Namespace: `hexis.movement`

Direct WASD control for fine-grained movement. Useful for scripts that need to strafe while mining, precise positioning, or custom movement patterns.

:::warning Control Acquisition
Scripts MUST call `take_control()` before using movement, and `release_control()` when done to prevent stuck inputs.
:::

---

## Control Acquisition

### `hexis.movement.take_control(owner_name)`

Take exclusive control of movement. Required before using other movement functions.

```lua
hexis.movement.take_control("my_script")
-- ... use movement ...
hexis.movement.release_control()
```

### `hexis.movement.release_control()`

Release movement control. Always call this when done!

### `hexis.movement.is_controlled()`

Returns `true` if movement is currently being controlled.

---

## Digital Movement

### `hexis.movement.set_forward(pressed)`
### `hexis.movement.set_backward(pressed)`
### `hexis.movement.set_strafe_left(pressed)`
### `hexis.movement.set_strafe_right(pressed)`

Set individual movement key states.

```lua
hexis.movement.set_forward(true)   -- Hold W
hexis.movement.set_strafe_left(true)  -- Hold A
```

---

## Analog Strafe

### `hexis.movement.set_strafe_intensity(intensity)`

Set analog strafe intensity. Uses human-like PWM timing internally for natural movement.

| Parameter | Type | Range | Description |
|-----------|------|-------|-------------|
| `intensity` | number | -1.0 to 1.0 | Negative = left, Positive = right |

```lua
hexis.movement.set_strafe_intensity(0.5)   -- Gentle strafe right
hexis.movement.set_strafe_intensity(-0.8)  -- Strong strafe left
```

---

## Combined State

### `hexis.movement.set_state(state)`

Set multiple movement states at once.

```lua
hexis.movement.set_state({
    forward = true,
    strafe = 0.5,   -- Analog strafe (overrides left/right)
    sprint = true,
    jump = false
})
```

---

## Actions

### `hexis.movement.jump()`

Trigger a jump. Automatically held for multiple ticks for reliability.

### `hexis.movement.stop()`

Stop all movement immediately.

### `hexis.movement.tick()`

Apply movement for this frame. **Call this every tick in your loop!**

```lua
while hexis.running() do
    hexis.movement.set_forward(true)
    hexis.movement.tick()  -- Apply movement
    hexis.sleep(50)
end
```

---

## State Queries

### `hexis.movement.get_state()`

Returns current movement state as a table.

```lua
local state = hexis.movement.get_state()
-- state = {forward=true, backward=false, left=false, right=false,
--          jump=false, sprint=true, sneak=false}
```

---

## Example: Strafe While Mining

```lua
hexis.movement.take_control("fig_mode")

while hexis.running() and mining_tree do
    -- Strafe toward next tree while mining current one
    local strafe = hexis.spatial.get_safe_strafe_direction(next_tree)
    if strafe and strafe.is_safe then
        hexis.movement.set_strafe_intensity(strafe.intensity)
    end

    hexis.mining.aim_tick()
    hexis.movement.tick()
    hexis.sleep(50)
end

hexis.movement.release_control()
```

---
sidebar_position: 1
title: Timer
description: Session timing and elapsed time tracking
---

# Timer

Namespace: `hexis.timer`

Track elapsed time for sessions and statistics.

---

## Methods

### `hexis.timer.start()`

Start the timer.

```lua
hexis.timer.start()
```

### `hexis.timer.stop()`

Stop the timer.

```lua
hexis.timer.stop()
```

### `hexis.timer.reset()`

Reset the timer to zero.

```lua
hexis.timer.reset()
```

### `hexis.timer.elapsed()`

Get elapsed time in seconds.

```lua
local seconds = hexis.timer.elapsed()
hexis.log.info("Elapsed: " .. seconds .. " seconds")
```

### `hexis.timer.elapsed_ms()`

Get elapsed time in milliseconds.

```lua
local ms = hexis.timer.elapsed_ms()
```

### `hexis.timer.formatted()`

Get formatted time string.

```lua
local time = hexis.timer.formatted()  -- "1h 23m 45s"
hexis.hud.set_var("elapsed_time", time)
```

### `hexis.timer.is_running()`

Check if timer is currently running.

```lua
if hexis.timer.is_running() then
    hexis.log.info("Timer active")
end
```

---

## Example Usage

```lua
hexis.timer.start()

while hexis.running() do
    -- Update HUD with elapsed time
    hexis.hud.set_var("time", hexis.timer.formatted())
    hexis.wait(1.0)
end

hexis.timer.stop()
hexis.log.info("Total time: " .. hexis.timer.formatted())
```

---
sidebar_position: 1
title: Core API
description: Essential functions for script execution
---

# Core API

Essential functions for controlling script execution.

---

## `hexis.running()`

Returns `true` if script should continue running. Use in main loop.

```lua
while hexis.running() do
    -- Script logic
    hexis.sleep(100)
end
```

---

## `hexis.sleep(ms)`

Pauses script execution for specified milliseconds.

```lua
hexis.sleep(1000)  -- Wait 1 second
hexis.sleep(500)   -- Wait 500ms
```

---

## `hexis.yield()`

Yields execution briefly. Use in tight loops to prevent freezing.

```lua
for i = 1, 1000 do
    -- Processing
    if i % 100 == 0 then hexis.yield() end
end
```

---

## `hexis.wait(seconds)`

Alternative to `sleep()` using seconds instead of milliseconds.

```lua
hexis.wait(0.5)  -- Wait 500ms
hexis.wait(2)    -- Wait 2 seconds
```

---

## `require(name)`

Loads a library using standard Lua `require()` with sandboxed resolution. Libraries are resolved from `config/hexis/scripts/`.

```lua
local tree_mining = require("hypixel/lib/tree_mining")
local island_nav = require("hypixel/lib/island_nav")
local Competition = require("hypixel/lib/competition")
```

Libraries are loaded once and cached. The return value is the library's module table.

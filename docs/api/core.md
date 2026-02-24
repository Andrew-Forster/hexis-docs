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
    hexis.wait(0.1)
end
```

---

## `hexis.wait(seconds)`

Pauses script execution for the specified duration in **seconds**.

:::warning Seconds, Not Milliseconds
All timing in Hexis uses **seconds**. `hexis.wait(500)` waits 500 seconds (8+ minutes), not 500ms!
:::

```lua
hexis.wait(0.5)   -- Wait 500ms
hexis.wait(2)     -- Wait 2 seconds
hexis.wait(0.05)  -- Wait 50ms (1 tick)
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

## `require(name)`

Loads a library using standard Lua `require()` with sandboxed resolution. Libraries are resolved from `config/hexis/scripts/`.

```lua
local tree_mining = require("hypixel/lib/tree_mining")
local island_nav = require("hypixel/lib/island_nav")
local Competition = require("hypixel/lib/competition")
```

Libraries are loaded once and cached. The return value is the library's module table.

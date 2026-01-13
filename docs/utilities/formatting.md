---
sidebar_position: 2
title: Formatting
description: Number and time formatting utilities
---

# Formatting

Namespace: `hexis.format`

Format numbers and durations for display.

---

## Methods

### `hexis.format.duration(seconds)`

Format seconds as human-readable duration.

```lua
hexis.format.duration(123)    -- "2m 3s"
hexis.format.duration(3661)   -- "1h 1m 1s"
hexis.format.duration(45)     -- "45s"
```

### `hexis.format.number(value)`

Format large numbers with K/M suffixes.

```lua
hexis.format.number(1500)      -- "1.5k"
hexis.format.number(15320)     -- "15.3k"
hexis.format.number(1500000)   -- "1.5M"
hexis.format.number(500)       -- "500"
```

### `hexis.format.coins(value)`

Alias for `number()`. Format coin values.

```lua
hexis.format.coins(15320)      -- "15.3k"
```

---

## Example Usage

```lua
local kills = 1523
local coins = 1500000
local time = 3661

hexis.hud.set_var("kills", hexis.format.number(kills))    -- "1.5k"
hexis.hud.set_var("coins", hexis.format.coins(coins))     -- "1.5M"
hexis.hud.set_var("time", hexis.format.duration(time))    -- "1h 1m 1s"
```

---
sidebar_position: 8
title: Actions
description: General-purpose player actions
---

# Actions API

Namespace: `hexis.actions`

General-purpose actions for player control.

---

## Equipment

### `hexis.actions.equip(options)`

Equips an item from hotbar.

```lua
hexis.actions.equip({pattern = "scythe"})
hexis.actions.equip({name = "Juju Shortbow"})
hexis.actions.equip({item = "Aspect of the End"})

-- Multiple fallbacks (tries in order)
hexis.actions.equip({pattern = "scythe|sword"})
```

---

## Communication

### `hexis.actions.send_chat(message)`

Sends a chat message or command.

```lua
hexis.actions.send_chat({message = "Hello!"})
hexis.actions.send_chat({message = "/hub"})
```

### `hexis.actions.notify(title, message)`

Sends a system notification.

```lua
hexis.actions.notify({
    title = "Alert",
    message = "Low health detected!"
})
```

### `hexis.actions.play_sound(sound)`

Plays a sound effect.

```lua
hexis.actions.play_sound({sound = "entity.experience_orb.pickup"})
```

---

## Movement Actions

### `hexis.actions.sneak(options)`

Sneaks for specified duration.

```lua
hexis.actions.sneak({duration = 1000})  -- Sneak for 1 second
hexis.actions.sneak({count = 3})        -- Sneak 3 times
```

### `hexis.actions.jump()`

Makes player jump.

```lua
hexis.actions.jump()
```

---

## Camera

### `hexis.actions.look_at(target)`

Looks at a target location with smooth or instant aiming.

```lua
-- Smooth aim (for human-like movement)
hexis.actions.look_at({x = 100, y = 65, z = 200, speed = 2.0})

-- Instant aim (for fast reactions)
hexis.actions.look_at({x = 100, y = 65, z = 200, instant = true})
```

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `x, y, z` | number | Required | Target coordinates |
| `speed` | number | 3.0 | Aim speed multiplier |
| `instant` | boolean | false | Skip smooth interpolation, snap directly |

---

## Item Usage

### `hexis.actions.use_item()`

Uses (right-clicks) the held item.

```lua
hexis.actions.use_item()
```

### `hexis.actions.drop_item()`

Drops the held item.

```lua
hexis.actions.drop_item()
```

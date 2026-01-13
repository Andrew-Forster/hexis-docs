---
sidebar_position: 3
title: Logging
description: Debug and informational logging
---

# Logging

Namespace: `hexis.log`

Output messages for debugging and information.

---

## Methods

### `hexis.log.info(message)`

Log an informational message.

```lua
hexis.log.info("Script started!")
hexis.log.info("Found " .. count .. " targets")
```

### `hexis.log.debug(message)`

Log a debug message. Only visible when debug mode is enabled.

```lua
hexis.log.debug("Position: " .. pos.x .. ", " .. pos.y .. ", " .. pos.z)
hexis.log.debug("State: " .. current_state)
```

### `hexis.log.warn(message)`

Log a warning message.

```lua
hexis.log.warn("Low health detected!")
hexis.log.warn("Target not found, retrying...")
```

### `hexis.log.error(message)`

Log an error message.

```lua
hexis.log.error("Navigation failed!")
hexis.log.error("Route file not found: " .. route_name)
```

---

## Chat Output

### `hexis.chat.send(message)`

Send a message to local chat (only you see it).

```lua
hexis.chat.send("Hello!")
```

### `hexis.chat.send_as_hexis(message)`

Send a message with Hexis prefix.

```lua
hexis.chat.send_as_hexis("Script started!")  -- "[Hexis] Script started!"
```

### `hexis.chat.command(command)`

Execute a chat command.

```lua
hexis.chat.command("/hub")
hexis.chat.command("/warp park")
```

---

## Notifications

### `hexis.notify(message)`

Show a client-side notification.

```lua
hexis.notify("Task complete!")
```

### `hexis.actions.notify({title, message})`

Show a system notification with title.

```lua
hexis.actions.notify({
    title = "Alert",
    message = "Low health detected!"
})
```

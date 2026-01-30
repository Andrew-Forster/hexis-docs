---
sidebar_position: 17
title: Chat
description: Chat messages and command execution
---

# Chat API

Namespace: `hexis.chat`

Send chat messages and execute commands. Messages can be sent to the local chat (only you see them) or as commands to the server.

---

## Sending Messages

### `hexis.chat.send(message)`

Sends a message to your local chat. Only you will see this message - it's not sent to other players.

```lua
hexis.chat.send("Script started!")
hexis.chat.send("Found " .. count .. " blocks")
```

### `hexis.chat.send_as_hexis(message)`

Sends a message with the Hexis prefix to your local chat. Useful for branded notifications.

```lua
hexis.chat.send_as_hexis("Mining complete!")
-- Displays: 《Hexis》 Mining complete!
```

---

## Executing Commands

### `hexis.chat.command(cmd)`

Executes a command as if you typed it in chat. The leading slash is optional.

```lua
-- Both work the same:
hexis.chat.command("/warp hub")
hexis.chat.command("warp hub")

-- Examples:
hexis.chat.command("/play sb")
hexis.chat.command("/lobby")
hexis.chat.command("/sethome base")
```

:::warning Warp Commands
Warp commands (like `/warp`, `/is`, `/visit`) trigger a grace period in staff detection. This prevents false positives during teleportation.
:::

---

## Example Usage

### Status Messages

```lua
function hexis.main()
    hexis.chat.send_as_hexis("Farming script started!")

    local crops_harvested = 0

    while hexis.running() do
        -- Farm logic here...
        crops_harvested = crops_harvested + 1

        -- Status update every 100 crops
        if crops_harvested % 100 == 0 then
            hexis.chat.send("Harvested " .. crops_harvested .. " crops")
        end

        hexis.wait(0.5)
    end

    hexis.chat.send_as_hexis("Farming complete! Total: " .. crops_harvested)
end
```

### Island Hopping

```lua
function teleport_to_hub()
    hexis.chat.command("/hub")
    hexis.wait(3)  -- Wait for teleport
end

function teleport_to_island()
    hexis.chat.command("/is")
    hexis.wait(3)
end

function hexis.main()
    while hexis.running() do
        -- Farm on island
        farm_crops()

        -- When inventory full, go to hub
        if hexis.conditions.inventory_full() then
            hexis.chat.send("Inventory full, heading to hub...")
            teleport_to_hub()
            sell_items()
            teleport_to_island()
        end

        hexis.wait(1)
    end
end
```

### Combat Notifications

```lua
function hexis.main()
    hexis.combat.start({
        targets = {"Enderman"},
        style = "ranged"
    })

    local kills = 0

    while hexis.running() do
        -- Track kills via events
        hexis.events.on("chat", "You have slain", function()
            kills = kills + 1

            if kills % 50 == 0 then
                hexis.chat.send_as_hexis("Milestone: " .. kills .. " kills!")
            end
        end)

        hexis.wait(0.1)
    end
end
```

---

## Notes

- `send()` and `send_as_hexis()` only display messages locally - other players cannot see them
- `command()` sends the command to the server as if you typed it
- All chat functions are non-blocking and return immediately
- Messages are rate-limited by Minecraft's built-in chat throttling

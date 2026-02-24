---
sidebar_position: 1
title: Installation
description: How to install Hexis and set up Fabric for Minecraft
---

# Installation Guide

This guide will walk you through installing Hexis, from setting up the Fabric mod loader to running your first script.

---

## Requirements

- **Minecraft Java Edition** (1.21.11)
- **Java 21** or newer
- **A Hexis License** - Purchase at [usehexis.com](https://usehexis.com)

---

## Step 1: Install Fabric Loader

Hexis is a Fabric mod. You'll need to install the Fabric mod loader first.

### Option A: Using the Fabric Installer (Recommended)

1. Download the Fabric Installer from [fabricmc.net/use/installer](https://fabricmc.net/use/installer/)
2. Run the installer (double-click the JAR file)
3. Select **Client** and choose Minecraft version **1.21.11**
4. Click **Install**
5. The installer will create a new profile in your Minecraft launcher

### Option B: Using a Launcher (Prism, MultiMC, etc.)

If you use a third-party launcher like Prism Launcher:

1. Create a new instance
2. Select Minecraft **1.21.11**
3. In the mod loader section, select **Fabric** and install
4. The launcher will handle the rest

---

## Step 2: Install Fabric API

Most Fabric mods require the Fabric API library.

1. Go to [Modrinth](https://modrinth.com/mod/fabric-api) or [CurseForge](https://www.curseforge.com/minecraft/mc-mods/fabric-api)
2. Download **Fabric API** for Minecraft **1.21.11**
3. Place the JAR file in your `mods` folder:
   - **Windows:** `%appdata%\.minecraft\mods`
   - **macOS:** `~/Library/Application Support/minecraft/mods`
   - **Linux:** `~/.minecraft/mods`

---

## Step 3: Install Hexis

1. Download the latest Hexis JAR from your [dashboard](https://usehexis.com/dashboard)
2. Place the Hexis JAR in your `mods` folder (same location as Fabric API)
3. Your mods folder should now contain:
   ```
   mods/
   ├── fabric-api-x.x.x+1.21.11.jar
   └── hexis-x.x.x.jar
   ```

---

## Step 4: Launch and Authenticate

1. Launch Minecraft with the **Fabric** profile
2. On first launch, Hexis will prompt for your license key
3. Enter your license key (found in your [dashboard](https://usehexis.com/dashboard))
4. Hexis will validate your license and activate

---

## Step 5: Open the Hexis Menu

Once in-game:

- Press **H** to open the Hexis menu
- Browse available scripts or create your own
- Configure settings as needed

:::tip Keybinds
You can change the menu keybind in the Hexis settings.
:::

---

## Folder Structure

After installation, Hexis creates a configuration folder:

```
.minecraft/config/hexis/
├── scripts/           # Your Lua scripts go here
│   └── lib/           # Shared libraries for scripts
├── routes/            # Route files (.hxr)
├── settings.json      # Hexis configuration
└── license.key        # Your license information
```

---

## Creating Your First Script

1. Navigate to `.minecraft/config/hexis/scripts/`
2. Create a new file called `my_script.lua`
3. Add the following code:

```lua
hexis.script({
    name = "My First Script",
    description = "Hello World!",
    author = "YourName",
    version = "1.0.0"
})

function hexis.main()
    hexis.log.info("Hello, Hexis!")

    while hexis.running() do
        hexis.log.info("Script is running...")
        hexis.wait(5)  -- Wait 5 seconds
    end

    hexis.log.info("Script stopped!")
end
```

4. In-game, press **H** to open the menu
5. Your script should appear in the list - click to run it!

---

## Troubleshooting

### "Mod requires Fabric API"
Make sure you have Fabric API installed in your mods folder.

### "License invalid"
- Check that your license key is correct
- Ensure you have an active subscription
- Try restarting Minecraft

### "Script not appearing"
- Verify the file extension is `.lua`
- Check for syntax errors - the file must be valid Lua
- Ensure the script calls `hexis.script()` with metadata

### Game crashes on startup
- Make sure you're using Java 21 or newer
- Verify Minecraft version is 1.21.11
- Remove other mods to check for conflicts

---

## Next Steps

- **[Script Lifecycle](/script-lifecycle)** - Learn about script structure and configuration
- **[Core API](/api/core)** - Essential functions for all scripts
- **[Quick Reference](/quick-reference)** - Common patterns at a glance
- **[Best Practices](/guides/best-practices)** - Write better scripts

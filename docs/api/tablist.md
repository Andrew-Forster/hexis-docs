---
sidebar_position: 16
title: Tablist
description: Read tab list header, footer, and player entries
---

# Tablist API

Namespace: `hexis.tablist`

Read the player tab list (Tab key overlay) including header text, footer text, and player display names. Useful for parsing server-specific data like Hypixel SkyBlock scoreboard info, pest counts, and plot data.

---

## Header & Footer

### `hexis.tablist.get_header()`

Returns the tab list header text as a plain string, or `nil` if no header is set.

```lua
local header = hexis.tablist.get_header()
if header then
    hexis.log.info("Header: " .. header)
end
```

### `hexis.tablist.get_footer()`

Returns the tab list footer text as a plain string, or `nil` if no footer is set.

```lua
local footer = hexis.tablist.get_footer()
if footer then
    hexis.log.info("Footer: " .. footer)
end

-- Parse pest count from Hypixel SkyBlock footer
if footer and footer:find("Pests") then
    local count = footer:match("Pests:%s*(%d+)")
    if count then
        hexis.log.info("Pest count: " .. count)
    end
end
```

---

## Search

### `hexis.tablist.find(pattern)`

Searches all player display names in the tab list for the first match containing the pattern (case-insensitive). Returns the matching text or `nil`.

```lua
local match = hexis.tablist.find("Mayor")
if match then
    hexis.log.info("Found: " .. match)
end
```

### `hexis.tablist.find_all(pattern)`

Returns an array of all player display names matching the pattern (case-insensitive). Returns an empty table if no matches.

```lua
local matches = hexis.tablist.find_all("Plot")
for _, line in ipairs(matches) do
    hexis.log.info(line)
end
```

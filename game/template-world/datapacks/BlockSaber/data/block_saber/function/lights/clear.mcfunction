# Drop every light fixture marker; selectors have no tag wildcard, so the bs_light summary tag stands in for the per-group bs_light_* tags
kill @e[type=minecraft:marker,tag=blocksaber,tag=bs_light]

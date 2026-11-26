# Drop-scan for the song browser (the menus are physical items; a "click" is dropping the item and tick.mcfunction
# killing the drop). Detection is per-slot because all song items share the bs_song action - the wildcard
# actions/*.json predicates cannot tell which one a player dropped, so menu_empty_slot says "a page item is gone"
# and the scan below claims the first slot missing its menu_item, resolving it through the staged page.song<k>.
data remove storage bs:menu click
execute unless predicate block_saber:menu_empty_slot run return 0
scoreboard players set @s temp_var_1 -1
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:0b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 0
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:1b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 1
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:2b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 2
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:3b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 3
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:4b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 4
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:5b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 5
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:6b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 6
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:7b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 7
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:8b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 8
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:9b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 9
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:10b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 10
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:11b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 11
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:12b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 12
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:13b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 13
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:14b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 14
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:15b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 15
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:16b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 16
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:17b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 17
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:18b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 18
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:19b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 19
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:20b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 20
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:21b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 21
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:22b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 22
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:23b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 23
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:24b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 24
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:25b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 25
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:26b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 26
execute if score @s temp_var_1 matches -1 run return 0
# slot 0 = back to the main menu; slot 26 = page button (bs:menu page.next, kept in sync with the worn item) or
# its filler (re-render); slots 1-24 = song slots, resolved through the staged page.song keys (a slot without a
# staged song is a dropped filler -> re-render the page).
execute if score @s temp_var_1 matches 0 run function block_saber:inventory/menu_main_set
execute if score @s temp_var_1 matches 1 run data modify storage bs:menu click.slug set from storage bs:menu page.song0
execute if score @s temp_var_1 matches 2 run data modify storage bs:menu click.slug set from storage bs:menu page.song1
execute if score @s temp_var_1 matches 3 run data modify storage bs:menu click.slug set from storage bs:menu page.song2
execute if score @s temp_var_1 matches 4 run data modify storage bs:menu click.slug set from storage bs:menu page.song3
execute if score @s temp_var_1 matches 5 run data modify storage bs:menu click.slug set from storage bs:menu page.song4
execute if score @s temp_var_1 matches 6 run data modify storage bs:menu click.slug set from storage bs:menu page.song5
execute if score @s temp_var_1 matches 7 run data modify storage bs:menu click.slug set from storage bs:menu page.song6
execute if score @s temp_var_1 matches 8 run data modify storage bs:menu click.slug set from storage bs:menu page.song7
execute if score @s temp_var_1 matches 9 run data modify storage bs:menu click.slug set from storage bs:menu page.song8
execute if score @s temp_var_1 matches 10 run data modify storage bs:menu click.slug set from storage bs:menu page.song9
execute if score @s temp_var_1 matches 11 run data modify storage bs:menu click.slug set from storage bs:menu page.song10
execute if score @s temp_var_1 matches 12 run data modify storage bs:menu click.slug set from storage bs:menu page.song11
execute if score @s temp_var_1 matches 13 run data modify storage bs:menu click.slug set from storage bs:menu page.song12
execute if score @s temp_var_1 matches 14 run data modify storage bs:menu click.slug set from storage bs:menu page.song13
execute if score @s temp_var_1 matches 15 run data modify storage bs:menu click.slug set from storage bs:menu page.song14
execute if score @s temp_var_1 matches 16 run data modify storage bs:menu click.slug set from storage bs:menu page.song15
execute if score @s temp_var_1 matches 17 run data modify storage bs:menu click.slug set from storage bs:menu page.song16
execute if score @s temp_var_1 matches 18 run data modify storage bs:menu click.slug set from storage bs:menu page.song17
execute if score @s temp_var_1 matches 19 run data modify storage bs:menu click.slug set from storage bs:menu page.song18
execute if score @s temp_var_1 matches 20 run data modify storage bs:menu click.slug set from storage bs:menu page.song19
execute if score @s temp_var_1 matches 21 run data modify storage bs:menu click.slug set from storage bs:menu page.song20
execute if score @s temp_var_1 matches 22 run data modify storage bs:menu click.slug set from storage bs:menu page.song21
execute if score @s temp_var_1 matches 23 run data modify storage bs:menu click.slug set from storage bs:menu page.song22
execute if score @s temp_var_1 matches 24 run data modify storage bs:menu click.slug set from storage bs:menu page.song23
# bs_menu_page is shared with the difficulty browser, so entering it always starts at page 1 (a song clicked from
# song-page 2+ would otherwise open a zero-item difficulty window); the difficulty page's own page button keeps it.
execute if score @s temp_var_1 matches 1..24 run scoreboard players set @s bs_menu_page 0
execute if score @s temp_var_1 matches 1..24 if data storage bs:menu click.slug run function block_saber:inventory/menu_difficulty_set with storage bs:menu click
execute if score @s temp_var_1 matches 1..24 unless data storage bs:menu click.slug run function block_saber:inventory/menu_selection_set
execute if score @s temp_var_1 matches 26 if data storage bs:menu page.next store result score @s bs_menu_page run data get storage bs:menu page.next
execute if score @s temp_var_1 matches 26 run function block_saber:inventory/menu_selection_set

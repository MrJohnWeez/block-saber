# Drop-scan for the difficulty page (same per-slot mechanism as menu_selection_check - every difficulty item
# shares the bs_play action, so the click is whichever slot lost its menu_item). Staged bs:menu page.diff<k>
# entries resolve into the {slug, diff, diff_entry} snapshot that song/start consumes from bs:menu click.
data remove storage bs:menu click
execute unless predicate block_saber:menu_empty_slot run return 0
scoreboard players set @s temp_var_1 -1
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:9b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 0
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:10b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 1
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:11b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 2
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:12b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 3
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:13b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 4
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:14b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 5
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:15b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 6
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:16b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 7
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:17b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 8
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:18b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 9
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:19b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 10
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:20b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 11
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:21b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 12
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:22b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 13
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:23b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 14
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:24b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 15
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:25b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 16
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:26b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 17
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:27b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 18
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:28b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 19
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:29b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 20
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:30b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 21
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:31b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 22
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:32b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 23
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:33b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 24
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:34b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 25
execute if score @s temp_var_1 matches -1 unless entity @s[nbt={Inventory:[{Slot:35b,components:{"minecraft:custom_data":{menu_item:1b}}}]}] run scoreboard players set @s temp_var_1 26
execute if score @s temp_var_1 matches -1 run return 0
# slot 0 = back to the song browser (page preserved); slot 26 = page button / filler; slots 1-24 = difficulty
# slots -> {slug, diff, diff_entry} click snapshot -> song/start (contract §2.3). Void-filler slots have no staged
# page.diff key, so the token guard sends them to a page re-render instead of a start.
execute if score @s temp_var_1 matches 0 run function block_saber:inventory/menu_selection_set
data modify storage bs:menu click.slug set from storage bs:menu page.slug
execute if score @s temp_var_1 matches 1 run data modify storage bs:menu click.diff set from storage bs:menu page.diff0.id
execute if score @s temp_var_1 matches 1 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff0
execute if score @s temp_var_1 matches 2 run data modify storage bs:menu click.diff set from storage bs:menu page.diff1.id
execute if score @s temp_var_1 matches 2 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff1
execute if score @s temp_var_1 matches 3 run data modify storage bs:menu click.diff set from storage bs:menu page.diff2.id
execute if score @s temp_var_1 matches 3 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff2
execute if score @s temp_var_1 matches 4 run data modify storage bs:menu click.diff set from storage bs:menu page.diff3.id
execute if score @s temp_var_1 matches 4 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff3
execute if score @s temp_var_1 matches 5 run data modify storage bs:menu click.diff set from storage bs:menu page.diff4.id
execute if score @s temp_var_1 matches 5 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff4
execute if score @s temp_var_1 matches 6 run data modify storage bs:menu click.diff set from storage bs:menu page.diff5.id
execute if score @s temp_var_1 matches 6 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff5
execute if score @s temp_var_1 matches 7 run data modify storage bs:menu click.diff set from storage bs:menu page.diff6.id
execute if score @s temp_var_1 matches 7 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff6
execute if score @s temp_var_1 matches 8 run data modify storage bs:menu click.diff set from storage bs:menu page.diff7.id
execute if score @s temp_var_1 matches 8 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff7
execute if score @s temp_var_1 matches 9 run data modify storage bs:menu click.diff set from storage bs:menu page.diff8.id
execute if score @s temp_var_1 matches 9 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff8
execute if score @s temp_var_1 matches 10 run data modify storage bs:menu click.diff set from storage bs:menu page.diff9.id
execute if score @s temp_var_1 matches 10 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff9
execute if score @s temp_var_1 matches 11 run data modify storage bs:menu click.diff set from storage bs:menu page.diff10.id
execute if score @s temp_var_1 matches 11 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff10
execute if score @s temp_var_1 matches 12 run data modify storage bs:menu click.diff set from storage bs:menu page.diff11.id
execute if score @s temp_var_1 matches 12 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff11
execute if score @s temp_var_1 matches 13 run data modify storage bs:menu click.diff set from storage bs:menu page.diff12.id
execute if score @s temp_var_1 matches 13 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff12
execute if score @s temp_var_1 matches 14 run data modify storage bs:menu click.diff set from storage bs:menu page.diff13.id
execute if score @s temp_var_1 matches 14 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff13
execute if score @s temp_var_1 matches 15 run data modify storage bs:menu click.diff set from storage bs:menu page.diff14.id
execute if score @s temp_var_1 matches 15 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff14
execute if score @s temp_var_1 matches 16 run data modify storage bs:menu click.diff set from storage bs:menu page.diff15.id
execute if score @s temp_var_1 matches 16 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff15
execute if score @s temp_var_1 matches 17 run data modify storage bs:menu click.diff set from storage bs:menu page.diff16.id
execute if score @s temp_var_1 matches 17 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff16
execute if score @s temp_var_1 matches 18 run data modify storage bs:menu click.diff set from storage bs:menu page.diff17.id
execute if score @s temp_var_1 matches 18 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff17
execute if score @s temp_var_1 matches 19 run data modify storage bs:menu click.diff set from storage bs:menu page.diff18.id
execute if score @s temp_var_1 matches 19 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff18
execute if score @s temp_var_1 matches 20 run data modify storage bs:menu click.diff set from storage bs:menu page.diff19.id
execute if score @s temp_var_1 matches 20 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff19
execute if score @s temp_var_1 matches 21 run data modify storage bs:menu click.diff set from storage bs:menu page.diff20.id
execute if score @s temp_var_1 matches 21 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff20
execute if score @s temp_var_1 matches 22 run data modify storage bs:menu click.diff set from storage bs:menu page.diff21.id
execute if score @s temp_var_1 matches 22 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff21
execute if score @s temp_var_1 matches 23 run data modify storage bs:menu click.diff set from storage bs:menu page.diff22.id
execute if score @s temp_var_1 matches 23 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff22
execute if score @s temp_var_1 matches 24 run data modify storage bs:menu click.diff set from storage bs:menu page.diff23.id
execute if score @s temp_var_1 matches 24 run data modify storage bs:menu click.diff_entry set from storage bs:menu page.diff23
execute if score @s temp_var_1 matches 1..24 if data storage bs:menu click.diff run function block_saber:song/start with storage bs:menu click
execute if score @s temp_var_1 matches 1..24 unless data storage bs:menu click.diff if data storage bs:menu page.slug run function block_saber:inventory/menu_difficulty_set with storage bs:menu page
execute if score @s temp_var_1 matches 1..24 unless data storage bs:menu click.diff unless data storage bs:menu page.slug run function block_saber:inventory/menu_selection_set
execute if score @s temp_var_1 matches 26 if data storage bs:menu page.next store result score @s bs_menu_page run data get storage bs:menu page.next
execute if score @s temp_var_1 matches 26 if data storage bs:menu page.slug run function block_saber:inventory/menu_difficulty_set with storage bs:menu page
execute if score @s temp_var_1 matches 26 unless data storage bs:menu page.slug run function block_saber:inventory/menu_selection_set

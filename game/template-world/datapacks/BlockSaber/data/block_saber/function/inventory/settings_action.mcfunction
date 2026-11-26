# Settings page click router (fixed, page-unique actions per item, so the static-menu wildcard predicate idiom
# applies; back carries bs_back to return to the pause page). Dropping a toggle flips #CONST bs_lightshow /
# #CONST bs_godmode (port of the 1.18 settings_menu_toggle_* functions, chat feedback kept) and re-renders so the
# ON/OFF labels follow.
scoreboard players set @s temp_var_1 -1
execute unless predicate block_saber:actions/settings_lightshow_action run scoreboard players set @s temp_var_1 16
execute unless predicate block_saber:actions/settings_godmode_action run scoreboard players set @s temp_var_1 17
execute unless predicate block_saber:actions/back_action run scoreboard players set @s temp_var_1 0
execute if score @s temp_var_1 matches 0 run function block_saber:inventory/menu_pause_set
execute if score @s temp_var_1 matches 16 if score #CONST bs_lightshow matches 1 run scoreboard players set #CONST bs_lightshow 0
execute if score @s temp_var_1 matches 16 if score #CONST bs_lightshow matches 0 run scoreboard players set #CONST bs_lightshow 1
execute if score @s temp_var_1 matches 16 if score #CONST bs_lightshow matches 1 run tellraw @a [{text:"[BlockSaber] ",color:"yellow"},{text:"Light Show Enabled",color:"green"}]
execute if score @s temp_var_1 matches 16 if score #CONST bs_lightshow matches 0 run tellraw @a [{text:"[BlockSaber] ",color:"yellow"},{text:"Light Show Disabled",color:"red"}]
execute if score @s temp_var_1 matches 17 if score #CONST bs_godmode matches 1 run scoreboard players set #CONST bs_godmode 0
execute if score @s temp_var_1 matches 17 if score #CONST bs_godmode matches 0 run scoreboard players set #CONST bs_godmode 1
execute if score @s temp_var_1 matches 17 if score #CONST bs_godmode matches 1 run tellraw @a [{text:"[BlockSaber] ",color:"yellow"},{text:"God Mode Enabled",color:"green"}]
execute if score @s temp_var_1 matches 17 if score #CONST bs_godmode matches 0 run tellraw @a [{text:"[BlockSaber] ",color:"yellow"},{text:"God Mode Disabled",color:"red"}]
execute if score @s temp_var_1 matches 16..17 run function block_saber:inventory/settings_set

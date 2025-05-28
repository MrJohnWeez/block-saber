scoreboard players set @s TempVar1 -1
execute unless predicate block_saber:actions/main_menu_action run scoreboard players set @s TempVar1 0
execute unless predicate block_saber:actions/play_action run scoreboard players set @s TempVar1 1
execute if score @s TempVar1 matches 0 run function block_saber:inventory/menu_main_set
execute if score @s TempVar1 matches 1 run function block_saber:play
scoreboard players set @s temp_var_1 -1
execute unless predicate block_saber:actions/main_menu_action run scoreboard players set @s temp_var_1 0
execute unless predicate block_saber:actions/play_action run scoreboard players set @s temp_var_1 1
execute if score @s temp_var_1 matches 0 run function block_saber:inventory/menu_main_set
execute if score @s temp_var_1 matches 1 run function block_saber:play
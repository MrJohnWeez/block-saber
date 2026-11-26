# Pause-page drop router (fixed actions per item, so the static-menu wildcard predicate idiom applies). Both
# exits are stop-and-quit (contract D8: v1 pause has no freeze-resume): Stop and Main Menu both run
# block_saber:stop, whose teardown ends on menu_main_set; Settings opens the toggles page.
scoreboard players set @s temp_var_1 -1
# Full-wipe guard: if every pause item is gone (/clear etc.) rebuild this page instead of guessing a branch
execute unless predicate block_saber:actions/stop_action unless predicate block_saber:actions/main_menu_action unless predicate block_saber:actions/settings_action run scoreboard players set @s temp_var_1 99
execute if score @s temp_var_1 matches 99 run function block_saber:inventory/menu_pause_set
execute if score @s temp_var_1 matches 99 run return 0
execute unless predicate block_saber:actions/stop_action run scoreboard players set @s temp_var_1 13
execute unless predicate block_saber:actions/main_menu_action run scoreboard players set @s temp_var_1 0
execute unless predicate block_saber:actions/settings_action run scoreboard players set @s temp_var_1 16
execute if score @s temp_var_1 matches 0 run function block_saber:stop
execute if score @s temp_var_1 matches 13 run function block_saber:stop
execute if score @s temp_var_1 matches 16 run function block_saber:inventory/settings_set

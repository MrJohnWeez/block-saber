execute as @e[type=item] run kill @s
execute as @a run function block_saber:inventory/check_menu_actions
execute as @a[scores={is_playing=1}] run function block_saber:game_loop

# Debug
scoreboard players operation curr_tick display = MrJohnWeez curr_tick
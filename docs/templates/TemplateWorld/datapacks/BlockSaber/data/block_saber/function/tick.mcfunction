function block_saber:set_player_height
execute as @a run function block_saber:inventory/check_menu_actions
execute as @e[type=item] run kill @s

scoreboard players operation IsPlaying Display = MrJohnWeez IsPlaying
scoreboard players operation CurrentMenu Display = MrJohnWeez CurrentMenu
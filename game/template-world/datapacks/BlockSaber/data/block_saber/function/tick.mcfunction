execute as @e[type=item] run kill @s
execute as @a run function block_saber:inventory/check_menu_actions
execute as @a[scores={is_playing=1}] run function block_saber:game_loop
# Contract §2.4: prune song-registration markers whose pack left datapacks/ (their probe function is gone)
execute as @e[type=minecraft:marker,tag=bs_song] run function block_saber:song/prune

# Debug
scoreboard players operation curr_tick display = MrJohnWeez curr_tick
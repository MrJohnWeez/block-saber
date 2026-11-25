function block_saber:inventory/menu_pause_set
scoreboard players set @s is_playing 1
scoreboard players set @s curr_tick 0
attribute @s minecraft:jump_strength base set 0
attribute @s minecraft:step_height base set 0
gamemode adventure
summon marker -0.0 -0.0 0.0 {Tags:["game_origin","blocksaber"]}
teleport @s -0.0 -0.0 0.0 -180.0 4.0
execute at @e[type=marker,tag=game_origin,distance=3..,limit=1] run function block_saber:setup_game_scene
say is playing!
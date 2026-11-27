# Builds the End stage the moment its chunks exist (play sets #bs_scene_pending; in a fresh world the chunks at
# the stage only start loading when the run's teleport lands there, so build only once the anchor and the far
# corners of all three cubes report loaded - the player has roughly thirteen seconds of void-fall grace anyway).
execute in minecraft:the_end unless loaded 0 150 500 run return 0
execute in minecraft:the_end unless loaded -24 150 410 run return 0
execute in minecraft:the_end unless loaded 23 150 545 run return 0
scoreboard players set #bs_scene_pending bs_temp 0
execute in minecraft:the_end positioned 0.0 150.0 500.0 run function block_saber:setup_game_scene

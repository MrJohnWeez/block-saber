# Per-tick note pipeline for a playing player, in the old active_tick order (spawn happens between row_advance and handle)
execute as @e[type=minecraft:magma_cube,tag=bs_note] store result score @s bs_note_health run data get entity @s Health
execute as @e[type=minecraft:magma_cube,tag=bs_note_blue] run function block_saber:song/hit/right_check
execute as @e[type=minecraft:magma_cube,tag=bs_note_red] run function block_saber:song/hit/left_check
execute as @e[type=minecraft:magma_cube,tag=bs_note_white] run function block_saber:song/hit/white_check
execute as @e[type=minecraft:magma_cube,tag=bs_note_bomb] run function block_saber:song/hit/bomb_check
# Wall checks (port of the check_red_wall_* drivers): eye band from the player's scale, then one driver pass per wall anchor
function block_saber:song/wall_eye_height
execute as @e[type=minecraft:marker,tag=bs_wall] run function block_saber:song/hit/wall_check with storage bs:engine wall_args
# Missed-note cleanup (port of check_for_missed_items driver) runs from the player anchor
execute as @e[type=minecraft:marker,tag=game_origin,limit=1] run function block_saber:notes/despawn_notes

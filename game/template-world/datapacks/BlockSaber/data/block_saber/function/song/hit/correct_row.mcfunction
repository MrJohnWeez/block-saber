# Engine lifecycle ported from _root_class:correct_auto_hit_row_notes (run as the struck note cube) - M4b decides WHEN to call it
scoreboard players operation #bs_temp bs_temp = @s bs_row
execute as @e[type=minecraft:magma_cube,tag=bs_note,distance=..6] if score @s bs_row = #bs_temp bs_temp run function block_saber:song/hit/note_correct

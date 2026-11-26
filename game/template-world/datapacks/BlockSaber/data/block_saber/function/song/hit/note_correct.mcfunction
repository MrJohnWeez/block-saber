# Engine lifecycle ported from _root_class:note_was_correct (kills the visual/cube pair) - M4b adds the correct_point scoring call
execute at @s run kill @e[type=minecraft:display,tag=bs_note_visual,distance=..0.05]
kill @s
# TODO(M4b): function block_saber:song/score/correct_point (M4d) belongs before the kill lines above

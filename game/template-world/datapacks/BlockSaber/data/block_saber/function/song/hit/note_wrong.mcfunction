# Engine lifecycle ported from _root_class:note_was_wrong (kills the visual/cube pair) - M4b adds the wrong_point penalty call
execute at @s run kill @e[type=minecraft:display,tag=bs_note_visual,distance=..0.05]
kill @s
# TODO(M4b): function block_saber:song/score/wrong_point (M4d: health, multiplier, combo, godmode) belongs before the kill lines above

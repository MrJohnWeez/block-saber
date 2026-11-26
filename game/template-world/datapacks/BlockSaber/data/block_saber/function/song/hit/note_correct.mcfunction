# Engine lifecycle ported from _root_class:note_was_correct (scores, then kills the visual/cube pair) - M4b calls this seam
function block_saber:song/score/correct_point
execute at @s run kill @e[type=minecraft:display,tag=bs_note_visual,distance=..0.05]
kill @s

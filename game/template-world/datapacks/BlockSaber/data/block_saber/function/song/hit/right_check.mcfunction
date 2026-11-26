# Scaffolding ported from _root_class:check_right_hit_notes (runs as each blue note cube); judgment belongs to M4b
scoreboard players operation #bs_temp bs_temp = @s bs_row
# TODO(M4b): correct hit - old pack treated surviving damage on blue notes as wrong; re-derive with bs_saber saber tags:
#   execute if score @s bs_note_health matches ..2 at @s as @s run function block_saber:song/hit/correct_row
# TODO(M4b): wrong-saber branch as in left_check, mirrored to the blue side
# TODO(M4b): white notes (tag=bs_note_white) must be accepted by either saber here (contract D7)

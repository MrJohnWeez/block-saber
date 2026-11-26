# Scaffolding ported from _root_class:check_left_hit_notes (runs as each red note cube); judgment belongs to M4b
scoreboard players operation #bs_temp bs_temp = @s bs_row
# TODO(M4b): correct hit when bs_note_health falls below the old <3 threshold:
#   execute if score @s bs_note_health matches ..2 at @s as @s run function block_saber:song/hit/correct_row
# TODO(M4b): wrong-saber branch - old @s[name="Blue Saber"] selector never matched anything in vanilla, replace with real detection
#   execute if entity <wrong-saber-condition> at @s as @s run function block_saber:song/hit/wrong_row
# TODO(M4b): white notes (tag=bs_note_white) must be accepted by either saber here and in right_check (contract D7)

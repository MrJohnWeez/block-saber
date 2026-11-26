# Scaffolding ported from _root_class:check_for_missed_items wrong-point pass (runs as each note still live inside the miss box)
scoreboard players operation #bs_temp bs_temp = @s bs_row
# TODO(M4b): penalty per missed note (port of _root_class:wrong_point incl. GodMode branch + combo reset), then let notes/despawn_notes kill it
# TODO(M4b): white notes miss the same way red/blue do - tag=bs_note_white arrives through this same pass

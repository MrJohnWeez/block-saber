# Scaffolding ported from _root_class:check_for_missed_items wrong-point pass (runs as each note still live inside the miss box)
scoreboard players operation #bs_temp bs_temp = @s bs_row
# Miss penalty (old check_for_missed_items ran wrong_point on every missed noteBlue/noteRed); bombs only get
# despawn_notes' tag=node-style cleanup and never cost points, ported via this guard
execute unless entity @s[tag=bs_note_bomb] run function block_saber:song/score/wrong_point
# TODO(M4b): white notes miss the same way red/blue do - tag=bs_note_white arrives through this same pass

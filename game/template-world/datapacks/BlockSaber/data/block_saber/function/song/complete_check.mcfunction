# Contract §3.7 completion: all three done-flags set and no live notes left
execute if score #bs_notes bs_finished matches 1 if score #bs_walls bs_finished matches 1 if score #bs_lights bs_finished matches 1 unless entity @e[tag=bs_note] run function block_saber:song/complete

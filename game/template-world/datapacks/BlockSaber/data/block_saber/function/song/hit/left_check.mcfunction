# Red-note judgment (port of _root_class:check_left_hit_notes), run as each red note cube after the health snapshot.
# The old wrong-saber branch (@s[name="Blue Saber"]) was dead code in the original pack and is intentionally not
# ported: Block Saber scoring is color-neutral, and contract D7 confirms the emitter never assigns a saber side.
# Health window (26.3): cubes spawn at exactly 100 (max_health attribute, see notes/*.mcfunction), and any melee
# hit lands the snapshot at ..99 while the cube stays alive, so judgment never races the death-removal tick.
execute if score @s bs_note_health matches ..99 at @s as @s run function block_saber:song/hit/correct_row

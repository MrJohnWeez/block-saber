# Blue-note judgment (port of _root_class:check_right_hit_notes), run as each blue note cube after the health
# snapshot. The old file's correct branch keyed off the dead @s[name="Blue Saber"] trick that never matched; the
# shipped game scored every saber hit, so the port scores symmetrically with left_check (contract D7's
# color-neutral rule). Same 100-health window as left_check.
execute if score @s bs_note_health matches ..99 at @s as @s run function block_saber:song/hit/correct_row

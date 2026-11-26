# Scaffolding ported from _root_class:check_bomb_collide (runs as each bomb cube); penalty belongs to M4b
scoreboard players operation #bs_temp bs_temp = @s bs_row
# TODO(M4b): hit-cube branch: bs_note_health below threshold, or hit by a named saber -> function block_saber:song/hit/note_wrong
# TODO(M4b): proximity branch: old checked distance ..0.21 from the fakePlayerEyes marker; M4b must re-summon an equivalent bs marker (port of calculate_fake_eye_height)

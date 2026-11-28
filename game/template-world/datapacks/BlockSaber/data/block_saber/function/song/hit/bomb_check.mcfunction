# Bomb judgment (port of _root_class:check_bomb_collide), run as each bomb cube after the health snapshot.
# Striking a bomb is always a penalty (old health-below-3 branch); the old name-based saber branches were dead code.
# The old ..0.21 fakePlayerEyes proximity branch is dropped: the port deleted that marker when wall checks moved
# inline (song/wall_eye_height), and body-contact penalties are already covered by the wall collision checks.
# Same 100-health window as left_check: ..99 means the bomb was struck.
execute if score @s bs_note_health matches ..99 run function block_saber:song/hit/note_wrong

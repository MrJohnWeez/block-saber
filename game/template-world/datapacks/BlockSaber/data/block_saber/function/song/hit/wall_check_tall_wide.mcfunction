# Second X sample of a 2-wide tall piece (old check_red_wall_2x1 line 2: the extra sample sits at anchor X -0.3), run as the piece.
$execute positioned as @a[scores={is_playing=1},limit=1] positioned ~-0.3 $(ey) ~ if entity @s[distance=..0.2] run function block_saber:song/hit/wall_hit

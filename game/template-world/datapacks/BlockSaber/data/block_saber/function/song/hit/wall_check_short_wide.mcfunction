# Short-band X-0.3 samples of a 2-wide piece (old check_red_wall_2x3 lines 4-6), run as the piece.
$execute positioned as @a[scores={is_playing=1},limit=1] positioned ~-0.3 $(ey) ~ if entity @s[distance=..0.2] run function block_saber:song/hit/wall_hit
$execute positioned as @a[scores={is_playing=1},limit=1] positioned ~-0.3 $(ey) ~ positioned ~ ~0.3 ~ if entity @s[distance=..0.2] run function block_saber:song/hit/wall_hit
$execute positioned as @a[scores={is_playing=1},limit=1] positioned ~-0.3 $(ey) ~ positioned ~ ~-0.3 ~ if entity @s[distance=..0.2] run function block_saber:song/hit/wall_hit

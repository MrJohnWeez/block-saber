# Tall-band samples (port of _root_class:check_red_wall_1x1 + the wide pair of check_red_wall_2x1), run as the wall piece.
# Single eye-height sample per X position: stand at scale 1 hits, sneak (0.5) and jump-stretch (1.5) clear the 0.2 radius.
$execute positioned as @a[scores={is_playing=1},limit=1] positioned ~ $(ey) ~ if entity @s[distance=..0.2] run function block_saber:song/hit/wall_hit
execute if entity @s[tag=bs_wall_2x1] run function block_saber:song/hit/wall_check_tall_wide with storage bs:engine wall_args

# Short-band samples (port of _root_class:check_red_wall_1x3), run as the wall piece.
# Eye Y at eye, eye+0.3, eye-0.3: stand (eye +0.3 vs piece +0.6) hits through the +0.3 sample, jump-stretch hits directly,
# sneak clears all three by >=0.3 - crouch-under behaviour.
$execute positioned as @a[scores={is_playing=1},limit=1] positioned ~ ${ey} ~ if entity @s[distance=..0.2] run function block_saber:song/hit/wall_hit
$execute positioned as @a[scores={is_playing=1},limit=1] positioned ~ ${ey} ~ positioned ~ ~0.3 ~ if entity @s[distance=..0.2] run function block_saber:song/hit/wall_hit
$execute positioned as @a[scores={is_playing=1},limit=1] positioned ~ ${ey} ~ positioned ~ ~-0.3 ~ if entity @s[distance=..0.2] run function block_saber:song/hit/wall_hit
execute if entity @s[tag=bs_wall_2x1] run function block_saber:song/hit/wall_check_short_wide with storage bs:engine wall_args

# Fake-eye height for wall checks (port of _root_class:calculate_fake_eye_height), run as the playing player.
# Old pack sampled abs Y 152.2/152.5/152.8 (sneak/stand/in-air) over a play floor at 151.0, with node origins at 152.2
# -> the three bands are exactly bs_node_origin +0.0/+0.3/+0.6. Re-derived for the scale attribute (set_player_height):
# scale 0.5 (sneak) -> +0.0, scale 1.0 (stand) -> +0.3, scale 1.5 (jump stretch) -> +0.6; unknown scale falls back to stand.
# The old fakePlayerEyes marker is gone: checks re-anchor on the player inline (song/hit/wall_check_*), only the eye Y is stashed here.
execute store result score #bs_wall_scale bs_wall_temp run attribute @s minecraft:scale get 1000
scoreboard players set #bs_wall_band bs_wall_temp 3
execute if score #bs_wall_scale bs_wall_temp matches ..750 run scoreboard players set #bs_wall_band bs_wall_temp 0
execute if score #bs_wall_scale bs_wall_temp matches 1250.. run scoreboard players set #bs_wall_band bs_wall_temp 6
# Eye Y in tenths-of-block: bs_node_origin Y + band, then back to a world-block double for the check macros
execute store result score #bs_wall_ey bs_wall_temp run data get entity @e[type=minecraft:marker,tag=bs_node_origin,limit=1] Pos[1] 10
scoreboard players operation #bs_wall_ey bs_wall_temp += #bs_wall_band bs_wall_temp
execute store result storage bs:engine wall_args.ey double 0.1 run scoreboard players get #bs_wall_ey bs_wall_temp

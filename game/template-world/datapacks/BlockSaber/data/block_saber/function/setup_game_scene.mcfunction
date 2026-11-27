# Scene build port of _root_class:setup_level_map: the three vendored 1.18.2 default-environment cubes (48^3 each,
# block-only) land at the same corner offsets the old structure_block chain used - pt_1 around the stage, pt_2 down
# the incoming-note runway, pt_3 behind the player - so every world gets the identical arena without the
# template-world download (the structure_blocks saved inside the cubes are powered:0 and never re-trigger).
kill @e[type=minecraft:item,distance=..30]
setblock ~ ~-1 ~ minecraft:black_concrete
place template block_saber:default_environment ~-24 ~-22 ~-46
place template block_saber:default_environment_pt2 ~-24 ~-22 ~-94
place template block_saber:default_environment_pt3 ~-24 ~-22 ~2
execute at @e[type=minecraft:marker,tag=game_origin,limit=1] run function block_saber:lights/place

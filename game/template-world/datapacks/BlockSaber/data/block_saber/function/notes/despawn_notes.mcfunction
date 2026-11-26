# Missed-note cleanup behind the player (port of _root_class:check_for_missed_items, run as game_origin marker)
execute positioned ~-1 ~1 ~2 as @e[type=minecraft:magma_cube,tag=bs_note,dx=3,dy=4,dz=2] run function block_saber:song/hit/miss_check
execute positioned ~-1 ~1 ~2 as @e[type=minecraft:magma_cube,tag=bs_note,dx=3,dy=4,dz=2] run kill @s
execute positioned ~-1 ~1 ~2 as @e[type=minecraft:display,tag=bs_node,dx=3,dy=4,dz=2] run kill @s
# Wall anchors inside this box are done (their hit checks ran in notes/handle above); visuals die via the bs_node display pass
execute positioned ~-1 ~1 ~2 run kill @e[type=minecraft:marker,tag=bs_wall,dx=3,dy=4,dz=2]

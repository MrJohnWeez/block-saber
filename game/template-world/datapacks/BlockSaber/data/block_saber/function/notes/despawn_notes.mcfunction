# Missed-note cleanup behind the player (port of _root_class:check_for_missed_items, run as game_origin marker)
execute positioned ~-1 ~1 ~2 as @e[type=minecraft:magma_cube,tag=bs_note,dx=3,dy=4,dz=2] run function block_saber:song/hit/miss_check
execute positioned ~-1 ~1 ~2 as @e[type=minecraft:magma_cube,tag=bs_note,dx=3,dy=4,dz=2] run kill @s
execute positioned ~-1 ~1 ~2 as @e[type=minecraft:display,tag=bs_node,dx=3,dy=4,dz=2] run kill @s
# TODO(M4c): walls (tag=bs_wall_visual) inside this box need their player_in_wall checks before the kill pass

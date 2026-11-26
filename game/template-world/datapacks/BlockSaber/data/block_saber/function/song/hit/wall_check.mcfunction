# Wall hit judgment driver (port of the _root_class:handle_notes check_red_wall_* dispatch), run as each wall piece.
# bs:engine wall_args.ey = eye Y from song/wall_eye_height; eye X/Z come from the playing player inline.
# Old picked the check by piece tag; the contract also spawns short 2-wide walls as wall_2x1, so the tall/short band
# is classified from the piece anchor Y relative to bs_node_origin, in tenths of a block (tall ~ +3, short ~ +6).
execute store result score #bs_wall_dy bs_wall_temp run data get entity @s Pos[1] 10
execute store result score #bs_wall_oy bs_wall_temp run data get entity @e[type=minecraft:marker,tag=bs_node_origin,limit=1] Pos[1] 10
scoreboard players operation #bs_wall_dy bs_wall_temp -= #bs_wall_oy bs_wall_temp
execute if score #bs_wall_dy bs_wall_temp matches 2..4 run function block_saber:song/hit/wall_check_tall with storage bs:engine wall_args
execute if score #bs_wall_dy bs_wall_temp matches 5..7 run function block_saber:song/hit/wall_check_short with storage bs:engine wall_args

# Engine start for a song run: clear leftovers, reset flags, place cursor + spawn-origin markers (port of _root_class:play marker block + folder set_spawn_origin)
# M4f must score #bs_mpt (metersPerTick x1000000) and #bs_lead_m (lead meters) in bs_movespeed before calling
kill @e[tag=bs_node]
kill @e[type=minecraft:marker,tag=bs_node_cursor]
kill @e[type=minecraft:marker,tag=bs_node_origin]
scoreboard players set #bs_row bs_row 0
scoreboard players set #bs_notes bs_finished 0
scoreboard players set #bs_walls bs_finished 0
scoreboard players set #bs_lights bs_finished 0
scoreboard players set #back_lasers bs_light_on 0
scoreboard players set #rings bs_light_on 0
scoreboard players set #rotating_left bs_light_on 0
scoreboard players set #rotating_right bs_light_on 0
scoreboard players set #center bs_light_on 0
scoreboard players set #boost bs_light_on 0
scoreboard players set #extra_left bs_light_on 0
scoreboard players set #extra_right bs_light_on 0
scoreboard players set #side_lasers_left bs_light_on 0
scoreboard players set #side_lasers_right bs_light_on 0
scoreboard players set #back_lasers bs_light_color 0
scoreboard players set #rings bs_light_color 0
scoreboard players set #rotating_left bs_light_color 0
scoreboard players set #rotating_right bs_light_color 0
scoreboard players set #center bs_light_color 0
scoreboard players set #boost bs_light_color 0
scoreboard players set #extra_left bs_light_color 0
scoreboard players set #extra_right bs_light_color 0
scoreboard players set #side_lasers_left bs_light_color 0
scoreboard players set #side_lasers_right bs_light_color 0
execute store result storage bs:engine move_args.speed double 0.000001 run scoreboard players get #bs_mpt bs_movespeed
execute at @e[type=minecraft:marker,tag=game_origin,limit=1] run summon minecraft:marker ~ ~ ~ {Tags:["bs_node_cursor","blocksaber"]}
execute at @e[type=minecraft:marker,tag=game_origin,limit=1] run summon minecraft:marker ~ ~2.2 ~ {Tags:["bs_node_origin","blocksaber"]}
# bs_node_origin sits one full song-lead up the saber column axis (negative Z in front of the player)
execute store result entity @e[type=minecraft:marker,tag=bs_node_origin,limit=1] Pos[2] double -0.000001 run scoreboard players get #bs_lead_m bs_movespeed

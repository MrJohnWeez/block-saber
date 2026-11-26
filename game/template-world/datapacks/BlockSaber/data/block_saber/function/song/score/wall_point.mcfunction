# Player overlapped a wall piece (port of _root_class:player_in_wall): -2 health, Multiplier halved (floor 1), Combo 0.
# Same GodMode semantics as wrong_point; old fired per tick while inside, M4c gates this to once per piece.
execute if score #CONST bs_godmode matches 1 run scoreboard players set #GLOBAL bs_health 50
execute if score #CONST bs_godmode matches 0 run scoreboard players remove #GLOBAL bs_health 2
scoreboard players operation #GLOBAL bs_multiplier /= #CONST CONST_2
execute if score #GLOBAL bs_multiplier matches 0 run scoreboard players set #GLOBAL bs_multiplier 1
execute if score #CONST bs_godmode matches 0 at @e[type=minecraft:marker,tag=game_origin,limit=1] run playsound minecraft:block.ender_chest.open block @a ~ ~ ~ 0.5
scoreboard players set #GLOBAL bs_combo 0

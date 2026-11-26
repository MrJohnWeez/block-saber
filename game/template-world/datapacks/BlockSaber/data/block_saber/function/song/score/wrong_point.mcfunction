# Wrong saber / missed note (port of _root_class:wrong_point): -10 health, Multiplier halved (floor 1), Combo 0.
# Faithful quirk: GodMode only protects HealthPoints (old resets it to 50) - multiplier and combo still fall.
execute if score #CONST bs_godmode matches 1 run scoreboard players set #GLOBAL bs_health 50
execute if score #CONST bs_godmode matches 0 run scoreboard players remove #GLOBAL bs_health 10
scoreboard players operation #GLOBAL bs_multiplier /= #CONST CONST_2
execute if score #GLOBAL bs_multiplier matches 0 run scoreboard players set #GLOBAL bs_multiplier 1
execute if score #CONST bs_godmode matches 0 at @e[type=minecraft:marker,tag=game_origin,limit=1] run playsound minecraft:entity.player.hurt block @a ~ ~ ~ 1
scoreboard players set #GLOBAL bs_combo 0

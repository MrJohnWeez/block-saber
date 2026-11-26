say setting up game scene!
place template block_saber:platform ~-8 ~-10 ~-16 none
execute at @e[type=minecraft:marker,tag=game_origin,limit=1] run function block_saber:lights/place


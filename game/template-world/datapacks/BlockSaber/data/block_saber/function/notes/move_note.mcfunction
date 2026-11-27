# Macro step for one note entity; bs:engine move_args.speed = metersPerTick (set by notes/spawn_begin)
# Old pack moved via local +Z (^ ^ ^MOVESPEED); notes travel along world +Z from the -Z spawn origin here
$execute at @s run teleport @s ~ ~ ~$(speed)

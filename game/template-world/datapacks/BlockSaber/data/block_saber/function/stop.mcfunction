scoreboard players set @s is_playing 0
function block_saber:inventory/menu_main_set
attribute @s minecraft:scale base reset
attribute @s minecraft:jump_strength base reset
attribute @s minecraft:step_height base reset
kill @e[type=minecraft:marker]
gamemode creative
say stopped!
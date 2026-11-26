scoreboard players set @s is_playing 0
function block_saber:inventory/menu_main_set
attribute @s minecraft:scale base reset
attribute @s minecraft:jump_strength base reset
attribute @s minecraft:step_height base reset
kill @e[type=minecraft:marker]
kill @e[tag=bs_node]
kill @e[type=minecraft:text_display,tag=bs_score_display]
function block_saber:lights/clear
gamemode creative
say stopped!
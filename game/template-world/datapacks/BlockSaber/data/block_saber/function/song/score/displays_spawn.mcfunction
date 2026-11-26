# Floating scoring displays (port of the five armor stands in _root_class:spawn_block_saber_titles:
# healthDisplay / comboDisplayTitle / comboDisplayNumber / multiplierTimes / multiplierValue).
# Medium change: 1.18 invisible marker armor stands + CustomName -> 26.3 minecraft:text_display.
# Old summon points are small-armor-stand FEET (nameplate rendered ~+0.5 above); text_display centers its
# text at the entity point, so every y below is the old y + 0.5 (playtest calibration, like the M4a roll quaternions).
kill @e[tag=bs_score_display]
execute at @e[type=minecraft:marker,tag=game_origin,limit=1] run summon minecraft:text_display ~ ~0.5 ~-7 {Tags:["bs_score_display","bs_health_display","blocksaber"],billboard:"center",alignment:"center",line_width:200,background:0,text:[{text:"▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏▏",color:"dark_gray"}]}
execute at @e[type=minecraft:marker,tag=game_origin,limit=1] run summon minecraft:text_display ~-3.3 ~2.2 ~-6 {Tags:["bs_score_display","blocksaber"],billboard:"center",alignment:"center",line_width:200,background:0,text:[{text:"COMBO",color:"white"}]}
execute at @e[type=minecraft:marker,tag=game_origin,limit=1] run summon minecraft:text_display ~-3.3 ~1.9 ~-6 {Tags:["bs_score_display","bs_combo_display","blocksaber"],billboard:"center",alignment:"center",line_width:200,background:0,text:[{score:{name:"#GLOBAL",objective:"bs_combo"},color:"white"}]}
execute at @e[type=minecraft:marker,tag=game_origin,limit=1] run summon minecraft:text_display ~3.5 ~2.1 ~-6 {Tags:["bs_score_display","blocksaber"],billboard:"center",alignment:"center",line_width:200,background:0,text:[{text:"x",color:"white"}]}
execute at @e[type=minecraft:marker,tag=game_origin,limit=1] run summon minecraft:text_display ~3.5 ~2.0 ~-6.4 {Tags:["bs_score_display","bs_multiplier_display","blocksaber"],billboard:"center",alignment:"center",line_width:200,background:0,text:[{score:{name:"#GLOBAL",objective:"bs_multiplier"},color:"white"}]}

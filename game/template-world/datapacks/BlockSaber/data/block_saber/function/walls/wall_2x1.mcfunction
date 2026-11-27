# 2-lane wall piece at the running cursor (contract §3.4, port of _types:wall_2x1 + _types:wall_2x3)
# The contract emits BOTH heights through this one function (tall at origin +0.3, short at +0.6) - song/hit/wall_check classifies the band from anchor Y, and the short case takes the old check_red_wall_2x3 sample set
execute at @s run summon minecraft:marker ~ ~ ~ {Tags:["bs_wall_2x1","bs_wall","bs_node","blocksaber"]}
# Visual: model spans anchor -0.5..+1.5 along +X (covers the cursor lane and its right neighbour, as modelled)
execute at @s run summon minecraft:item_display ~ ~ ~ {Tags:["bs_wall_visual","bs_node","blocksaber"],item_stack:{id:"minecraft:stick",count:1,components:{"minecraft:item_model":"blocksaber:red_wall_2x1"}},item_display:"none",block_light:15,sky_light:15}

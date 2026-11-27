# Short (crouch) 1-lane wall piece at the running cursor (contract §3.4, port of _types:wall_1x3)
# Anchor sits at bs_node_origin +0.6 (short band); the red_wall_1x3 model spans anchor -1.5..+1.5 vertically as modelled
execute at @s run summon minecraft:marker ~ ~ ~ {Tags:["bs_wall_1x3","bs_wall","bs_node","blocksaber"]}
# Visual: old rendered through the armor-stand head display context; item_display:"none" draws the model at its modelled offsets
execute at @s run summon minecraft:item_display ~ ~ ~ {Tags:["bs_wall_visual","bs_node","blocksaber"],item:{id:"minecraft:stick",count:1,components:{"minecraft:item_model":"blocksaber:red_wall_1x3"}},item_display:"none",block_light:15,sky_light:15}

# Tall 1-lane wall piece at the running cursor (contract §3.4, port of _types:wall_1x1)
# Anchor sits at bs_node_origin +0.3 (tall band); old used an invisible marker armor stand with a CMD-20 stick, hit-testing was distance samples - the anchor marker here replaces it (zero hitbox both ways)
execute at @s run summon minecraft:marker ~ ~ ~ {Tags:["bs_wall_1x1","bs_wall","bs_node","blocksaber"]}
# Visual: old rendered through the armor-stand head display context; item_display:"none" draws the model at its modelled offsets (cube centred on the anchor, model pivot [8,8,8])
execute at @s run summon minecraft:item_display ~ ~ ~ {Tags:["bs_wall_visual","bs_node","blocksaber"],item:{id:"minecraft:stick",count:1,components:{"minecraft:item_model":"blocksaber:red_wall_1x1"}},item_display:"none",block_light:15,sky_light:15}

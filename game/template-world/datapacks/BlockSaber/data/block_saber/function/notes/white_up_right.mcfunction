# white up-right cut note (port of _types:white_up_right)
# TODO(M4b): judge with either saber - carries no color tag, hook in song/hit/* only
execute at @s run summon minecraft:magma_cube ~ ~ ~ {Tags:["bs_note_white","bs_note","bs_node","blocksaber","bs_needs_row"],Team:"team_no_collide",NoGravity:1b,Silent:1b,NoAI:1b,DeathLootTable:"minecraft:air",DeathTime:19s,PersistenceRequired:1b,Size:0,Health:100f,attributes:[{id:"minecraft:max_health",base:100.0}],active_effects:[{id:"minecraft:invisibility",duration:99999999,amplifier:0b,show_icon:false,show_particles:false}]}
execute at @s run summon minecraft:item_display ~ ~ ~ {Tags:["bs_note_visual","bs_node","blocksaber"],item:{id:"minecraft:stick",count:1,components:{"minecraft:item_model":"blocksaber:white_arrow"}},item_display:"fixed",block_light:15,sky_light:15,transformation:{left_rotation:[0.0f,1.0f,0.0f,0.0f],right_rotation:[0.0f,0.0f,0.38268f,0.92388f],translation:[0.0f,0.0f,0.0f],scale:[0.5f,0.5f,0.5f]}}
scoreboard players operation @e[type=minecraft:magma_cube,tag=bs_needs_row] bs_row = #bs_row bs_row
tag @e[type=minecraft:magma_cube,tag=bs_needs_row] remove bs_needs_row

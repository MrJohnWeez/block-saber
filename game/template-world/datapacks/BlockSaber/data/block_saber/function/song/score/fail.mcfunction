# Health pool ran out (port of _root_class:spawn_level_failed_titles, triggered by score/tick's fail check):
# stop the run WITHOUT a bs_complete record. The old pack cleared PlayingSong (ends active_tick), killed every
# tag=node mover and stopped the music; bs_failed keeps song/complete_check from recording a completion and
# block_saber:stop does the entity/marker cleanup. Old showed floating red ASCII art in the End arena
# (absolute coordinates, arena-specific decor) - replaced by this chat result (documented deviation).
scoreboard players set #GLOBAL bs_failed 1
kill @e[tag=bs_node]
stopsound @a music
tellraw @a [{text:"[BlockSaber] ",color:"red"},{text:"LEVEL FAILED",color:"red",bold:true}]
execute if data storage bs:engine play.title run tellraw @a [{color:"aqua",nbt:"play.title",storage:"bs:engine",interpret:true},{text:" ",color:"white"},{text:"-",color:"gray"},{text:" Score: ",color:"yellow"},{score:{name:"#GLOBAL",objective:"bs_score"}},{text:"  Max combo: ",color:"aqua"},{score:{name:"#GLOBAL",objective:"bs_combo_max"}}]
execute unless data storage bs:engine play.title run tellraw @a [{text:"Score: ",color:"yellow"},{score:{name:"#GLOBAL",objective:"bs_score"}},{text:"  Max combo: ",color:"aqua"},{score:{name:"#GLOBAL",objective:"bs_combo_max"}}]
title @s actionbar [{text:"LEVEL FAILED",color:"red"}]
function block_saber:stop

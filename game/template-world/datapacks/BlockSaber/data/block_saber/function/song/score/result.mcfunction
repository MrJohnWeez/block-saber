# Song finished cleanly: results display (port of folder_uuid:map_difficulty_completed + the first-time
# bookkeeping of _root_class:spawn_level_cleared + its actionbar "LEVEL <title>: SCORE: <n>"). The old floating
# cyan ASCII "LEVEL CLEARED" armor-stand art and custom end_sound/music-disc fireworks lived in the End arena at
# absolute coords (and end_sound came from each per-song resource pack, which the new song-RP contract forbids) -
# replaced by this SNBT chat/actionbar result (documented deviation). Called from song/complete before block_saber:stop.
stopsound @a music
tellraw @a [{text:"[BlockSaber] ",color:"green"},{text:"LEVEL CLEARED",color:"gold",bold:true}]
# Song identity from the bs:engine play handoff (M4f's song/start writes title/artist/diff/char from the
# song marker's bs compound; degrade to score lines until M4f lands, same guard style as song/complete).
execute if data storage bs:engine play.title run tellraw @a [{color:"aqua",nbt:"play.title",storage:"bs:engine",interpret:true},{text:" by ",color:"gold"},{color:"red",nbt:"play.artist",storage:"bs:engine",interpret:true},{text:" [",color:"gray"},{color:"light_purple",nbt:"play.diff",storage:"bs:engine",interpret:true},{text:"/",color:"gray"},{color:"gray",nbt:"play.char",storage:"bs:engine",interpret:true},{text:"]",color:"gray"}]
tellraw @a [{text:"Score: ",color:"yellow"},{score:{name:"#GLOBAL",objective:"bs_score"}},{text:"  Max combo: ",color:"aqua"},{score:{name:"#GLOBAL",objective:"bs_combo_max"}}]
execute if data storage bs:engine play.title run title @s actionbar [{text:"LEVEL ",color:"yellow"},{color:"aqua",nbt:"play.title",storage:"bs:engine",interpret:true},{text:": SCORE: ",color:"yellow"},{score:{name:"#GLOBAL",objective:"bs_score"}}]
execute unless data storage bs:engine play.title run title @s actionbar [{text:"LEVEL CLEARED: SCORE: ",color:"yellow"},{score:{name:"#GLOBAL",objective:"bs_score"}}]

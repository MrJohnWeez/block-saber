# Macro (bs:engine sel = {tag, diff}): contract §4.2 engine-checks-song-pack direction, before any scene setup -
# the song marker's bs.contract must equal #CONST song_contract (= BS_API_VERSION, §4.2), else the friendly refusal.
# Also demands the §1.3 <token>_play dispatcher file exists so hand-corrupted packs refuse loudly, not silently.
$execute store success score #menu_found bs_temp unless entity @e[type=minecraft:marker,tag=${tag},tag=bs_song,limit=1]
execute if score #menu_found bs_temp matches 1 run tellraw @s [{text:"[BlockSaber] ",color:"red"},{text:"That song pack is no longer installed. Run its install command again after /reload.",color:"red"}]
execute if score #menu_found bs_temp matches 1 run return 0
# Defaults first: a marker missing bs.contract/bs.title falls back to contract 0 / generic name instead of
# leaking the previous handshake's staged values into the refusal line.
data modify storage bs:engine sel.want set value 0
data modify storage bs:engine sel.title set value "this song"
$data modify storage bs:engine sel.want set from entity @e[type=minecraft:marker,tag=${tag},tag=bs_song,limit=1] bs.contract
$data modify storage bs:engine sel.title set from entity @e[type=minecraft:marker,tag=${tag},tag=bs_song,limit=1] bs.title
# A marker without bs.contract (hand-summoned junk) must read as contract 0, not as the previous handshake's score
scoreboard players set #sel_contract bs_temp -1
execute store result score #sel_contract bs_temp run data get storage bs:engine sel.want
execute unless score #sel_contract bs_temp = #CONST song_contract run function block_saber:song/start_reject with storage bs:engine sel
execute unless score #sel_contract bs_temp = #CONST song_contract run return 0
$execute store success score #menu_found bs_temp unless function ${tag}:${diff}_play
$execute if score #menu_found bs_temp matches 1 run tellraw @s [{text:"[BlockSaber] ",color:"red"},{text:"Song pack ",color:"red"},{text:"${tag}",color:"aqua"},{text:" is missing its ",color:"red"},{text:"${diff}",color:"aqua"},{text:" files. Re-convert it at block-saber.web.",color:"red"}]
execute if score #menu_found bs_temp matches 1 run return 0
function block_saber:song/start_run with storage bs:engine sel

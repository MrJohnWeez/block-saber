# Macro (bs:engine sel = {tag, slug, diff}): contract §4.2 engine-checks-song-pack direction, before any scene
# setup - the song's bs:songs record contract field must equal #CONST song_contract (= BS_API_VERSION, §4.2),
# else the friendly refusal. No <token>_play existence guard here: 26.3 `execute if/unless function` EXECUTES its
# target and tests the result, so guarding a side-effecting dispatcher is impossible - record + contract checks
# are the whole gate.
$execute store success score #menu_found bs_temp unless data storage bs:songs $(slug)
execute if score #menu_found bs_temp matches 1 run tellraw @s [{text:"[BlockSaber] ",color:"red"},{text:"That song pack is no longer installed. Run its install command again after /reload.",color:"red"}]
execute if score #menu_found bs_temp matches 1 run return 0
# Defaults first: a record missing contract/title falls back to contract 0 / generic name instead of leaking the
# previous handshake's staged values into the refusal line.
data modify storage bs:engine sel.want set value 0
data modify storage bs:engine sel.title set value "this song"
$data modify storage bs:engine sel.want set from storage bs:songs $(slug).contract
$data modify storage bs:engine sel.title set from storage bs:songs $(slug).title
# A record without contract (hand-edited junk) must read as contract 0, not as the previous handshake's score
scoreboard players set #sel_contract bs_temp -1
execute store result score #sel_contract bs_temp run data get storage bs:engine sel.want
execute unless score #sel_contract bs_temp = #CONST song_contract run function block_saber:song/start_reject with storage bs:engine sel
execute unless score #sel_contract bs_temp = #CONST song_contract run return 0
function block_saber:song/start_run with storage bs:engine sel

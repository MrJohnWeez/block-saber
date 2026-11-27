# Macro (bs:engine menu_ctx.i): walks the bs:songs order registry by 0-based index (26.3 registry storage, §2.1),
# rendering the page window [menu_win_lo, menu_win_hi] (1-based) and recursing through menu_song_next. Entry i of
# the window is staged to bs:menu page.song<i-win_lo> by menu_song_stage; the first entry past the window flips
# the more-pages flag #menu_more and ends the walk (every later entry is past it too).
$execute store success score #menu_found bs_temp unless data storage bs:songs order[$(i)]
execute if score #menu_found bs_temp matches 1 run return 0
$scoreboard players set #menu_iter bs_temp $(i)
scoreboard players add #menu_iter bs_temp 1
execute if score #menu_iter bs_temp > #menu_win_hi bs_temp run scoreboard players set #menu_more bs_temp 1
execute if score #menu_iter bs_temp > #menu_win_hi bs_temp run return 0
execute if score #menu_iter bs_temp < #menu_win_lo bs_temp run function block_saber:inventory/menu_song_next
execute if score #menu_iter bs_temp < #menu_win_lo bs_temp run return 0
scoreboard players operation #menu_slot bs_temp = #menu_iter bs_temp
scoreboard players operation #menu_slot bs_temp -= #menu_win_lo bs_temp
execute store result storage bs:engine menu_ctx.slot int 1 run scoreboard players get #menu_slot bs_temp
scoreboard players add #menu_slot bs_temp 1
execute store result storage bs:engine menu_ctx.slot1 int 1 run scoreboard players get #menu_slot bs_temp
$data modify storage bs:engine menu_ctx.slug set from storage bs:songs order[$(i)].slug
function block_saber:inventory/menu_song_meta with storage bs:engine menu_ctx
function block_saber:inventory/menu_song_stage with storage bs:engine menu_ctx
function block_saber:inventory/menu_song_next

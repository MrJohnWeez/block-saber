# Macro (bs:engine diff_ctx.i): walks bs:menu page.diffs (the song marker's bs.diffs copy) by absolute index,
# rendering the current page window [menu_win_lo, menu_win_hi] and recursing until the list ends. Entry k of the
# window is staged to bs:menu page.diff<k-1> and rendered through menu_diff_stage.
$execute store success score #menu_found bs_temp unless data storage bs:menu page.diffs[${i}]
execute if score #menu_found bs_temp matches 1 run return 0
$scoreboard players set #diff_i bs_temp ${i}
scoreboard players operation #menu_slot bs_temp = #diff_i bs_temp
scoreboard players operation #menu_slot bs_temp -= #menu_win_lo bs_temp
execute if score #menu_slot bs_temp matches 24.. run return 0
execute store result storage bs:engine menu_ctx.slot int 1 run scoreboard players get #menu_slot bs_temp
scoreboard players add #menu_slot bs_temp 1
execute store result storage bs:engine menu_ctx.slot1 int 1 run scoreboard players get #menu_slot bs_temp
$data modify storage bs:menu page.diff${slot} set from storage bs:menu page.diffs[${i}]
data modify storage bs:engine menu_ctx.slug set from storage bs:menu page.slug
$data modify storage bs:engine menu_ctx.token set from storage bs:menu page.diff${slot}.id
$data modify storage bs:engine menu_ctx.diff_label set from storage bs:menu page.diff${slot}.diff
$data modify storage bs:engine menu_ctx.char_label set from storage bs:menu page.diff${slot}.char
scoreboard players add #diff_i bs_temp 1
execute store result storage bs:engine diff_ctx.i int 1 run scoreboard players get #diff_i bs_temp
function block_saber:inventory/menu_diff_stage with storage bs:engine menu_ctx
function block_saber:inventory/menu_diff_iter with storage bs:engine diff_ctx

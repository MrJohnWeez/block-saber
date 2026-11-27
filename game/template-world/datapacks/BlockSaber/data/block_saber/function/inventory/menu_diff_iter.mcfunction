# Macro (bs:engine diff_ctx = {i, slot}): walks bs:menu page.diffs by 0-based absolute list index i, rendering
# the current page window (24 entries starting at diff_ctx.slot 0) and recursing until the list ends or the
# window is full. Both the list index and the window slot are macro ARGUMENTS (the whole call instantiates
# atomically on 26.3 - a variable missing from diff_ctx silently no-ops the ENTIRE function), and the entry is
# staged whole to bs:menu page.diff<slot> for menu_difficulty_check to resolve the dropped slot.
$execute store success score #menu_found bs_temp unless data storage bs:menu page.diffs[$(i)]
execute if score #menu_found bs_temp matches 1 run return 0
$data modify storage bs:menu page.diff$(slot) set from storage bs:menu page.diffs[$(i)]
data modify storage bs:engine menu_ctx.slug set from storage bs:menu page.slug
$data modify storage bs:engine menu_ctx.token set from storage bs:menu page.diff$(slot).id
$data modify storage bs:engine menu_ctx.diff_label set from storage bs:menu page.diff$(slot).diff
$data modify storage bs:engine menu_ctx.char_label set from storage bs:menu page.diff$(slot).char
$scoreboard players set #diff_slot1 bs_temp $(slot)
scoreboard players add #diff_slot1 bs_temp 1
execute store result storage bs:engine menu_ctx.slot1 int 1 run scoreboard players get #diff_slot1 bs_temp
function block_saber:inventory/menu_diff_stage with storage bs:engine menu_ctx
$scoreboard players set #diff_i bs_temp $(i)
$scoreboard players set #diff_slot bs_temp $(slot)
scoreboard players add #diff_i bs_temp 1
scoreboard players add #diff_slot bs_temp 1
execute if score #diff_slot bs_temp matches 24.. run return 0
execute store result storage bs:engine diff_ctx.i int 1 run scoreboard players get #diff_i bs_temp
execute store result storage bs:engine diff_ctx.slot int 1 run scoreboard players get #diff_slot bs_temp
function block_saber:inventory/menu_diff_iter with storage bs:engine diff_ctx

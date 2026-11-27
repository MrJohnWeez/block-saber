# Macro (caller storage = {slug}, i.e. bs:menu click on song-slot drop or bs:menu page on re-render): difficulty
# page for one song (§2.3). Slot 0 = back to the song browser (bs_menu_page keeps its page value), one item per
# bs:songs record diffs[] entry in slots 1-24, page button in slot 26. Each rendered entry is staged whole
# (id/diff/char/mpt_millionths/lead_m) to bs:menu page.diff<k> so menu_difficulty_check can hand song/start the
# complete selection snapshot for whichever slot the player dropped.
$execute store success score #menu_found bs_temp unless data storage bs:songs $(slug)
execute if score #menu_found bs_temp matches 1 run tellraw @s [{text:"[BlockSaber] ",color:"red"},{text:"That song pack is no longer installed. Run its install command again after /reload.",color:"red"}]
execute if score #menu_found bs_temp matches 1 run function block_saber:inventory/menu_selection_set
execute if score #menu_found bs_temp matches 1 run return 0
scoreboard players operation @s current_menu = #CONST SONG_MENU
function block_saber:inventory/clear_menu
function block_saber:inventory/menu_filler
item replace entity @s inventory.0 with minecraft:stick[custom_name=[{"text":"Back","color":"blue"}],item_name=[{"text":""}],enchantment_glint_override=true,item_model="blocksaber:blue_dot",custom_data={action:"bs_back",menu_item:1b},tooltip_display={hidden_components:[tooltip_display]}] 1
tag @s add bs_menu_open
data remove storage bs:menu page
$data modify storage bs:menu page.slug set value "$(slug)"
$data modify storage bs:menu page.title set from storage bs:songs $(slug).title
$data modify storage bs:menu page.diffs set from storage bs:songs $(slug).diffs
execute if data storage bs:menu page.title run tellraw @s [{text:"[BlockSaber] ",color:"gold"},{text:"Selected Song: ",color:"yellow"},{text:"",color:"aqua",nbt:"page.title",storage:"bs:menu"}]
scoreboard players set #menu_more bs_temp 0
execute unless score @s bs_menu_page matches -2147483648..2147483647 run scoreboard players set @s bs_menu_page 0
execute store result storage bs:engine menu_ctx.page int 1 run scoreboard players get @s bs_menu_page
function block_saber:inventory/menu_page_window with storage bs:engine menu_ctx
scoreboard players operation #menu_probe bs_temp = #menu_win_hi bs_temp
scoreboard players add #menu_probe bs_temp 1
execute store result storage bs:engine menu_ctx.probe int 1 run scoreboard players get #menu_probe bs_temp
function block_saber:inventory/menu_diff_more with storage bs:engine menu_ctx
execute store result storage bs:engine diff_ctx.i int 1 run scoreboard players get #menu_win_lo bs_temp
function block_saber:inventory/menu_diff_iter with storage bs:engine diff_ctx
scoreboard players operation #menu_next bs_temp = @s bs_menu_page
execute if score #menu_more bs_temp matches 1 run scoreboard players add #menu_next bs_temp 1
execute if score #menu_more bs_temp matches 1 store result storage bs:engine menu_ctx.next int 1 run scoreboard players get #menu_next bs_temp
execute if score #menu_more bs_temp matches 1 run data modify storage bs:menu page.next set from storage bs:engine menu_ctx.next
execute if score #menu_more bs_temp matches 1 run function block_saber:inventory/menu_page_next_button with storage bs:engine menu_ctx
tag @s remove bs_menu_open

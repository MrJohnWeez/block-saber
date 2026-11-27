# Song-selection page (contract §2.3): back (slot 0), one item per song in the bs:songs order registry (slots
# 1-24), next-page button (slot 26 when another page follows). Pages are 24-item windows over registry order
# (contract D9), enumerated by menu_song_iter's indexed recursion - 26.3 dropped free-form entity NBT, so the
# song registry is bs:songs storage, not marker metadata. Each rendered song is staged to bs:menu page.song<k>
# so menu_selection_check can resolve the slot a player dropped.
scoreboard players operation @s current_menu = #CONST SELECTION_MENU
function block_saber:inventory/clear_menu
function block_saber:inventory/menu_filler
item replace entity @s inventory.0 with minecraft:stick[custom_name=[{"text":"Main Menu","color":"blue"}],item_name=[{"text":""}],enchantment_glint_override=true,item_model="blocksaber:blue_dot",custom_data={action:main_menu,menu_item:1b},tooltip_display={hidden_components:[tooltip_display]}] 1
tag @s add bs_menu_open
data remove storage bs:menu page
scoreboard players set #menu_idx bs_temp 0
scoreboard players set #menu_more bs_temp 0
# Late joiners never saw init's reset - default the page cursor if this player has no score yet
execute unless score @s bs_menu_page matches -2147483648..2147483647 run scoreboard players set @s bs_menu_page 0
execute store result storage bs:engine menu_ctx.page int 1 run scoreboard players get @s bs_menu_page
function block_saber:inventory/menu_page_window with storage bs:engine menu_ctx
execute store result storage bs:engine menu_ctx.i int 1 run scoreboard players get #menu_idx bs_temp
function block_saber:inventory/menu_song_iter with storage bs:engine menu_ctx
execute unless data storage bs:songs order[0] run tellraw @s [{text:"[BlockSaber] ",color:"green"},{text:"No songs installed yet. Drop a song pack into ",color:"gray"},{text:"datapacks/",color:"aqua"},{text:" and run ",color:"gray"},{text:"/reload",color:"aqua"},{text:" - it registers itself a moment later.",color:"gray"}]
execute if score #menu_more bs_temp matches 1 run scoreboard players operation #menu_next bs_temp = @s bs_menu_page
execute if score #menu_more bs_temp matches 1 run scoreboard players add #menu_next bs_temp 1
execute if score #menu_more bs_temp matches 1 store result storage bs:engine menu_ctx.next int 1 run scoreboard players get #menu_next bs_temp
execute if score #menu_more bs_temp matches 1 run data modify storage bs:menu page.next set from storage bs:engine menu_ctx.next
execute if score #menu_more bs_temp matches 1 run function block_saber:inventory/menu_page_next_button with storage bs:engine menu_ctx
tag @s remove bs_menu_open

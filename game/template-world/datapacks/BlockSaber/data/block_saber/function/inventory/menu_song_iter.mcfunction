# One installed song marker (@s, called per marker from menu_selection_set in selector order - contract D9).
# #menu_iter is the 1-based song index; markers outside the page window are skipped, ones past its end flip the
# more-pages flag #menu_more. In-window songs stage everything the macro renderer needs into bs:engine menu_ctx
# (the open player wears tag bs_menu_open because @s is the marker here).
scoreboard players add #menu_iter bs_temp 1
execute if score #menu_iter bs_temp > #menu_win_hi bs_temp run scoreboard players set #menu_more bs_temp 1
execute if score #menu_iter bs_temp > #menu_win_hi bs_temp run return 0
execute if score #menu_iter bs_temp <= #menu_win_lo bs_temp run return 0
scoreboard players operation #menu_slot bs_temp = #menu_iter bs_temp
scoreboard players operation #menu_slot bs_temp -= #menu_win_lo bs_temp
data modify storage bs:engine menu_ctx.title set from entity @s bs.title
data modify storage bs:engine menu_ctx.artist set from entity @s bs.artist
data modify storage bs:engine menu_ctx.slug set from entity @s bs.slug
execute store result storage bs:engine menu_ctx.slot int 1 run scoreboard players get #menu_slot bs_temp
scoreboard players add #menu_slot bs_temp 1
execute store result storage bs:engine menu_ctx.slot1 int 1 run scoreboard players get #menu_slot bs_temp
function block_saber:inventory/menu_song_stage with storage bs:engine menu_ctx

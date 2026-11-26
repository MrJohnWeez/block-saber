# Macro (bs:engine menu_ctx.page): page window bounds for the menu browsers - 24 items per page starting at
# slot 1, so page P covers marker indexes (1-based) page*24+1 .. page*24+24.
$scoreboard players set #menu_win_lo bs_temp ${page}
scoreboard players operation #menu_win_lo bs_temp *= #CONST CONST_24
scoreboard players add #menu_win_lo bs_temp 1
scoreboard players operation #menu_win_hi bs_temp = #menu_win_lo bs_temp
scoreboard players add #menu_win_hi bs_temp 23

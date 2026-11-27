# Advance menu_song_iter's 0-based scan cursor (#menu_idx mirrored into menu_ctx.i) by one and recurse.
scoreboard players add #menu_idx bs_temp 1
execute store result storage bs:engine menu_ctx.i int 1 run scoreboard players get #menu_idx bs_temp
function block_saber:inventory/menu_song_iter with storage bs:engine menu_ctx

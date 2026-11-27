# Macro (bs:engine menu_ctx.probe): more-pages flag for the difficulty page - true when page.diffs still has an
# entry past the current window (the 0-based index just beyond the last slot, the caller derives from menu_win_hi).
$execute store success score #menu_more bs_temp if data storage bs:menu page.diffs[$(probe)]

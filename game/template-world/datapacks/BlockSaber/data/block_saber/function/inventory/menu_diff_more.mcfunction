# Macro (bs:engine menu_ctx.probe): more-pages flag for the difficulty page - true when the marker's bs.diffs
# still has an entry past the current page window.
$execute store success score #menu_more bs_temp if data storage bs:menu page.diffs[$(probe)]

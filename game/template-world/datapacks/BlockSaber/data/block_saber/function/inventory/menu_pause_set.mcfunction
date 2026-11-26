# Pause page = stop-and-quit only (contract D8; port of the old drop-the-parked-Main-Menu-item escape, now a
# Stop button plus a Settings button). Every slot carries a menu item (back + filler panes) so a dropped button
# is unambiguous for menu_pause_check.
scoreboard players operation @s current_menu = #CONST PAUSE_MENU
function block_saber:inventory/clear_menu
function block_saber:inventory/menu_filler
item replace entity @s inventory.0 with minecraft:stick[custom_name=[{"text":"Main Menu","color":"blue"}],item_name=[{"text":""}],enchantment_glint_override=true,item_model="blocksaber:blue_dot",custom_data={action:main_menu,menu_item:1b},tooltip_display={hidden_components:[tooltip_display]}] 1
item replace entity @s inventory.13 with minecraft:stick[custom_name=[{"text":"Stop","color":"red"}],item_name=[{"text":""}],enchantment_glint_override=true,item_model="blocksaber:blue_dot",custom_data={action:stop,menu_item:1b},tooltip_display={hidden_components:[tooltip_display]}] 1
item replace entity @s inventory.16 with minecraft:stick[custom_name=[{"text":"Settings","color":"gold"}],item_name=[{"text":""}],enchantment_glint_override=true,item_model="blocksaber:blue_dot",custom_data={action:settings,menu_item:1b},tooltip_display={hidden_components:[tooltip_display]}] 1

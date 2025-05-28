scoreboard players operation @s CurrentMenu = #CONST GameSelectionMenu
function block_saber:inventory/clear_menu
item replace entity @s inventory.0 with minecraft:stick[custom_name=[{"text":"Main Menu","color":"blue"}],item_name=[{"text":""}],enchantment_glint_override=true,item_model="blocksaber:blue_dot",custom_data={action:main_menu,menu_item:1b},tooltip_display={hidden_components:[tooltip_display]}] 1
item replace entity @s inventory.11 with minecraft:stick[custom_name=[{"text":"Play","color":"green"}],item_name=[{"text":""}],enchantment_glint_override=true,item_model="blocksaber:blue_dot",custom_data={action:play,menu_item:1b},tooltip_display={hidden_components:[tooltip_display]}] 1

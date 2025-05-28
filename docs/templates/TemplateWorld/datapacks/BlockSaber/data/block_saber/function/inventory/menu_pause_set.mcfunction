scoreboard players operation @s CurrentMenu = #CONST PauseMenu
function block_saber:inventory/clear_menu
item replace entity @s inventory.0 with minecraft:stick[custom_name=[{"text":"Main Menu","color":"blue"}],item_name=[{"text":""}],enchantment_glint_override=true,item_model="blocksaber:blue_dot",custom_data={action:main_menu,menu_item:1b},tooltip_display={hidden_components:[tooltip_display]}] 1

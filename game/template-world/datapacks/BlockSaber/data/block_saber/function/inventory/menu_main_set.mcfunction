scoreboard players operation @s current_menu = #CONST MAIN_MENU
execute as @s run function block_saber:inventory/clear_menu
item replace entity @s inventory.13 with minecraft:stick[custom_name=[{"text":"Game Selection","color":"green"}],item_name=[{"text":""}],enchantment_glint_override=true,item_model="blocksaber:blue_dot",custom_data={action:game_selection,menu_item:1b},tooltip_display={hidden_components:[tooltip_display]}] 1

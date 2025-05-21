function block_saber:set_player_height
# in a function or via command:
execute as @a unless predicate block_saber:menu_action_1 run say Main Menu
execute as @a if predicate block_saber:menu_action_empty run function block_saber:inventory/base_menu
execute as @a unless predicate block_saber:menu_action_1 run function block_saber:inventory/main_menu
# item replace entity MrJohnWeez inventory.0 with stick[custom_data={blocksaber:main_menu}] 1
# /give @a stick[custom_data={blocksaber:main_menu}]


# give @a stick[custom_name=[{"text":"Main Menu","color":"red"}],item_name=[{"text":" ","italic":false}],tooltip_display={hide_tooltip:true,hidden_components:[can_break,can_place_on,enchantments,tooltip_display,unbreakable]},enchantment_glint_override=true,unbreakable={},max_stack_size=1,item_model="blocksaber:blue_dot",custom_data={blocksaber:main_menu}]
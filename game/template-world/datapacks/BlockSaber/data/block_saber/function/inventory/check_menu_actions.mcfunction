execute if score @s current_menu = #CONST MAIN_MENU run function block_saber:inventory/menu_main_check
execute if score @s current_menu = #CONST SELECTION_MENU run function block_saber:inventory/menu_selection_check
execute if score @s current_menu = #CONST PAUSE_MENU run function block_saber:inventory/menu_pause_check
execute if score @s current_menu = #CONST SONG_MENU run function block_saber:inventory/menu_difficulty_check
execute if score @s current_menu = #CONST SETTINGS_MENU run function block_saber:inventory/settings_action

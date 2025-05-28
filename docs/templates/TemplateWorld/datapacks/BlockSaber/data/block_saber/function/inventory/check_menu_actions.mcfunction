execute if score @s CurrentMenu = #CONST MainMenu run function block_saber:inventory/menu_main_check
execute if score @s CurrentMenu = #CONST GameSelectionMenu run function block_saber:inventory/menu_selection_check
execute if score @s CurrentMenu = #CONST PauseMenu run function block_saber:inventory/menu_pause_check
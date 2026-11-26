# Opening the song browser always starts at page 1; bs_menu_page is per-player so re-renders (back buttons,
# filler drops) keep the page the player was on.
execute unless predicate block_saber:actions/game_selection_action run scoreboard players set @s bs_menu_page 0
execute unless predicate block_saber:actions/game_selection_action run function block_saber:inventory/menu_selection_set

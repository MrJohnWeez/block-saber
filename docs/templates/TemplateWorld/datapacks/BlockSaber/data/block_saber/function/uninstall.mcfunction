# Stop all games
execute as @a run function block_saber:stop

# Define Teams
team remove team_no_collide

# Scoreboards
scoreboard objectives remove current_menu
scoreboard objectives remove is_playing

# Consts
scoreboard objectives remove MAIN_MENU
scoreboard objectives remove SELECTION_MENU
scoreboard objectives remove PAUSE_MENU
scoreboard objectives remove CONST_0

# Temp vars
scoreboard objectives remove temp_var_1
scoreboard objectives remove TempVar2
scoreboard objectives remove TempVar3
scoreboard objectives remove TempVar4
scoreboard objectives remove display

say BlockSaber Uninstalled!
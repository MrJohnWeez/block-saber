# Stop all games
execute as @a run function block_saber:stop

# Define Teams
team remove team_no_collide

# Scoreboards
scoreboard objectives remove current_menu
scoreboard objectives remove is_playing
scoreboard objectives remove bs_note_health
scoreboard objectives remove bs_row
scoreboard objectives remove bs_temp
scoreboard objectives remove bs_movespeed
scoreboard objectives remove song_contract
scoreboard objectives remove bs_finished
scoreboard objectives remove bs_light_on
scoreboard objectives remove bs_light_color
scoreboard objectives remove bs_complete

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
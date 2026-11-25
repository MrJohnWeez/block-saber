function block_saber:uninstall

# World commands
gamerule commandBlockOutput false
gamerule sendCommandFeedback false
gamerule logAdminCommands true
gamerule doMobSpawning false
gamerule announceAdvancements false
difficulty normal

#Define Teams
team add team_no_collide
team modify team_no_collide collisionRule never
team modify team_no_collide deathMessageVisibility never

# Consts
scoreboard objectives add MAIN_MENU dummy
scoreboard objectives add SELECTION_MENU dummy
scoreboard objectives add PAUSE_MENU dummy
scoreboard objectives add CONST_0 dummy
scoreboard players set #CONST CONST_0 0
scoreboard players set #CONST MAIN_MENU 1
scoreboard players set #CONST SELECTION_MENU 2
scoreboard players set #CONST PAUSE_MENU 3

# Globals
scoreboard objectives add game_session_id dummy
scoreboard players set #GLOBAL game_session_id 1

# General Vars
scoreboard objectives add current_menu dummy
scoreboard objectives add is_playing dummy
scoreboard objectives add curr_tick dummy

# Temp vars
scoreboard objectives add temp_var_1 dummy
scoreboard objectives add display dummy

# Reset Vars
scoreboard players set @a current_menu 1
scoreboard players set @a is_playing 0
scoreboard objectives setdisplay sidebar display

say BlockSaber Re-Loaded!
execute as @a run function block_saber:inventory/menu_main_set

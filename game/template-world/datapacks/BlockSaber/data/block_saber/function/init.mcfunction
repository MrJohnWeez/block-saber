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

# Note engine (bs_* renames of 1.18 NoteHealth/NodeRowID/TempVar2; bs_movespeed carries per-song metersPerTick x1000000 and lead meters)
scoreboard objectives add bs_note_health dummy
scoreboard objectives add bs_row dummy
scoreboard objectives add bs_temp dummy
scoreboard objectives add bs_movespeed dummy

# Wall engine (bs_wall_hit = once-per-piece overlap flag, replaces the old per-tick HealthPoints drain; bs_wall_temp = eye/band scratch)
scoreboard objectives add bs_wall_hit dummy
scoreboard objectives add bs_wall_temp dummy
scoreboard players set #bs_row bs_row 0
scoreboard players set #bs_mpt bs_movespeed 0
scoreboard players set #bs_lead_m bs_movespeed 0

# Song contract objectives (docs/song-pack-contract.md §2.2; entries are written by song packs, handshake §4.2)
scoreboard objectives add song_contract dummy
scoreboard players set #CONST song_contract 1
scoreboard objectives add bs_finished dummy
scoreboard objectives add bs_light_on dummy
scoreboard objectives add bs_light_color dummy
scoreboard objectives add bs_lightshow dummy
scoreboard players set #CONST bs_lightshow 1
scoreboard objectives add bs_complete dummy

# Scoring (bs_* renames of 1.18 HealthPoints/Combo/Multiplier/PlayerScore, all on fake player #GLOBAL
# where 1.18 used #BlockSaberGlobal; bs_combo_max is new - the old pack tracked no max combo, the
# result screen shows it; bs_failed = one-run fail latch, old ended via PlayingSong=0 in spawn_level_failed_titles)
scoreboard objectives add bs_health dummy
scoreboard objectives add bs_combo dummy
scoreboard objectives add bs_combo_max dummy
scoreboard objectives add bs_multiplier dummy
scoreboard objectives add bs_score dummy
scoreboard objectives add bs_failed dummy

# GodMode (port of 1.18 GodModeEnabled; #CONST fake player like bs_lightshow)
# TODO(M4f): settings-menu toggle, port of settings_menu + settings_menu_toggle_godmode
scoreboard objectives add bs_godmode dummy
scoreboard players set #CONST bs_godmode 0
scoreboard objectives add CONST_2 dummy
scoreboard players set #CONST CONST_2 2

# Temp vars
scoreboard objectives add temp_var_1 dummy
scoreboard objectives add display dummy

# Reset Vars
scoreboard players set @a current_menu 1
scoreboard players set @a is_playing 0
scoreboard objectives setdisplay sidebar display

say BlockSaber Re-Loaded!
execute as @a run function block_saber:inventory/menu_main_set

# World commands
gamerule command_block_output false
gamerule send_command_feedback false
gamerule log_admin_commands true
gamerule spawn_mobs false
gamerule show_advancement_messages false
difficulty normal

#Define Teams
team add team_no_collide
team modify team_no_collide collisionRule never
team modify team_no_collide deathMessageVisibility never

# Consts
scoreboard objectives add MAIN_MENU dummy
scoreboard objectives add SELECTION_MENU dummy
scoreboard objectives add PAUSE_MENU dummy
scoreboard objectives add SONG_MENU dummy
scoreboard objectives add SETTINGS_MENU dummy
scoreboard objectives add CONST_0 dummy
scoreboard players set #CONST CONST_0 0
scoreboard players set #CONST MAIN_MENU 1
scoreboard players set #CONST SELECTION_MENU 2
scoreboard players set #CONST PAUSE_MENU 3
scoreboard players set #CONST SONG_MENU 4
scoreboard players set #CONST SETTINGS_MENU 5

# Globals
scoreboard objectives add game_session_id dummy
scoreboard players set #GLOBAL game_session_id 1

# General Vars
scoreboard objectives add current_menu dummy
scoreboard objectives add is_playing dummy
scoreboard objectives add bs_gamemode dummy
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

# GodMode (port of 1.18 GodModeEnabled; #CONST fake player like bs_lightshow; toggled on the pause-menu settings
# page - inventory/settings_action, port of settings_menu_toggle_godmode)
scoreboard objectives add bs_godmode dummy
scoreboard players set #CONST bs_godmode 0
scoreboard objectives add CONST_2 dummy
scoreboard players set #CONST CONST_2 2

# Song registry prune rotation (contract §2.4): arm a one-pass sweep over the songs that existed at load; load
# tag hooks only touch bs:engine reg_queue, so this count is safe regardless of init's order vs their load hooks.
scoreboard players set #prune bs_temp 0
scoreboard players set #prune_left bs_temp 0
execute if data storage bs:songs order store result score #prune bs_temp run data get storage bs:songs order
scoreboard players operation #prune_left bs_temp = #prune bs_temp

# Menu browser state (bs_menu_page = current 0-based page of the song/difficulty browsers; the constants feed the
# 24-songs-per-page window math and the ON/OFF toggle flip)
scoreboard objectives add bs_menu_page dummy
scoreboard players set @a bs_menu_page 0
scoreboard objectives add CONST_1 dummy
scoreboard players set #CONST CONST_1 1
scoreboard objectives add CONST_24 dummy
scoreboard players set #CONST CONST_24 24

# Temp vars
scoreboard objectives add temp_var_1 dummy
scoreboard objectives add display dummy

# Reset Vars
scoreboard players set @a current_menu 1
scoreboard players set @a is_playing 0
scoreboard objectives setdisplay sidebar display

say BlockSaber Re-Loaded!
tellraw @a [{text:"[BlockSaber] ",color:"gold"},{text:"The menu lives in your inventory as items: ",color:"gray"},{text:"DROP",color:"yellow",bold:true},{text:" the item you want with ",color:"gray"},{text:"Q",color:"yellow",bold:true},{text:" to pick it.",color:"gray"}]
tellraw @a [{text:"[BlockSaber] ",color:"gold"},{text:"Songs register themselves automatically when their datapacks are in the world's datapacks folder and the game reloads.",color:"gray"}]
execute as @a run function block_saber:inventory/menu_main_set

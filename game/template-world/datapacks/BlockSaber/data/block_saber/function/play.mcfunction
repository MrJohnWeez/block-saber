# Scene start for the song selected via song/start (bs:engine play holds the run state and #bs_mpt/#bs_lead_m the
# movement constants; M4a's debug direct-call defaults from init still run the scene with frozen notes). Runs in
# the playing player's context (game_loop / song/start): gamemode, attribute @s and the §3.2 @s curr_tick gates
# all land on the player, matching the old folder_uuid play -> _root_class play chain.
function block_saber:inventory/menu_pause_set
scoreboard players set @s is_playing 1
scoreboard players set @s curr_tick 0
attribute @s minecraft:jump_strength base set 0
attribute @s minecraft:step_height base set 0
execute if entity @s[gamemode=survival] run scoreboard players set @s bs_gamemode 0
execute if entity @s[gamemode=creative] run scoreboard players set @s bs_gamemode 1
execute if entity @s[gamemode=adventure] run scoreboard players set @s bs_gamemode 2
execute if entity @s[gamemode=spectator] run scoreboard players set @s bs_gamemode 3
gamemode adventure
# The run anchors at the old game's fixed End stage spot (0 150 500) - deterministic fit with the
# default-environment structure and no Overworld interference, ported from the old tick's setup anchor.
execute in minecraft:the_end run summon minecraft:marker 0.0 150.0 500.0 {Tags:["game_origin","blocksaber"]}
execute in minecraft:the_end run teleport @s 0.0 151.0 500.0 -180.0 0.0
# The stage builds itself via build_stage_tick once the teleport has actually loaded the End chunks: block
# commands issued in the same tick as the teleport all die with "That position is not loaded".
scoreboard players set #bs_scene_pending bs_temp 1
function block_saber:notes/spawn_begin
function block_saber:song/give_sabers
function block_saber:song/score/reset
function block_saber:song/score/displays_spawn

# Scene start for the song selected via song/start (bs:engine play holds the run state and #bs_mpt/#bs_lead_m the
# movement constants; M4a's debug direct-call defaults from init still run the scene with frozen notes). Runs in
# the playing player's context (game_loop / song/start): gamemode, attribute @s and the §3.2 @s curr_tick gates
# all land on the player, matching the old folder_uuid play -> _root_class play chain.
function block_saber:inventory/menu_pause_set
scoreboard players set @s is_playing 1
scoreboard players set @s curr_tick 0
attribute @s minecraft:jump_strength base set 0
attribute @s minecraft:step_height base set 0
gamemode adventure
summon marker -0.0 -0.0 0.0 {Tags:["game_origin","blocksaber"]}
teleport @s -0.0 -0.0 0.0 -180.0 4.0
execute at @e[type=marker,tag=game_origin,distance=3..,limit=1] run function block_saber:setup_game_scene
function block_saber:notes/spawn_begin
function block_saber:song/give_sabers
function block_saber:song/score/reset
function block_saber:song/score/displays_spawn

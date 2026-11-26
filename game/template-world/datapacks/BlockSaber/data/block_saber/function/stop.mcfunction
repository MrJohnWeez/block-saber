# Tear down one run (pause-menu Stop, fail, complete, and song/start's pre-flight per contract §2.3). Also the
# selected-song state clear (§3.7): bs:engine play is removed here, and score/fail and song/complete both route
# through stop, so completion/failure paths never keep a stale dispatcher selection.
scoreboard players set @s is_playing 0
# Contract §3.7 optional pause hook (D8: stock emitters ship none) - called in player context before teardown
execute if data storage bs:engine play.slug run function block_saber:song/pause_hook with storage bs:engine play
stopsound @a music
function block_saber:inventory/menu_main_set
attribute @s minecraft:scale base reset
attribute @s minecraft:jump_strength base reset
attribute @s minecraft:step_height base reset
# Narrowed marker sweep (contract §2.3): kill engine markers only (tag blocksaber) and never the song-registration
# markers (tag bs_song, §2.1) - the blanket kill @e[type=minecraft:marker] this replaces would delete installs
# between songs. Covers game_origin, bs_node_cursor/bs_node_origin and the bs_wall_* anchor markers; the light
# fixtures are markers too and are cleared explicitly below, so lights/clear is load-bearing as of this change.
kill @e[type=minecraft:marker,tag=blocksaber,tag=!bs_song]
kill @e[tag=bs_node]
kill @e[type=minecraft:text_display,tag=bs_score_display]
function block_saber:lights/clear
gamemode creative
data remove storage bs:engine play

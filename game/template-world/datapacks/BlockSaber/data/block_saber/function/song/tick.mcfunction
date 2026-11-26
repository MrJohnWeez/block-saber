# Per-tick song pipeline for every playing player (port of folder_uuid:active_tick); game_loop has already advanced curr_tick
function block_saber:notes/row_advance
# Contract §2.3/§3.2: selected-song dispatcher (bs_<slug>:<diff_char>_play in player context, audio start included)
execute if data storage bs:engine play.slug run function block_saber:song/dispatch with storage bs:engine play
function block_saber:notes/handle
function block_saber:song/score/tick
function block_saber:lights/handle
function block_saber:notes/move_notes
function block_saber:song/complete_check

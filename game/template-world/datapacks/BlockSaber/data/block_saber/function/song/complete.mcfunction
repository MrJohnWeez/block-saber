# Song finished: record completion and end the run (port of map_difficulty_completed; results display is TODO(M4d))
execute if data storage bs:engine play.entry run function block_saber:song/complete_record with storage bs:engine play
function block_saber:stop

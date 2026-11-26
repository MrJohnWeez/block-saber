# Song finished: record completion (contract §3.7), show results (M4d port of map_difficulty_completed), end the run
execute if data storage bs:engine play.entry run function block_saber:song/complete_record with storage bs:engine play
function block_saber:song/score/result
function block_saber:stop

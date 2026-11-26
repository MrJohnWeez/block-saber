# Player overlapped this wall piece (port of _root_class:player_in_wall), run as the piece.
# Once per piece instead of the old every-tick HealthPoints drain - long walls still penalise per segment as pieces pass.
# Guard tests for the already-penalised 1 (wall anchors spawn unscored; `unless matches 0` would early-return forever on them).
execute if score @s bs_wall_hit matches 1 run return 0
scoreboard players set @s bs_wall_hit 1
function block_saber:song/score/wall_point

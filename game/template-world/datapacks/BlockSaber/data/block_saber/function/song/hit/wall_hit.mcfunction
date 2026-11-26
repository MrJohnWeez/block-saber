# Player overlapped this wall piece (port of _root_class:player_in_wall), run as the piece.
# Once per piece instead of the old every-tick HealthPoints drain - long walls still penalise per segment as pieces pass.
execute unless score @s bs_wall_hit matches 0 run return 0
scoreboard players set @s bs_wall_hit 1
# TODO(M4d): port the old penalty lines here - GodModeEnabled-guarded HealthPoints -2, Multiplier /= Const_2 (min 1),
#   Combo 0, and the hurt cue playsound minecraft:block.ender_chest.open block @a <game_origin> 0.5.

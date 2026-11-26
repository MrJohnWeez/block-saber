# Correct note (port of _root_class:correct_point): +1% health x Multiplier, +Multiplier score, Combo +1
scoreboard players operation #GLOBAL bs_health += #GLOBAL bs_multiplier
scoreboard players operation #GLOBAL bs_score += #GLOBAL bs_multiplier
execute at @e[type=minecraft:marker,tag=game_origin,limit=1] run playsound minecraft:entity.player.attack.nodamage block @a ~ ~ ~ 1 0.5
scoreboard players add #GLOBAL bs_combo 1
# M4d addition (old tracked no max combo; needed by the result screen): running best of Combo
execute if score #GLOBAL bs_combo > #GLOBAL bs_combo_max run scoreboard players operation #GLOBAL bs_combo_max = #GLOBAL bs_combo

#Define Teams
team remove NoCollide

# Scoreboards
scoreboard objectives remove CurrentMenu
scoreboard objectives remove IsPlaying

# Consts
scoreboard objectives remove MainMenu
scoreboard objectives remove GameSelectionMenu
scoreboard objectives remove PauseMenu
scoreboard objectives remove Const_0

# Temp vars
scoreboard objectives remove TempVar1
scoreboard objectives remove TempVar2
scoreboard objectives remove TempVar3
scoreboard objectives remove TempVar4
scoreboard objectives remove Display

execute as @a run attribute @s minecraft:jump_strength base set 0.08
say BlockSaber Uninstalled!
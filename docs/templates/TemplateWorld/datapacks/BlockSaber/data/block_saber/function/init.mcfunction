function block_saber:uninstall

# World commands
gamerule commandBlockOutput false
gamerule sendCommandFeedback false
gamerule logAdminCommands true
gamerule doMobSpawning false
gamerule announceAdvancements false
difficulty normal

#Define Teams
team add NoCollide
team modify NoCollide collisionRule never
team modify NoCollide deathMessageVisibility never

# Scoreboards
scoreboard objectives add CurrentMenu dummy
scoreboard objectives add IsPlaying dummy

# Consts
scoreboard objectives add MainMenu dummy
scoreboard objectives add GameSelectionMenu dummy
scoreboard objectives add PauseMenu dummy
scoreboard objectives add Const_0 dummy
scoreboard players set #CONST Const_0 0
scoreboard players set #CONST MainMenu 1
scoreboard players set #CONST GameSelectionMenu 2
scoreboard players set #CONST PauseMenu 3

# Temp vars
scoreboard objectives add TempVar1 dummy
scoreboard objectives add TempVar2 dummy
scoreboard objectives add TempVar3 dummy
scoreboard objectives add TempVar4 dummy
scoreboard objectives add Display dummy


# Reset Vars
scoreboard players set @a CurrentMenu 1
scoreboard players set @a IsPlaying 0
scoreboard objectives setdisplay sidebar Display

say BlockSaber Re-Loaded!
execute as @a run attribute @s minecraft:jump_strength base set 0
execute as @a run function block_saber:inventory/menu_main_set

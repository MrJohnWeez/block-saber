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

say BlockSaber Re-Loaded!
execute as @a run attribute @s minecraft:jump_strength base set 0

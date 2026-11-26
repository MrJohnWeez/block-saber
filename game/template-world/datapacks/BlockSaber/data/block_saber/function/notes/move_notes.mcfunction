# Advance every live note one step toward the player (port of folder_uuid:active_tick move driver)
execute if data storage bs:engine move_args as @e[tag=bs_node] run function block_saber:notes/move_note with storage bs:engine move_args

execute as @e[type=item] run kill @s
execute as @a run function block_saber:inventory/check_menu_actions
execute as @a[scores={is_playing=1}] run function block_saber:game_loop
# Contract §2.4 (26.3 amendment): the song registry is bs:songs storage, not marker NBT (26.3 dropped free-form
# entity data). One prune rotation runs per reload - a single registry entry is checked per tick below.
execute if score #prune bs_temp matches 1 run function block_saber:song/prune_step
# Stage-build gate: one pending check per tick until the End chunks at the run anchor are loaded (§2.3 scene anchor).
execute if score #bs_scene_pending bs_temp matches 1 run function block_saber:build_stage_tick
# Bring-up self-healing (load tags run before any player is online, so init's @a handout never reaches joins at
# world start): a playing player with no menu page in the inventory is a crashed session - stop it; a not-playing
# player with no menu page is a join, a death, or a thrown-out menu - hand the main menu back.
execute as @a[scores={is_playing=1..}] unless entity @s[nbt={Inventory:[{components:{"minecraft:custom_data":{menu_item:1b}}}]}] run function block_saber:stop
execute as @a unless score @s is_playing matches 1 unless entity @s[nbt={Inventory:[{components:{"minecraft:custom_data":{menu_item:1b}}}]}] run function block_saber:inventory/menu_main_set
# Contract §2.4: song packs stage their auto-install in the load tag; the engine runs one pop+install per tick.
# The gate is a plain if-data: register_pop pops to reg_cur and calls the register_drain macro itself, so a dead
# queued installer (pack left datapacks/ before its turn) only aborts that inner call, never jams the queue.
execute if data storage bs:engine reg_queue[0] run function block_saber:song/register_pop

# Debug
scoreboard players operation curr_tick display = MrJohnWeez curr_tick

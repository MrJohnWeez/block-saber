# One rotation step of the per-reload prune pass (§2.4): move the head of the bs:songs order list into
# prune_cur for prune_probe to keep (re-append) or drop. #prune_alive is pre-loaded to 0 HERE, in a plain
# (poison-free) function, because a dead song's probe makes prune_probe_check fail to INSTANTIATE wholesale -
# 26.3 resolves `if function` targets at command-parse time and macro functions instantiate every $-line before
# running any, so its internal sentinel write would never happen and a stale 1 could spare a dead record.
# #prune_left counts the entries that existed at load - survivors re-append to order, so the rotation must stop
# after exactly that many steps; init arms #prune/#prune_left on every load.
scoreboard players set #prune_alive bs_temp 0
data modify storage bs:engine prune_cur set from storage bs:songs order[0]
data remove storage bs:songs order[0]
function block_saber:song/prune_probe with storage bs:engine prune_cur
scoreboard players remove #prune_left bs_temp 1
execute if score #prune_left bs_temp matches ..0 run scoreboard players set #prune bs_temp 0

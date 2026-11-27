# Macro (bs:engine prune_cur = {slug}): the liveness test of the prune rotation (§2.4) - split out because 26.3
# evaluates `if function` by EXECUTING the target inside the modifier chain (result 0 = chain stops silently; a
# missing target or non-instantiable macro line aborts this whole function - verified live) and store callbacks
# never fire on a stopped chain. So no store: #prune_alive is pre-set to 0 by prune_step, and only a present,
# truthy contract probe (`return 1`, §2.4) can reach the scoreboard write that flips it to 1. Runs once per
# rotation step; the scoreboard write is its only side effect.
$execute if function bs_$(slug):probe run scoreboard players set #prune_alive bs_temp 1

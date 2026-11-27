# Macro (bs:engine play): contract §3.7 D8 hook - song packs MAY ship <token>_pause/_resume; the default emitter
# does not, and v1 pause stays stop-and-quit. Called from block_saber:stop in player context before teardown.
# play.slug is the full namespace id (bs_<slug>), so the function path carries no extra prefix.
# 26.3 `execute if function` runs its target and tests the result, so this is the "call once if present" idiom:
# the hook fires inside the condition itself and the run arm only absorbs a truthy result (never a second run).
$execute as @s if function $(slug):$(token)_pause run return 0

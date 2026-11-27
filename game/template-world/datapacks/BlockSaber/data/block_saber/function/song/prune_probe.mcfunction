# Macro (bs:engine prune_cur = {slug}): keep or drop one bs:songs registry record during the per-reload prune
# rotation (§2.4). The liveness probe itself lives in prune_probe_check because 26.3 aborts the ENTIRE function
# whose execute line names a missing function (verified live; the abort does not escape the function call). Here
# only the sentinel score is read: 1 means the pack answered (keep, re-append at the order tail), anything else
# means the pack left datapacks/ without its uninstall, so the record goes with it.
function block_saber:song/prune_probe_check with storage bs:engine prune_cur
execute if score #prune_alive bs_temp matches 1 run data modify storage bs:songs order append from storage bs:engine prune_cur
$execute unless score #prune_alive bs_temp matches 1 run data remove storage bs:songs $(slug)

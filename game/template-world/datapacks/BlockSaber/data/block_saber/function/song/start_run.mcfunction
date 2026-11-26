# Macro (bs:engine sel = {tag, slug, diff}): handshake passed - write the run identity into bs:engine play
# (consumers: song/complete_record play.entry, score/result + score/fail title/artist/diff/char, song/dispatch
# slug/token) and the per-difficulty movement constants into #bs_mpt/#bs_lead_m (contract §2.1 runtime handoff;
# notes/spawn_begin consumes both), then run the merged scene-start chain. play.entry is the §2.2 completion
# record fake player "#<slug>_<token>" that install pre-creates at 0.
$data modify storage bs:engine play.slug set from storage bs:engine sel.tag
$data modify storage bs:engine play.token set from storage bs:engine sel.diff
$data modify storage bs:engine play.entry set value "#${slug}_${diff}"
$data modify storage bs:engine play.title set from entity @e[type=minecraft:marker,tag=${tag},tag=bs_song,limit=1] bs.title
$data modify storage bs:engine play.artist set from entity @e[type=minecraft:marker,tag=${tag},tag=bs_song,limit=1] bs.artist
$data modify storage bs:engine play.diff set from storage bs:menu click.diff_entry.diff
$data modify storage bs:engine play.char set from storage bs:menu click.diff_entry.char
execute store result score #bs_mpt bs_movespeed run data get storage bs:menu click.diff_entry.mpt_millionths
execute store result score #bs_lead_m bs_movespeed run data get storage bs:menu click.diff_entry.lead_m
function block_saber:play

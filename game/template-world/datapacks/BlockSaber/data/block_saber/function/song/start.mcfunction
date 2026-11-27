# Contract §2.3 play-start sequence, called from the difficulty menu click with {slug, diff, diff_entry} in
# bs:menu click (a storage snapshot - the clicked item is already dropped by the time this runs). Order per §2.3:
# stop cleanup -> contract check (§4.2) -> movement-state copy + play.* identity handoff -> scene/clock setup
# (block_saber:play). Audio is NOT started here: the dispatcher's first line owns playsound (§3.1/§3.2). play is
# called in player context, so its targetless lines (gamemode, attribute @s) and the §3.2 @s curr_tick gates land.
execute unless data storage bs:menu click.slug run return 0
execute unless data storage bs:menu click.diff run return 0
execute unless data storage bs:menu click.diff_entry run return 0
function block_saber:stop
$data modify storage bs:engine sel.tag set value "bs_$(slug)"
$data modify storage bs:engine sel.slug set value "$(slug)"
$data modify storage bs:engine sel.diff set value "$(diff)"
function block_saber:song/start_handshake with storage bs:engine sel

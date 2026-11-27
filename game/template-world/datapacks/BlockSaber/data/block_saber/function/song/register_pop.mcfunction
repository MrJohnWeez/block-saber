# Pop the head of the auto-install queue to bs:engine reg_cur and run that pack's auto_install (tick contract
# §2.4). Pop and macro call stay separate from tick's gate line, but the drain call lives HERE (not in tick) so
# the pop is never hostage to the macro: a queued pack that vanished from datapacks/ makes only the register_drain
# call fail to instantiate (a lost log line, dead entry dropped) - never a permanently jammed queue head.
# Registry writes are storage + scoreboards (§2.1), so no player or chunk context is needed - songs present at
# world start are installed before anyone joins.
data modify storage bs:engine reg_cur set from storage bs:engine reg_queue[0]
data remove storage bs:engine reg_queue[0]
function block_saber:song/register_drain with storage bs:engine reg_cur

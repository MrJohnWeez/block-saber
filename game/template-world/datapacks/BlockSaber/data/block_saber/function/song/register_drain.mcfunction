# Macro (caller storage = bs:engine reg_cur = {installer}): run one queued song pack's auto_install. The pop
# itself lives in register_pop (called from block_saber:tick before this) so a dead queued installer - whose
# pack vanished from datapacks/ before the drain reached it - only makes THIS call fail to instantiate (a lost
# log line), never jams the queue. Registry writes are storage + scoreboards (§2.1: 26.3 dropped free-form
# entity NBT, so there is no marker summon left to anchor), so no player or chunk context is needed - songs
# present at world start are installed before anyone joins.
$function $(installer)

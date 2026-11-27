# Queue one song pack's staged installer ({installer: ...} in bs:engine reg_slot) for the tick drain.
# Song packs call this from their minecraft:load tag hook; the engine owns the shared bs:songs registry and the
# completion-record seeding, and performs them one entry per tick outside any pack's own load context.
# This must stay plain-text: shipped song packs call it behind `execute if function`, and 26.3 evaluates that by
# INSTANTIATING and running the target, so a macro version (the first build's shape) never instantiates without
# arguments and the call silently no-ops (verified live on 26.3). The append's 0 result keeps that older call
# pattern to a single queue entry; the current converter calls this directly instead.
data modify storage bs:engine reg_queue append from storage bs:engine reg_slot

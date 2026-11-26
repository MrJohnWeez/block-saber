# Macro (bs:engine play): contract §3.7 D8 hook - song packs MAY ship <token>_pause/_resume; the default emitter
# does not, and v1 pause stays stop-and-quit. Called from block_saber:stop in player context before teardown.
# play.slug is the full namespace id (bs_<slug>), so the function path carries no extra prefix.
$execute as @s if function ${slug}:${token}_pause run function ${slug}:${token}_pause

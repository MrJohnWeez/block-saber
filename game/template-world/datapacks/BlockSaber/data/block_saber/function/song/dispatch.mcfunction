# Macro (bs:engine play): the §2.3 dispatcher seam - the selected pack's <token>_play runs as the playing player
# every tick (§3.2; play.slug stores the full namespace id bs_<slug>). Audio start is the dispatcher's own
# §3.1 playsound line, so the engine never starts music separately.
$execute as @s run function ${slug}:${token}_play

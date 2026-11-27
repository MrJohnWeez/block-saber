# Macro (bs:engine menu_ctx.slug): pull one song's display strings from its bs:songs record (§2.1 registry
# storage) into menu_ctx.title/menu_ctx.artist for menu_song_stage to render.
$data modify storage bs:engine menu_ctx.title set from storage bs:songs $(slug).title
$data modify storage bs:engine menu_ctx.artist set from storage bs:songs $(slug).artist

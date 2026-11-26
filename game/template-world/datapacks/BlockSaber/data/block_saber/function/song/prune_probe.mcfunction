# Macro (bs:engine prune.slug): kill this song marker when its pack's comment-only probe function is gone
# (pack deleted from datapacks/; §2.4). @s is the marker itself, so a stale slug can never kill a live marker.
$execute unless function bs_${slug}:probe run kill @s

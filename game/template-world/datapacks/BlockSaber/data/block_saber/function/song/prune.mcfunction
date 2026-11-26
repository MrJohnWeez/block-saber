# Contract §2.4 prune pass (run per marker from block_saber:tick): a song pack removed from datapacks/ without
# its uninstall leaves the registration marker behind - with the §2.3 narrowed stop sweep, the probe check is now
# the only thing that removes it, within one tick. Markers without bs.slug never carried valid metadata.
data remove storage bs:engine prune.slug
execute unless data entity @s bs.slug run kill @s
execute if data entity @s bs.slug run data modify storage bs:engine prune.slug set from entity @s bs.slug
execute if data storage bs:engine prune.slug run function block_saber:song/prune_probe with storage bs:engine prune

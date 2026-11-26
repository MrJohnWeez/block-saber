# Macro (bs:engine sel = {title, want}): the §4.2 refusal line, verbatim wording, ${title}/${want} filled from
# the marker. Old 1.18-era packs (no bs compound at all) read as contract 0 and land here too - never a silent no-op.
$tellraw @s [{text:"[BlockSaber] ",color:"red"},{text:"\"${title}\" needs song contract ${want} (this world runs ",color:"red"},{score:{name:"#CONST",objective:"song_contract"}},{text:"). Re-convert it at block-saber.web — old 1.18 packs are incompatible.",color:"red"}]

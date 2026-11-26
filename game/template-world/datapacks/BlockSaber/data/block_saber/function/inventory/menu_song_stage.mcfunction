# Macro (bs:engine menu_ctx = {slot, slot1, title, artist, slug}): one song browser item - §2.3 stick with
# custom_data={action:"bs_song",slug:"<slug>",menu_item:1b} named "Title — Artist", staged to bs:menu page.song<k>
# for the drop scan. Title/artist arrive by macro text substitution, the same trust level as the 1.18 converter's
# raw SONGTITLE tellraw injection; the converter contract (§2.1) keeps strings escaped and 64-char truncated.
$data modify storage bs:menu page.song${slot} set from entity @s bs.slug
$item replace entity @a[tag=bs_menu_open,limit=1] inventory.${slot1} with minecraft:stick[custom_name=[{"text":"${title} — ${artist}"}],item_name=[{"text":""}],lore=[{"text":"Drop to choose a difficulty","color":"gray","italic":false}],enchantment_glint_override=true,item_model="blocksaber:blue_dot",custom_data={action:"bs_song",slug:"${slug}",menu_item:1b},tooltip_display={hidden_components:[tooltip_display]}] 1

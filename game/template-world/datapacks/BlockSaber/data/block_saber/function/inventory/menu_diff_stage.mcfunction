# Macro (bs:engine menu_ctx = {slot1, slug, token, diff_label, char_label}): one difficulty item - §2.3 stick
# with custom_data={action:"bs_play",slug:"<slug>",diff:"<token>",menu_item:1b}; slug/token are machine-safe
# [a-z0-9_] (§1.3), the labels are Beat Saber enum names rendered by macro substitution.
$item replace entity @a[tag=bs_menu_open,limit=1] inventory.${slot1} with minecraft:stick[custom_name=[{"text":"${diff_label} (${char_label})"}],item_name=[{"text":""}],lore=[{"text":"Drop to play","color":"gray","italic":false}],enchantment_glint_override=true,item_model="blocksaber:blue_dot",custom_data={action:"bs_play",slug:"${slug}",diff:"${token}",menu_item:1b},tooltip_display={hidden_components:[tooltip_display]}] 1

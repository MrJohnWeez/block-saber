# Sabers for the playing round (port of _root_class:give_sabers); custom_data bs_saber feeds M4b hit checks
item replace entity @a[gamemode=!spectator] weapon.offhand with minecraft:netherite_sword[custom_name=[{"text":"Blue Saber","italic":false}],item_model="blocksaber:blue_saber",custom_data={bs_saber:"blue"},unbreakable={},enchantment_glint_override=true,tooltip_display={hidden_components:[unbreakable,attribute_modifiers]}] 1
item replace entity @a[gamemode=!spectator] hotbar.0 with minecraft:netherite_sword[custom_name=[{"text":"Red Saber","italic":false}],item_model="blocksaber:red_saber",custom_data={bs_saber:"red"},unbreakable={},enchantment_glint_override=true,tooltip_display={hidden_components:[unbreakable,attribute_modifiers]}] 1
# Clear the slots between the sabers (old pack also parked a Main-Menu item in hotbar.8; the new pause menu covers that)
item replace entity @a[gamemode=!spectator] hotbar.1 with minecraft:air 1
item replace entity @a[gamemode=!spectator] hotbar.2 with minecraft:air 1
item replace entity @a[gamemode=!spectator] hotbar.3 with minecraft:air 1
item replace entity @a[gamemode=!spectator] hotbar.4 with minecraft:air 1
item replace entity @a[gamemode=!spectator] hotbar.5 with minecraft:air 1
item replace entity @a[gamemode=!spectator] hotbar.6 with minecraft:air 1
item replace entity @a[gamemode=!spectator] hotbar.7 with minecraft:air 1
item replace entity @a[gamemode=!spectator] hotbar.8 with minecraft:air 1

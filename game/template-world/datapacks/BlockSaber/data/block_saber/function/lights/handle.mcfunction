# Per-tick light render pass (port of _root_class:handle_lights); off groups cost one score test, on groups 25 tests + one particle per fixture
# #CONST bs_lightshow is toggled on the pause-menu settings page (inventory/settings_action, port of the 1.18
# settings_menu_toggle_lightshow chat button; init keeps the default 1) - the gate below is the tested behavior
execute unless score #CONST bs_lightshow matches 1 run return 0
execute if score #back_lasers bs_light_on matches 1 run function block_saber:lights/back_lasers
execute if score #rings bs_light_on matches 1 run function block_saber:lights/rings
execute if score #rotating_left bs_light_on matches 1 run function block_saber:lights/rotating_left
execute if score #rotating_right bs_light_on matches 1 run function block_saber:lights/rotating_right
execute if score #center bs_light_on matches 1 run function block_saber:lights/center
execute if score #boost bs_light_on matches 1 run function block_saber:lights/boost
execute if score #extra_left bs_light_on matches 1 run function block_saber:lights/extra_left
execute if score #extra_right bs_light_on matches 1 run function block_saber:lights/extra_right
execute if score #side_lasers_left bs_light_on matches 1 run function block_saber:lights/side_lasers_left
execute if score #side_lasers_right bs_light_on matches 1 run function block_saber:lights/side_lasers_right

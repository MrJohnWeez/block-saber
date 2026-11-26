# Light fixture markers at the old arena layout, relative to game_origin (port of _root_class:spawn_lights,
# every coordinate copied verbatim from the 1.18.2 template)
# Self-clearing so scene setup stays idempotent; called from setup_game_scene at the game_origin marker
function block_saber:lights/clear
# left rail
summon minecraft:marker ~-6 ~2 ~-12 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-6 ~2 ~-13 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-6 ~2 ~-14 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-6 ~2 ~-15 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-6 ~2 ~-16 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-6 ~2 ~-17 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-6 ~2 ~-18 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-6 ~2 ~-19 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-6 ~2 ~-20 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-6 ~2 ~-21 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-6 ~2 ~-22 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-6 ~2 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}

# right rail
summon minecraft:marker ~6 ~2 ~-12 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~6 ~2 ~-13 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~6 ~2 ~-14 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~6 ~2 ~-15 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~6 ~2 ~-16 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~6 ~2 ~-17 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~6 ~2 ~-18 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~6 ~2 ~-19 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~6 ~2 ~-20 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~6 ~2 ~-21 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~6 ~2 ~-22 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~6 ~2 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}

# left pillar large
summon minecraft:marker ~-12 ~1 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~2 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~3 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~4 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~5 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~6 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~7 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~8 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~9 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~10 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~11 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~12 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~13 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~14 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-12 ~15 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}

# left pillar small
summon minecraft:marker ~-11 ~3 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-11 ~4 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-11 ~5 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-11 ~6 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-11 ~7 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-11 ~8 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-11 ~9 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-11 ~10 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-11 ~11 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-11 ~12 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}
summon minecraft:marker ~-11 ~13 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_left"]}

# left extra lights
summon minecraft:marker ~-11 ~1 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~2 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~3 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~4 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~5 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~6 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~7 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~8 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~9 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~10 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~11 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~12 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~13 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~14 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-11 ~15 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-10 ~3 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-10 ~4 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-10 ~5 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-10 ~6 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-10 ~7 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-10 ~8 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-10 ~9 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-10 ~10 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-10 ~11 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-10 ~12 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}
summon minecraft:marker ~-10 ~13 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_left"]}

# right pillar large
summon minecraft:marker ~12 ~1 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~2 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~3 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~4 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~5 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~6 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~7 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~8 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~9 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~10 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~11 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~12 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~13 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~14 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~12 ~15 ~-23 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}

# right pillar small
summon minecraft:marker ~11 ~3 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~11 ~4 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~11 ~5 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~11 ~6 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~11 ~7 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~11 ~8 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~11 ~9 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~11 ~10 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~11 ~11 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~11 ~12 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}
summon minecraft:marker ~11 ~13 ~-24 {Tags:["blocksaber","bs_light","bs_light_side_lasers_right"]}

# right extra lights
summon minecraft:marker ~11 ~1 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~2 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~3 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~4 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~5 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~6 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~7 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~8 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~9 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~10 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~11 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~12 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~13 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~14 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~11 ~15 ~-23 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~10 ~3 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~10 ~4 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~10 ~5 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~10 ~6 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~10 ~7 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~10 ~8 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~10 ~9 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~10 ~10 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~10 ~11 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~10 ~12 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}
summon minecraft:marker ~10 ~13 ~-24 {Tags:["blocksaber","bs_light","bs_light_extra_right"]}

# Middle Top Center
summon minecraft:marker ~ ~9 ~-24 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-26 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-28 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-30 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-32 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-34 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-36 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-38 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-40 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-44 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-48 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-54 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-60 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-68 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-78 {Tags:["blocksaber","bs_light","bs_light_boost"]}
summon minecraft:marker ~ ~9 ~-89 {Tags:["blocksaber","bs_light","bs_light_boost"]}

# Middle back Center Down
summon minecraft:marker ~ ~6 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~ ~5.5 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~0.5 ~5 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~1 ~4.5 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~1.5 ~4 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~2 ~3.5 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~2.5 ~3 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~ ~5.5 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-0.5 ~5 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-1 ~4.5 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-1.5 ~4 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-2 ~3.5 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-2.5 ~3 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}

# Middle back Center V
summon minecraft:marker ~2 ~ ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~2.5 ~1.2 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~3 ~2.3 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~3.5 ~3.5 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~4 ~4.6 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~4.5 ~5.8 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~5 ~7 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-2 ~ ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-2.5 ~1.2 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-3 ~2.3 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-3.5 ~3.5 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-4 ~4.6 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-4.5 ~5.8 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}
summon minecraft:marker ~-5 ~7 ~-90 {Tags:["blocksaber","bs_light","bs_light_center"]}

# left ring top
summon minecraft:marker ~-10 ~10 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9 ~11 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8 ~12 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7 ~13 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6 ~14 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-10 ~10 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9 ~11 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8 ~12 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7 ~13 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6 ~14 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-10 ~10 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9 ~11 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8 ~12 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7 ~13 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6 ~14 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-10 ~10 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9 ~11 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8 ~12 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7 ~13 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6 ~14 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-9.5 ~10.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8.5 ~11.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7.5 ~12.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6.5 ~13.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-9.5 ~10.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8.5 ~11.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7.5 ~12.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6.5 ~13.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-9.5 ~10.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8.5 ~11.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7.5 ~12.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6.5 ~13.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-9.5 ~10.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8.5 ~11.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7.5 ~12.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6.5 ~13.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}

# left ring bottom
summon minecraft:marker ~-11 ~-9 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-10 ~-10 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9 ~-11 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8 ~-12 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7 ~-13 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-11 ~-9 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-10 ~-10 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9 ~-11 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8 ~-12 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7 ~-13 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-11 ~-9 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-10 ~-10 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9 ~-11 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8 ~-12 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7 ~-13 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-11 ~-9 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-10 ~-10 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9 ~-11 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8 ~-12 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7 ~-13 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-10.5 ~-9.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9.5 ~-10.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8.5 ~-11.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7.5 ~-12.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6.5 ~-13.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-10.5 ~-9.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9.5 ~-10.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8.5 ~-11.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7.5 ~-12.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6.5 ~-13.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-10.5 ~-9.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9.5 ~-10.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8.5 ~-11.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7.5 ~-12.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6.5 ~-13.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~-10.5 ~-9.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-9.5 ~-10.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-8.5 ~-11.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-7.5 ~-12.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~-6.5 ~-13.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}

# right ring top
summon minecraft:marker ~10 ~10 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9 ~11 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8 ~12 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7 ~13 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6 ~14 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~10 ~10 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9 ~11 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8 ~12 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7 ~13 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6 ~14 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~10 ~10 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9 ~11 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8 ~12 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7 ~13 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6 ~14 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~10 ~10 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9 ~11 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8 ~12 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7 ~13 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6 ~14 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~9.5 ~10.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8.5 ~11.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7.5 ~12.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6.5 ~13.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~9.5 ~10.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8.5 ~11.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7.5 ~12.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6.5 ~13.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~9.5 ~10.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8.5 ~11.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7.5 ~12.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6.5 ~13.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~9.5 ~10.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8.5 ~11.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7.5 ~12.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6.5 ~13.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}

# right ring bottom
summon minecraft:marker ~11 ~-9 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~10 ~-10 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9 ~-11 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8 ~-12 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7 ~-13 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~11 ~-9 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~10 ~-10 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9 ~-11 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8 ~-12 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7 ~-13 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~11 ~-9 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~10 ~-10 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9 ~-11 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8 ~-12 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7 ~-13 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~11 ~-9 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~10 ~-10 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9 ~-11 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8 ~-12 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7 ~-13 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~10.5 ~-9.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9.5 ~-10.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8.5 ~-11.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7.5 ~-12.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6.5 ~-13.5 ~-26 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~10.5 ~-9.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9.5 ~-10.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8.5 ~-11.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7.5 ~-12.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6.5 ~-13.5 ~-29 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~10.5 ~-9.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9.5 ~-10.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8.5 ~-11.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7.5 ~-12.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6.5 ~-13.5 ~-32 {Tags:["blocksaber","bs_light","bs_light_rings"]}

summon minecraft:marker ~10.5 ~-9.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~9.5 ~-10.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~8.5 ~-11.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~7.5 ~-12.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}
summon minecraft:marker ~6.5 ~-13.5 ~-35 {Tags:["blocksaber","bs_light","bs_light_rings"]}

# right backtoplasers
summon minecraft:marker ~-1.5 ~-3 ~-10 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-3 ~-11 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-3 ~-12 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-3 ~-13 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-3 ~-14 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-3 ~-15 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-3 ~-16 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}

summon minecraft:marker ~-1.5 ~-5 ~-10 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-5 ~-11 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-5 ~-12 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-5 ~-13 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-5 ~-14 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-5 ~-15 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-5 ~-17 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-5 ~-19 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-5 ~-21 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~-1.5 ~-5 ~-24 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}

# left backtoplasers
summon minecraft:marker ~1.5 ~-3 ~-10 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-3 ~-11 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-3 ~-12 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-3 ~-13 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-3 ~-14 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-3 ~-15 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-3 ~-16 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}

summon minecraft:marker ~1.5 ~-5 ~-10 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-5 ~-11 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-5 ~-12 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-5 ~-13 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-5 ~-14 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-5 ~-15 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-5 ~-17 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-5 ~-19 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-5 ~-21 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}
summon minecraft:marker ~1.5 ~-5 ~-24 {Tags:["blocksaber","bs_light","bs_light_back_lasers"]}

# right rightlasers
summon minecraft:marker ~20 ~ ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~19 ~1 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~18 ~2 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~17 ~3 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~16 ~4 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~15 ~5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~14 ~6 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~13 ~7 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~12 ~8 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~11 ~9 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~10 ~10 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~9 ~11 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~8 ~12 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~7 ~13 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~6 ~14 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~5 ~15 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~4 ~16 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~3 ~17 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~2 ~18 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~1 ~19 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~0 ~20 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~-1 ~21 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~-2 ~22 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~-3 ~23 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~-4 ~24 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}

summon minecraft:marker ~19.5 ~0.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~18.5 ~1.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~17.5 ~2.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~16.5 ~3.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~15.5 ~4.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~14.5 ~5.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~13.5 ~6.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~12.5 ~7.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~11.5 ~8.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~10.5 ~9.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~9.5 ~10.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~8.5 ~11.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~7.5 ~12.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~6.5 ~13.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~5.5 ~14.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~4.5 ~15.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~3.5 ~16.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~2.5 ~17.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~1.5 ~18.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~0.5 ~19.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~-0.5 ~20.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~-1.5 ~21.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~-2.5 ~22.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}
summon minecraft:marker ~-3.5 ~23.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_right"]}

# left leftlasers
summon minecraft:marker ~-20 ~ ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-19 ~1 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-18 ~2 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-17 ~3 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-16 ~4 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-15 ~5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-14 ~6 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-13 ~7 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-12 ~8 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-11 ~9 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-10 ~10 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-9 ~11 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-8 ~12 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-7 ~13 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-6 ~14 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-5 ~15 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-4 ~16 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-3 ~17 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-2 ~18 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-1 ~19 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~0 ~20 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~1 ~21 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~2 ~22 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~3 ~23 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~4 ~24 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}

summon minecraft:marker ~-19.5 ~0.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-18.5 ~1.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-17.5 ~2.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-16.5 ~3.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-15.5 ~4.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-14.5 ~5.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-13.5 ~6.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-12.5 ~7.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-11.5 ~8.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-10.5 ~9.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-9.5 ~10.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-8.5 ~11.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-7.5 ~12.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-6.5 ~13.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-5.5 ~14.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-4.5 ~15.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-3.5 ~16.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-2.5 ~17.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-1.5 ~18.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~-0.5 ~19.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~0.5 ~20.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~1.5 ~21.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~2.5 ~22.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}
summon minecraft:marker ~3.5 ~23.5 ~-45 {Tags:["blocksaber","bs_light","bs_light_rotating_left"]}

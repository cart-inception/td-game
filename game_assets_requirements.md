# Game Assets Requirements

This document outlines all the assets needed for our multiplayer tower defense game. These assets should be created with a consistent art style that matches a tower defense game similar to Bloons TD 6.

## Towers

### Primary Towers
1. **Basic Tower**
   - Image: `public/assets/towers/basic_tower.png`
   - Dimensions: 64x64px
   - Description: A simple cannon tower, round shape with a short barrel
   - Upgrade Variations (3 levels):
     - `public/assets/towers/basic_tower_lvl2.png` (slightly larger cannon)
     - `public/assets/towers/basic_tower_lvl3.png` (dual cannons)

2. **Rapid Fire Tower**
   - Image: `public/assets/towers/rapid_tower.png`
   - Dimensions: 64x64px
   - Description: Gatling gun style tower with multiple barrels
   - Upgrade Variations (3 levels):
     - `public/assets/towers/rapid_tower_lvl2.png` (more barrels)
     - `public/assets/towers/rapid_tower_lvl3.png` (faster rotating barrels, glowing tips)

3. **Splash Tower**
   - Image: `public/assets/towers/splash_tower.png`
   - Dimensions: 64x64px
   - Description: Mortar-like tower with wide splash damage
   - Upgrade Variations (3 levels):
     - `public/assets/towers/splash_tower_lvl2.png` (larger mortar)
     - `public/assets/towers/splash_tower_lvl3.png` (multi-mortar system)

### Magic Towers
1. **Freezing Tower**
   - Image: `public/assets/towers/freeze_tower.png`
   - Dimensions: 64x64px
   - Description: Crystal/ice themed tower that slows enemies
   - Upgrade Variations (3 levels):
     - `public/assets/towers/freeze_tower_lvl2.png` (more ice crystals)
     - `public/assets/towers/freeze_tower_lvl3.png` (glowing intense ice aura)

2. **Lightning Tower**
   - Image: `public/assets/towers/lightning_tower.png`
   - Dimensions: 64x64px
   - Description: Tesla coil style tower that zaps multiple enemies
   - Upgrade Variations (3 levels):
     - `public/assets/towers/lightning_tower_lvl2.png` (larger coil)
     - `public/assets/towers/lightning_tower_lvl3.png` (multiple coils with arcing electricity)

### Support Towers
1. **Income Tower**
   - Image: `public/assets/towers/income_tower.png`
   - Dimensions: 64x64px
   - Description: A tower that generates extra money (bank/gold mine appearance)
   - Upgrade Variations (3 levels):
     - `public/assets/towers/income_tower_lvl2.png` (larger gold pile)
     - `public/assets/towers/income_tower_lvl3.png` (animated gold coins/gems)

2. **Buff Tower**
   - Image: `public/assets/towers/buff_tower.png`
   - Dimensions: 64x64px
   - Description: A tower that enhances nearby towers (banner/flag appearance)
   - Upgrade Variations (3 levels):
     - `public/assets/towers/buff_tower_lvl2.png` (multiple flags)
     - `public/assets/towers/buff_tower_lvl3.png` (glowing aura effect)

## Enemies (Bloons)

1. **Basic Bloon**
   - Image: `public/assets/enemies/basic_bloon.png`
   - Dimensions: 32x32px
   - Description: Red balloon, basic enemy

2. **Fast Bloon**
   - Image: `public/assets/enemies/fast_bloon.png`
   - Dimensions: 32x32px
   - Description: Yellow balloon, moves faster than basic

3. **Heavy Bloon**
   - Image: `public/assets/enemies/heavy_bloon.png`
   - Dimensions: 40x40px
   - Description: Blue balloon, takes more hits to pop

4. **Camo Bloon**
   - Image: `public/assets/enemies/camo_bloon.png`
   - Dimensions: 32x32px
   - Description: Green balloon with camouflage pattern, invisible to some towers

5. **Regenerating Bloon**
   - Image: `public/assets/enemies/regen_bloon.png`
   - Dimensions: 32x32px
   - Description: Pink balloon with heart symbol, regenerates health

6. **Boss Bloon**
   - Image: `public/assets/enemies/boss_bloon.png`
   - Dimensions: 128x128px
   - Description: Large black/rainbow balloon, appears at end of rounds

## Maps

1. **Beginner Map: Green Fields**
   - Image: `public/assets/maps/map_beginner.png`
   - Dimensions: 1280x720px
   - Description: Grassy field with a simple winding path
   - Path Overlay: `public/assets/maps/map_beginner_path.png` (transparent PNG showing the path)

2. **Intermediate Map: Desert Canyon**
   - Image: `public/assets/maps/map_intermediate.png`
   - Dimensions: 1280x720px
   - Description: Desert theme with canyon paths that split and rejoin
   - Path Overlay: `public/assets/maps/map_intermediate_path.png` (transparent PNG showing the path)

3. **Advanced Map: City Streets**
   - Image: `public/assets/maps/map_advanced.png`
   - Dimensions: 1280x720px
   - Description: Urban city with multiple intersecting road paths
   - Path Overlay: `public/assets/maps/map_advanced_path.png` (transparent PNG showing the path)

## UI Elements

1. **Main Menu Background**
   - Image: `public/assets/ui/main_menu_bg.png`
   - Dimensions: 1280x720px
   - Description: Colorful game-themed background for the main menu

2. **UI Panel**
   - Image: `public/assets/ui/panel.png`
   - Dimensions: 300x600px
   - Description: Side panel for tower selection and game controls

3. **Button Normal**
   - Image: `public/assets/ui/button_normal.png`
   - Dimensions: 200x60px
   - Description: Standard button, rounded rectangle with light border

4. **Button Hover**
   - Image: `public/assets/ui/button_hover.png`
   - Dimensions: 200x60px
   - Description: Hover state for buttons, slightly glowing

5. **Button Pressed**
   - Image: `public/assets/ui/button_pressed.png`
   - Dimensions: 200x60px
   - Description: Pressed state for buttons, slightly darker

6. **Tower Selection Frame**
   - Image: `public/assets/ui/tower_frame.png`
   - Dimensions: 80x80px
   - Description: Frame for tower selection icons

7. **Health Bar Background**
   - Image: `public/assets/ui/health_bar_bg.png`
   - Dimensions: 200x30px
   - Description: Background for health/lives indicator

8. **Health Bar Fill**
   - Image: `public/assets/ui/health_bar_fill.png`
   - Dimensions: 196x26px
   - Description: Red fill for health/lives indicator

9. **Money Icon**
   - Image: `public/assets/ui/money_icon.png`
   - Dimensions: 32x32px
   - Description: Gold coin or money bag icon

10. **Player Avatar Frames**
    - Image: `public/assets/ui/avatar_frame.png`
    - Dimensions: 60x60px
    - Description: Circular frame for player avatars in multiplayer

## Effects and Animations

1. **Tower Placement Effect**
   - Image Sequence: `public/assets/effects/tower_place_{1-5}.png`
   - Dimensions: 96x96px
   - Description: Sparkle/build effect when placing a tower

2. **Enemy Pop Effect**
   - Image Sequence: `public/assets/effects/pop_{1-5}.png`
   - Dimensions: 48x48px
   - Description: Balloon popping animation

3. **Upgrade Effect**
   - Image Sequence: `public/assets/effects/upgrade_{1-5}.png`
   - Dimensions: 96x96px
   - Description: Glowing effect when upgrading a tower

4. **Lightning Effect**
   - Image Sequence: `public/assets/effects/lightning_{1-5}.png`
   - Dimensions: 128x128px
   - Description: Lightning bolt effect for the lightning tower

5. **Freeze Effect**
   - Image Sequence: `public/assets/effects/freeze_{1-5}.png`
   - Dimensions: 64x64px
   - Description: Ice crystal effect for the freezing tower

## Audio Assets

1. **Background Music**
   - File: `public/assets/audio/background_music.mp3`
   - Description: Upbeat, loopable background music

2. **Tower Placement Sound**
   - File: `public/assets/audio/tower_place.mp3`
   - Description: Construction/placement sound effect

3. **Enemy Pop Sound**
   - File: `public/assets/audio/pop.mp3`
   - Description: Balloon popping sound

4. **Game Start Sound**
   - File: `public/assets/audio/game_start.mp3`
   - Description: Fanfare for game beginning

5. **Round Start Sound**
   - File: `public/assets/audio/round_start.mp3`
   - Description: Alert sound for new round

6. **Victory Sound**
   - File: `public/assets/audio/victory.mp3`
   - Description: Triumphant music for winning

7. **Defeat Sound**
   - File: `public/assets/audio/defeat.mp3`
   - Description: Sad tune for losing

8. **Tower Upgrade Sound**
   - File: `public/assets/audio/upgrade.mp3`
   - Description: Power-up sound for tower upgrades

9. **Button Click Sound**
   - File: `public/assets/audio/button_click.mp3`
   - Description: UI interaction sound

## Art Style Guidelines

1. **Color Palette**
   - Bright, vibrant colors for high visibility
   - Contrasting colors for different elements (towers vs enemies)
   - Consistent color themes for tower types (e.g., blue for ice towers)

2. **Visual Style**
   - 2D with some depth/perspective
   - Semi-cartoonish style similar to Bloons TD 6
   - Clean outlines and bold shapes
   - Consistent lighting direction

3. **Animation Style**
   - Smooth, fluid animations
   - 5-8 frames for most animations
   - Exaggerated effects for visual clarity

These assets should be provided in PNG format for images (with transparency where appropriate) and MP3 format for audio files. All assets should follow a consistent art style to maintain the game's visual coherence.
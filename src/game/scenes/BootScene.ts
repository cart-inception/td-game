import Phaser from 'phaser';

export default class BootScene extends Phaser.Scene {
  constructor() {
    super('BootScene');
  }

  preload() {
    // Create loading text
    const loadingText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      'Loading...',
      {
        fontSize: '32px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);

    // Create progress bar
    const progressBar = this.add.graphics();
    const progressBox = this.add.graphics();
    progressBox.fillStyle(0x222222, 0.8);
    progressBox.fillRect(
      this.cameras.main.width / 2 - 160,
      this.cameras.main.height / 2,
      320,
      50
    );

    // Update progress bar as assets load
    this.load.on('progress', (value: number) => {
      progressBar.clear();
      progressBar.fillStyle(0x00ff00, 1);
      progressBar.fillRect(
        this.cameras.main.width / 2 - 150,
        this.cameras.main.height / 2 + 10,
        300 * value,
        30
      );
    });

    this.load.on('complete', () => {
      progressBar.destroy();
      progressBox.destroy();
      loadingText.destroy();
    });

    // Load assets
    this.loadTowers();
    this.loadEnemies();
    this.loadMaps();
    this.loadUI();
    this.loadEffects();
    this.loadAudio();
  }

  create() {
    this.scene.start('GameScene');
  }

  private loadTowers() {
    // Primary towers
    this.load.image('basic_tower', '/assets/towers/basic_tower.png');
    this.load.image('basic_tower_lvl2', '/assets/towers/basic_tower_lvl2.png');
    this.load.image('basic_tower_lvl3', '/assets/towers/basic_tower_lvl3.png');
    
    this.load.image('rapid_tower', '/assets/towers/rapid_tower.png');
    this.load.image('rapid_tower_lvl2', '/assets/towers/rapid_tower_lvl2.png');
    this.load.image('rapid_tower_lvl3', '/assets/towers/rapid_tower_lvl3.png');
    
    this.load.image('splash_tower', '/assets/towers/splash_tower.png');
    this.load.image('splash_tower_lvl2', '/assets/towers/splash_tower_lvl2.png');
    this.load.image('splash_tower_lvl3', '/assets/towers/splash_tower_lvl3.png');
    
    // Magic towers
    this.load.image('freeze_tower', '/assets/towers/freeze_tower.png');
    this.load.image('freeze_tower_lvl2', '/assets/towers/freeze_tower_lvl2.png');
    this.load.image('freeze_tower_lvl3', '/assets/towers/freeze_tower_lvl3.png');
    
    this.load.image('lightning_tower', '/assets/towers/lightning_tower.png');
    this.load.image('lightning_tower_lvl2', '/assets/towers/lightning_tower_lvl2.png');
    this.load.image('lightning_tower_lvl3', '/assets/towers/lightning_tower_lvl3.png');
    
    // Support towers
    this.load.image('income_tower', '/assets/towers/income_tower.png');
    this.load.image('income_tower_lvl2', '/assets/towers/income_tower_lvl2.png');
    this.load.image('income_tower_lvl3', '/assets/towers/income_tower_lvl3.png');
    
    this.load.image('buff_tower', '/assets/towers/buff_tower.png');
    this.load.image('buff_tower_lvl2', '/assets/towers/buff_tower_lvl2.png');
    this.load.image('buff_tower_lvl3', '/assets/towers/buff_tower_lvl3.png');
  }

  private loadEnemies() {
    this.load.image('basic_bloon', '/assets/enemies/basic_bloon.png');
    this.load.image('fast_bloon', '/assets/enemies/fast_bloon.png');
    this.load.image('heavy_bloon', '/assets/enemies/heavy_bloon.png');
    this.load.image('camo_bloon', '/assets/enemies/camo_bloon.png');
    this.load.image('regen_bloon', '/assets/enemies/regen_bloon.png');
    this.load.image('boss_bloon', '/assets/enemies/boss_bloon.png');
  }

  private loadMaps() {
    this.load.image('map_beginner', '/assets/maps/map_beginner.png');
    this.load.image('map_beginner_path', '/assets/maps/map_beginner_path.png');
    
    this.load.image('map_intermediate', '/assets/maps/map_intermediate.png');
    this.load.image('map_intermediate_path', '/assets/maps/map_intermediate_path.png');
    
    this.load.image('map_advanced', '/assets/maps/map_advanced.png');
    this.load.image('map_advanced_path', '/assets/maps/map_advanced_path.png');
  }

  private loadUI() {
    this.load.image('main_menu_bg', '/assets/ui/main_menu_bg.png');
    this.load.image('panel', '/assets/ui/panel.png');
    this.load.image('button_normal', '/assets/ui/button_normal.png');
    this.load.image('button_hover', '/assets/ui/button_hover.png');
    this.load.image('button_pressed', '/assets/ui/button_pressed.png');
    this.load.image('tower_frame', '/assets/ui/tower_frame.png');
    this.load.image('health_bar_bg', '/assets/ui/health_bar_bg.png');
    this.load.image('health_bar_fill', '/assets/ui/health_bar_fill.png');
    this.load.image('money_icon', '/assets/ui/money_icon.png');
    this.load.image('avatar_frame', '/assets/ui/avatar_frame.png');
  }

  private loadEffects() {
    // Tower placement effect
    for (let i = 1; i <= 5; i++) {
      this.load.image(`tower_place_${i}`, `/assets/effects/tower_place_${i}.png`);
    }
    
    // Enemy pop effect
    for (let i = 1; i <= 5; i++) {
      this.load.image(`pop_${i}`, `/assets/effects/pop_${i}.png`);
    }
    
    // Upgrade effect
    for (let i = 1; i <= 5; i++) {
      this.load.image(`upgrade_${i}`, `/assets/effects/upgrade_${i}.png`);
    }
    
    // Lightning effect
    for (let i = 1; i <= 5; i++) {
      this.load.image(`lightning_${i}`, `/assets/effects/lightning_${i}.png`);
    }
    
    // Freeze effect
    for (let i = 1; i <= 5; i++) {
      this.load.image(`freeze_${i}`, `/assets/effects/freeze_${i}.png`);
    }
  }

  private loadAudio() {
    this.load.audio('background_music', '/assets/audio/background_music.mp3');
    this.load.audio('tower_place', '/assets/audio/tower_place.mp3');
    this.load.audio('pop', '/assets/audio/pop.mp3');
    this.load.audio('game_start', '/assets/audio/game_start.mp3');
    this.load.audio('round_start', '/assets/audio/round_start.mp3');
    this.load.audio('victory', '/assets/audio/victory.mp3');
    this.load.audio('defeat', '/assets/audio/defeat.mp3');
    this.load.audio('upgrade', '/assets/audio/upgrade.mp3');
    this.load.audio('button_click', '/assets/audio/button_click.mp3');
  }
}
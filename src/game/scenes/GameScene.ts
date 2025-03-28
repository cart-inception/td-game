import Phaser from 'phaser';
import { Socket } from 'socket.io-client';
import Tower from '@/game/objects/Tower';
import Enemy from '@/game/objects/Enemy';
import { GameState, PlayerData, TowerData, EnemyData } from '@/types/game';

export default class GameScene extends Phaser.Scene {
  private socket: Socket | null = null;
  private map: Phaser.GameObjects.Image | null = null;
  private pathLayer: Phaser.GameObjects.Image | null = null;
  private towers: Phaser.GameObjects.Group | null = null;
  private enemies: Phaser.GameObjects.Group | null = null;
  private path: Phaser.Curves.Path | null = null;
  private mapType: string = 'beginner';
  private gameState: GameState | null = null;
  private playerData: PlayerData | null = null;
  private selectedTower: string | null = null;
  private towerPreview: Phaser.GameObjects.Image | null = null;
  private validPlacement: boolean = false;
  private playerSection: Phaser.GameObjects.Rectangle | null = null;
  private playerSectionHighlight: Phaser.GameObjects.Rectangle | null = null;

  constructor() {
    super('GameScene');
  }

  setSocket(socket: Socket) {
    this.socket = socket;
  }

  create() {
    // Create game map
    this.createMap();
    
    // Initialize groups
    this.towers = this.add.group();
    this.enemies = this.add.group();
    
    // Define path for enemies
    this.definePath();
    
    // Set up socket event listeners
    if (this.socket) {
      this.setupSocketListeners();
    }
    
    // Set up input events
    this.setupInputEvents();
    
    // Start UI scene
    this.scene.launch('UIScene');
    this.scene.get('UIScene').events.on('towerSelected', this.handleTowerSelected, this);

    // Request initial game state from server
    this.socket?.emit('getGameState');
  }

  update() {
    // Update tower preview if a tower is selected
    this.updateTowerPreview();
    
    // Update enemies along the path
    this.updateEnemies();
  }

  private createMap() {
    // Add main map image
    this.map = this.add.image(0, 0, `map_${this.mapType}`).setOrigin(0, 0);
    
    // Add path overlay
    this.pathLayer = this.add.image(0, 0, `map_${this.mapType}_path`).setOrigin(0, 0);
    this.pathLayer.setAlpha(0.7);
  }

  private definePath() {
    // Define different paths based on the map type
    this.path = new Phaser.Curves.Path(0, 200);
    
    if (this.mapType === 'beginner') {
      // Simple winding path for the beginner map
      this.path.lineTo(200, 200);
      this.path.lineTo(200, 400);
      this.path.lineTo(600, 400);
      this.path.lineTo(600, 200);
      this.path.lineTo(1000, 200);
      this.path.lineTo(1000, 600);
      this.path.lineTo(1280, 600);
    } else if (this.mapType === 'intermediate') {
      // More complex path with splits for the intermediate map
      this.path.lineTo(300, 200);
      this.path.lineTo(300, 500);
      this.path.lineTo(700, 500);
      this.path.lineTo(700, 300);
      this.path.lineTo(1100, 300);
      this.path.lineTo(1100, 600);
      this.path.lineTo(1280, 600);
    } else if (this.mapType === 'advanced') {
      // Complex intersecting paths for the advanced map
      this.path.lineTo(300, 200);
      this.path.lineTo(300, 600);
      this.path.lineTo(600, 600);
      this.path.lineTo(600, 100);
      this.path.lineTo(900, 100);
      this.path.lineTo(900, 500);
      this.path.lineTo(1280, 500);
    }
    
    // Visualize the path for debugging (can be removed in production)
    if (process.env.NODE_ENV === 'development') {
      const graphics = this.add.graphics();
      graphics.lineStyle(5, 0xff0000, 0.7);
      this.path.draw(graphics);
    }
  }

  private setupSocketListeners() {
    if (!this.socket) return;
    
    // Listen for game state updates from the server
    this.socket.on('gameState', (gameState: GameState) => {
      this.updateGameState(gameState);
    });
    
    // Listen for player data including the assigned section of the map
    this.socket.on('playerData', (playerData: PlayerData) => {
      this.playerData = playerData;
      this.createPlayerSection(playerData.section);
    });
    
    // Listen for new enemy spawns
    this.socket.on('enemySpawned', (enemyData: EnemyData) => {
      this.spawnEnemy(enemyData);
    });
    
    // Listen for tower placements by other players
    this.socket.on('towerPlaced', (towerData: TowerData) => {
      this.placeTower(towerData);
    });
    
    // Listen for tower upgrades
    this.socket.on('towerUpgraded', (towerId: string, level: number) => {
      this.upgradeTower(towerId, level);
    });
    
    // Listen for round start events
    this.socket.on('roundStart', (roundNumber: number) => {
      this.startRound(roundNumber);
    });
    
    // Listen for game over events
    this.socket.on('gameOver', (victory: boolean) => {
      this.handleGameOver(victory);
    });
  }

  private setupInputEvents() {
    // Handle mouse movement for tower placement
    this.input.on('pointermove', (pointer: Phaser.Input.Pointer) => {
      if (this.selectedTower && this.towerPreview) {
        this.towerPreview.setPosition(pointer.x, pointer.y);
        this.checkPlacementValidity(pointer.x, pointer.y);
      }
    });
    
    // Handle mouse clicks for tower placement
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      if (this.selectedTower && this.validPlacement) {
        this.requestTowerPlacement(this.selectedTower, pointer.x, pointer.y);
      }
    });
  }

  private updateGameState(gameState: GameState) {
    this.gameState = gameState;
    
    // Update towers
    gameState.towers.forEach(towerData => {
      const existingTower = this.findTowerById(towerData.id);
      if (!existingTower) {
        this.placeTower(towerData);
      }
    });
    
    // Update enemies
    gameState.enemies.forEach(enemyData => {
      const existingEnemy = this.findEnemyById(enemyData.id);
      if (!existingEnemy) {
        this.spawnEnemy(enemyData);
      } else {
        existingEnemy.updateFromData(enemyData);
      }
    });
    
    // Update UI with lives and money
    this.events.emit('resourcesUpdated', {
      lives: gameState.lives,
      money: gameState.playerMoney[this.playerData?.id || ''] || 0,
      round: gameState.round
    });
  }

  private createPlayerSection(section: { x: number; y: number; width: number; height: number }) {
    // Create a rectangle showing the player's assigned section
    if (this.playerSection) {
      this.playerSection.destroy();
    }
    
    this.playerSection = this.add.rectangle(
      section.x + section.width / 2,
      section.y + section.height / 2,
      section.width,
      section.height,
      0x00ff00,
      0.1
    );
    
    // Create a highlight for the player's section when hovered
    if (this.playerSectionHighlight) {
      this.playerSectionHighlight.destroy();
    }
    
    this.playerSectionHighlight = this.add.rectangle(
      section.x + section.width / 2,
      section.y + section.height / 2,
      section.width,
      section.height,
      0x00ff00,
      0.3
    );
    
    this.playerSectionHighlight.setVisible(false);
    
    // Show the highlight when hovering over the player's section
    this.playerSection.setInteractive();
    this.playerSection.on('pointerover', () => {
      if (this.playerSectionHighlight) {
        this.playerSectionHighlight.setVisible(true);
      }
    });
    
    this.playerSection.on('pointerout', () => {
      if (this.playerSectionHighlight) {
        this.playerSectionHighlight.setVisible(false);
      }
    });
  }

  private spawnEnemy(enemyData: EnemyData) {
    if (!this.enemies || !this.path) return;
    
    const enemy = new Enemy(
      this,
      enemyData.id,
      enemyData.type,
      enemyData.health,
      enemyData.maxHealth,
      enemyData.speed,
      this.path
    );
    
    this.enemies.add(enemy);
    
    // Position the enemy at the start of the path with the given progress
    enemy.setPathPosition(enemyData.pathProgress);
  }

  private placeTower(towerData: TowerData) {
    if (!this.towers) return;
    
    const tower = new Tower(
      this,
      towerData.id,
      towerData.type,
      towerData.x,
      towerData.y,
      towerData.level,
      towerData.ownerId === this.playerData?.id
    );
    
    this.towers.add(tower);
    
    // Play placement sound
    this.sound.play('tower_place');
    
    // Show placement effect
    this.showPlacementEffect(towerData.x, towerData.y);
  }

  private upgradeTower(towerId: string, level: number) {
    const tower = this.findTowerById(towerId);
    if (tower) {
      tower.upgrade(level);
      
      // Play upgrade sound
      this.sound.play('upgrade');
      
      // Show upgrade effect
      this.showUpgradeEffect(tower.x, tower.y);
    }
  }

  private startRound(roundNumber: number) {
    // Play round start sound
    this.sound.play('round_start');
    
    // Show round start text
    const roundText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2,
      `Round ${roundNumber}`,
      {
        fontSize: '64px',
        color: '#ffffff',
        stroke: '#000000',
        strokeThickness: 6,
        shadow: { blur: 10, color: '#000000', fill: true }
      }
    ).setOrigin(0.5);
    
    // Animate the text
    this.tweens.add({
      targets: roundText,
      scale: { from: 0.5, to: 1 },
      alpha: { from: 0, to: 1 },
      duration: 1000,
      ease: 'Back.out',
      onComplete: () => {
        this.tweens.add({
          targets: roundText,
          alpha: 0,
          y: '+=50',
          duration: 1000,
          delay: 1000,
          onComplete: () => {
            roundText.destroy();
          }
        });
      }
    });
  }

  private handleGameOver(victory: boolean) {
    // Play appropriate sound
    this.sound.play(victory ? 'victory' : 'defeat');
    
    // Show game over text
    const gameOverText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 - 50,
      victory ? 'Victory!' : 'Game Over',
      {
        fontSize: '80px',
        color: victory ? '#ffff00' : '#ff0000',
        stroke: '#000000',
        strokeThickness: 8,
        shadow: { blur: 10, color: '#000000', fill: true }
      }
    ).setOrigin(0.5);
    
    // Show return to lobby button
    const returnButton = this.add.image(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      'button_normal'
    ).setDisplaySize(300, 80).setInteractive();
    
    const returnText = this.add.text(
      this.cameras.main.width / 2,
      this.cameras.main.height / 2 + 100,
      'Return to Lobby',
      {
        fontSize: '24px',
        color: '#ffffff'
      }
    ).setOrigin(0.5);
    
    returnButton.on('pointerover', () => {
      returnButton.setTexture('button_hover');
    });
    
    returnButton.on('pointerout', () => {
      returnButton.setTexture('button_normal');
    });
    
    returnButton.on('pointerdown', () => {
      returnButton.setTexture('button_pressed');
    });
    
    returnButton.on('pointerup', () => {
      this.sound.play('button_click');
      this.socket?.emit('returnToLobby');
      // This will trigger a reload of the game page to return to lobby
      window.location.reload();
    });
  }

  handleTowerSelected(towerType: string) {
    this.selectedTower = towerType;
    
    // Clean up any existing preview
    if (this.towerPreview) {
      this.towerPreview.destroy();
    }
    
    // Create a new preview image
    this.towerPreview = this.add.image(0, 0, towerType).setAlpha(0.7);
    
    // Add a range indicator for the preview
    const towerRange = this.getTowerRange(towerType);
    
    const rangeCircle = this.add.circle(0, 0, towerRange, 0xffffff, 0.3);
    rangeCircle.setStrokeStyle(2, 0xffffff, 0.8);
    
    // Group the preview and range indicator
    this.towerPreview.add(rangeCircle);
  }

  private updateTowerPreview() {
    if (!this.towerPreview || !this.selectedTower) return;
    
    const pointer = this.input.activePointer;
    this.towerPreview.setPosition(pointer.x, pointer.y);
    
    // Update the preview color based on placement validity
    if (this.validPlacement) {
      this.towerPreview.setTint(0x00ff00); // Green for valid
    } else {
      this.towerPreview.setTint(0xff0000); // Red for invalid
    }
  }

  private checkPlacementValidity(x: number, y: number) {
    if (!this.playerData || !this.gameState) {
      this.validPlacement = false;
      return;
    }
    
    // Check if position is within player's section
    const section = this.playerData.section;
    const inSection = (
      x >= section.x &&
      x <= section.x + section.width &&
      y >= section.y &&
      y <= section.y + section.height
    );
    
    // Check if player has enough money
    const towerCost = this.getTowerCost(this.selectedTower || '');
    const playerMoney = this.gameState.playerMoney[this.playerData.id] || 0;
    const hasEnoughMoney = playerMoney >= towerCost;
    
    // Check if position is not on the path
    const isOnPath = this.isPositionOnPath(x, y);
    
    // Check if position is not already occupied by another tower
    const isOccupied = this.isPositionOccupied(x, y);
    
    this.validPlacement = inSection && hasEnoughMoney && !isOnPath && !isOccupied;
  }

  private isPositionOnPath(x: number, y: number): boolean {
    // This is a simplified check - in a real game you would want a more precise collision detection
    if (!this.pathLayer) return false;
    
    // Get a small area around the position
    const bounds = new Phaser.Geom.Rectangle(x - 20, y - 20, 40, 40);
    
    // Check if any part of the path is within these bounds
    // This would need a more sophisticated implementation in a real game
    return this.pathLayer.getBounds().contains(x, y);
  }

  private isPositionOccupied(x: number, y: number): boolean {
    if (!this.towers) return false;
    
    // Check if any tower is too close to this position
    const minDistance = 40; // Minimum distance between towers
    
    let occupied = false;
    this.towers.getChildren().forEach((child) => {
      const tower = child as Tower;
      const distance = Phaser.Math.Distance.Between(x, y, tower.x, tower.y);
      if (distance < minDistance) {
        occupied = true;
      }
    });
    
    return occupied;
  }

  private requestTowerPlacement(towerType: string, x: number, y: number) {
    if (!this.socket || !this.validPlacement) return;
    
    // Send tower placement request to server
    this.socket.emit('placeTower', { type: towerType, x, y });
    
    // Clear selection after placement
    this.selectedTower = null;
    if (this.towerPreview) {
      this.towerPreview.destroy();
      this.towerPreview = null;
    }
  }

  private getTowerCost(towerType: string): number {
    // Define base costs for different tower types
    const costs: { [key: string]: number } = {
      'basic_tower': 200,
      'rapid_tower': 350,
      'splash_tower': 400,
      'freeze_tower': 500,
      'lightning_tower': 650,
      'income_tower': 800,
      'buff_tower': 450
    };
    
    return costs[towerType] || 200;
  }

  private getTowerRange(towerType: string): number {
    // Define base ranges for different tower types
    const ranges: { [key: string]: number } = {
      'basic_tower': 150,
      'rapid_tower': 120,
      'splash_tower': 180,
      'freeze_tower': 140,
      'lightning_tower': 200,
      'income_tower': 100,
      'buff_tower': 250
    };
    
    return ranges[towerType] || 150;
  }

  private findTowerById(id: string): Tower | null {
    if (!this.towers) return null;
    
    const tower = this.towers.getChildren().find(
      (child) => (child as Tower).id === id
    ) as Tower;
    
    return tower || null;
  }

  private findEnemyById(id: string): Enemy | null {
    if (!this.enemies) return null;
    
    const enemy = this.enemies.getChildren().find(
      (child) => (child as Enemy).id === id
    ) as Enemy;
    
    return enemy || null;
  }

  private updateEnemies() {
    if (!this.enemies) return;
    
    // Update all enemies
    this.enemies.getChildren().forEach((child) => {
      const enemy = child as Enemy;
      enemy.update();
    });
  }

  private showPlacementEffect(x: number, y: number) {
    // Create a tower placement effect animation
    const frames = [];
    for (let i = 1; i <= 5; i++) {
      frames.push({ key: `tower_place_${i}` });
    }
    
    this.anims.create({
      key: 'tower_place',
      frames: frames,
      frameRate: 10,
      repeat: 0
    });
    
    const effect = this.add.sprite(x, y, 'tower_place_1');
    effect.play('tower_place');
    
    effect.once('animationcomplete', () => {
      effect.destroy();
    });
  }

  private showUpgradeEffect(x: number, y: number) {
    // Create a tower upgrade effect animation
    const frames = [];
    for (let i = 1; i <= 5; i++) {
      frames.push({ key: `upgrade_${i}` });
    }
    
    this.anims.create({
      key: 'tower_upgrade',
      frames: frames,
      frameRate: 10,
      repeat: 0
    });
    
    const effect = this.add.sprite(x, y, 'upgrade_1');
    effect.play('tower_upgrade');
    
    effect.once('animationcomplete', () => {
      effect.destroy();
    });
  }
}
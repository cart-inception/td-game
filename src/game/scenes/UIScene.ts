import Phaser from 'phaser';

export default class UIScene extends Phaser.Scene {
  private panel: Phaser.GameObjects.Image | null = null;
  private towerButtons: { [key: string]: Phaser.GameObjects.Image } = {};
  private selectedTowerFrame: Phaser.GameObjects.Image | null = null;
  private healthBar: {
    bg: Phaser.GameObjects.Image;
    fill: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
  } | null = null;
  private moneyText: Phaser.GameObjects.Text | null = null;
  private roundText: Phaser.GameObjects.Text | null = null;
  private playerDisplays: Phaser.GameObjects.Container[] = [];
  private startRoundButton: {
    bg: Phaser.GameObjects.Image;
    text: Phaser.GameObjects.Text;
  } | null = null;

  constructor() {
    super('UIScene');
  }

  create() {
    // UI is rendered on top of the game scene
    this.scene.bringToTop();
    
    // Create UI panel
    this.createPanel();
    
    // Create tower selection buttons
    this.createTowerButtons();
    
    // Create health bar
    this.createHealthBar();
    
    // Create money display
    this.createMoneyDisplay();
    
    // Create round display
    this.createRoundDisplay();
    
    // Create player displays for multiplayer
    this.createPlayerDisplays();
    
    // Create start round button
    this.createStartRoundButton();
    
    // Listen for resource updates from the game scene
    const gameScene = this.scene.get('GameScene');
    gameScene.events.on('resourcesUpdated', this.updateResources, this);
  }

  private createPanel() {
    // Add the side panel on the right side
    this.panel = this.add.image(
      this.cameras.main.width - 150,
      this.cameras.main.height / 2,
      'panel'
    );
    
    // Add a title to the panel
    this.add.text(
      this.cameras.main.width - 150,
      50,
      'TOWERS',
      {
        fontSize: '24px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
  }

  private createTowerButtons() {
    const towerTypes = [
      'basic_tower',
      'rapid_tower',
      'splash_tower',
      'freeze_tower',
      'lightning_tower',
      'income_tower',
      'buff_tower'
    ];
    
    const towerNames = [
      'Basic',
      'Rapid',
      'Splash',
      'Freeze',
      'Lightning',
      'Income',
      'Support'
    ];
    
    const costs = [200, 350, 400, 500, 650, 800, 450];
    
    const startY = 120;
    const spacing = 80;
    
    // Create a selected tower frame (initially hidden)
    this.selectedTowerFrame = this.add.image(0, 0, 'tower_frame').setVisible(false);
    
    // Create tower buttons with icons and labels
    towerTypes.forEach((type, index) => {
      const x = this.cameras.main.width - 150;
      const y = startY + index * spacing;
      
      // Create the tower frame/background
      const frame = this.add.image(x, y, 'tower_frame');
      
      // Create the tower icon
      const icon = this.add.image(x, y, type)
        .setInteractive({ useHandCursor: true })
        .setData('type', type);
      
      // Store button reference
      this.towerButtons[type] = icon;
      
      // Add name label
      this.add.text(
        x - 70,
        y,
        towerNames[index],
        {
          fontSize: '16px',
          color: '#ffffff'
        }
      ).setOrigin(0, 0.5);
      
      // Add cost label
      this.add.text(
        x - 70,
        y + 15,
        `$${costs[index]}`,
        {
          fontSize: '14px',
          color: '#ffff00'
        }
      ).setOrigin(0, 0.5);
      
      // Add tower selection event
      icon.on('pointerdown', () => {
        this.selectTower(type, x, y);
      });
    });
  }

  private createHealthBar() {
    const x = 120;
    const y = 40;
    
    // Create health bar background
    const bg = this.add.image(x, y, 'health_bar_bg');
    
    // Create health bar fill
    const fill = this.add.image(x - bg.width / 2 + 2, y, 'health_bar_fill')
      .setOrigin(0, 0.5);
    
    // Create health text
    const text = this.add.text(
      x,
      y,
      '100',
      {
        fontSize: '16px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Add heart icon
    this.add.text(
      x - bg.width / 2 - 20,
      y,
      '❤️',
      {
        fontSize: '20px'
      }
    ).setOrigin(0.5);
    
    // Store references for updating
    this.healthBar = { bg, fill, text };
  }

  private createMoneyDisplay() {
    const x = 300;
    const y = 40;
    
    // Add money icon
    this.add.image(x - 40, y, 'money_icon');
    
    // Add money text
    this.moneyText = this.add.text(
      x,
      y,
      '$650',
      {
        fontSize: '20px',
        color: '#ffff00',
        fontStyle: 'bold'
      }
    ).setOrigin(0, 0.5);
  }

  private createRoundDisplay() {
    const x = 450;
    const y = 40;
    
    // Add round label
    this.add.text(
      x - 40,
      y,
      'Round:',
      {
        fontSize: '18px',
        color: '#ffffff'
      }
    ).setOrigin(1, 0.5);
    
    // Add round number text
    this.roundText = this.add.text(
      x,
      y,
      '1',
      {
        fontSize: '20px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0, 0.5);
  }

  private createPlayerDisplays() {
    const startX = 600;
    const y = 40;
    const spacing = 70;
    
    // Clear any existing displays
    this.playerDisplays.forEach(display => display.destroy());
    this.playerDisplays = [];
    
    // Create up to 6 player displays
    for (let i = 0; i < 6; i++) {
      const x = startX + i * spacing;
      
      const container = this.add.container(x, y);
      
      // Add avatar frame
      const frame = this.add.image(0, 0, 'avatar_frame');
      
      // Add player color marker (different color for each player)
      const color = this.getPlayerColor(i);
      const marker = this.add.circle(0, 0, 20, color);
      
      // Add player index
      const text = this.add.text(
        0,
        0,
        `P${i + 1}`,
        {
          fontSize: '12px',
          color: '#ffffff',
          fontStyle: 'bold'
        }
      ).setOrigin(0.5);
      
      // Add components to container
      container.add([marker, frame, text]);
      this.playerDisplays.push(container);
    }
  }

  private createStartRoundButton() {
    const x = this.cameras.main.width - 150;
    const y = this.cameras.main.height - 80;
    
    // Create button background
    const bg = this.add.image(x, y, 'button_normal')
      .setInteractive({ useHandCursor: true });
    
    // Create button text
    const text = this.add.text(
      x,
      y,
      'Start Round',
      {
        fontSize: '18px',
        color: '#ffffff',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Store references
    this.startRoundButton = { bg, text };
    
    // Add button interactions
    bg.on('pointerover', () => {
      bg.setTexture('button_hover');
    });
    
    bg.on('pointerout', () => {
      bg.setTexture('button_normal');
    });
    
    bg.on('pointerdown', () => {
      bg.setTexture('button_pressed');
    });
    
    bg.on('pointerup', () => {
      bg.setTexture('button_hover');
      this.sound.play('button_click');
      this.requestStartRound();
    });
  }

  private selectTower(type: string, x: number, y: number) {
    // Play button click sound
    this.sound.play('button_click');
    
    // Show selection frame around the selected tower
    if (this.selectedTowerFrame) {
      this.selectedTowerFrame.setPosition(x, y).setVisible(true);
    }
    
    // Emit tower selected event to game scene
    this.events.emit('towerSelected', type);
  }

  updateResources(data: { lives: number; money: number; round: number }) {
    // Update health bar
    if (this.healthBar) {
      const healthPercent = Math.max(0, data.lives) / 100;
      this.healthBar.fill.setScale(healthPercent, 1);
      this.healthBar.text.setText(`${data.lives}`);
    }
    
    // Update money display
    if (this.moneyText) {
      this.moneyText.setText(`$${data.money}`);
    }
    
    // Update round display
    if (this.roundText) {
      this.roundText.setText(`${data.round}`);
    }
    
    // Update tower button availability based on money
    Object.entries(this.towerButtons).forEach(([type, button]) => {
      const cost = this.getTowerCost(type);
      if (data.money >= cost) {
        button.clearTint();
      } else {
        button.setTint(0x666666); // Grey out if can't afford
      }
    });
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

  private getPlayerColor(index: number): number {
    // Define colors for players
    const colors = [
      0x3498db, // Blue
      0xe74c3c, // Red
      0x2ecc71, // Green
      0xf1c40f, // Yellow
      0x9b59b6, // Purple
      0xe67e22  // Orange
    ];
    
    return colors[index % colors.length];
  }

  private requestStartRound() {
    // Send round start request to server
    const gameScene = this.scene.get('GameScene');
    gameScene.events.emit('startRoundRequested');
  }
}
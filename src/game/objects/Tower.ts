import Phaser from 'phaser';
import Enemy from './Enemy';

export default class Tower extends Phaser.GameObjects.Sprite {
  public id: string;
  public type: string;
  public level: number;
  public range: number;
  public damage: number;
  public fireRate: number;
  public isPlayerOwned: boolean;
  public lastFired: number = 0;
  public rangeCircle: Phaser.GameObjects.Graphics;
  public targetEnemy: Enemy | null = null;
  private showingRange: boolean = false;

  constructor(
    scene: Phaser.Scene,
    id: string,
    type: string,
    x: number,
    y: number,
    level: number = 1,
    isPlayerOwned: boolean = false
  ) {
    super(scene, x, y, type);
    
    this.id = id;
    this.type = type;
    this.level = level;
    this.isPlayerOwned = isPlayerOwned;
    
    // Set up base stats
    this.setupTowerStats();
    
    // Apply level upgrades
    this.applyLevelEffects();
    
    // Add range circle (initially hidden)
    this.rangeCircle = this.scene.add.graphics();
    this.updateRangeCircle();
    this.rangeCircle.setVisible(false);
    
    // Set up interactive features
    this.setInteractive({ useHandCursor: true });
    this.on('pointerdown', this.handleClick);
    this.on('pointerover', this.handlePointerOver);
    this.on('pointerout', this.handlePointerOut);
    
    // Add to scene
    this.scene.add.existing(this);
  }

  update(time: number, delta: number) {
    // Find and attack target if enough time has passed
    if (time > this.lastFired + this.fireRate) {
      if (!this.targetEnemy || !this.targetEnemy.active) {
        this.findTarget();
      }
      
      if (this.targetEnemy) {
        this.fireAtTarget(time);
      }
    }
    
    // Rotate tower towards target if exists
    if (this.targetEnemy && this.targetEnemy.active) {
      this.rotateToTarget();
    }
  }

  upgrade(level: number) {
    if (level <= this.level) return;
    
    this.level = level;
    
    // Update texture based on level
    this.setTexture(`${this.type}_lvl${level}`);
    
    // Apply level effects (increased range, damage, etc)
    this.applyLevelEffects();
    
    // Update range circle if visible
    this.updateRangeCircle();
  }

  private setupTowerStats() {
    // Base stats for different tower types
    switch (this.type) {
      case 'basic_tower':
        this.range = 150;
        this.damage = 1;
        this.fireRate = 1000; // ms between shots
        break;
      case 'rapid_tower':
        this.range = 120;
        this.damage = 0.5;
        this.fireRate = 400;
        break;
      case 'splash_tower':
        this.range = 180;
        this.damage = 0.8;
        this.fireRate = 1500;
        break;
      case 'freeze_tower':
        this.range = 140;
        this.damage = 0.3;
        this.fireRate = 1200;
        break;
      case 'lightning_tower':
        this.range = 200;
        this.damage = 0.7;
        this.fireRate = 1000;
        break;
      case 'income_tower':
        this.range = 0; // No attack range
        this.damage = 0;
        this.fireRate = 5000; // Generate income every 5 seconds
        break;
      case 'buff_tower':
        this.range = 250; // Buff range
        this.damage = 0;
        this.fireRate = 0; // No direct attacks
        break;
      default:
        this.range = 150;
        this.damage = 1;
        this.fireRate = 1000;
    }
  }

  private applyLevelEffects() {
    if (this.level === 1) return; // No bonuses for base level
    
    // Apply multipliers based on level
    const rangeMultiplier = 1 + 0.2 * (this.level - 1);
    const damageMultiplier = 1 + 0.3 * (this.level - 1);
    const fireRateMultiplier = 1 - 0.15 * (this.level - 1); // Lower is faster
    
    this.range = Math.floor(this.range * rangeMultiplier);
    this.damage = this.damage * damageMultiplier;
    this.fireRate = Math.max(100, this.fireRate * fireRateMultiplier);
  }

  private findTarget() {
    const enemies = this.scene.children.getChildren()
      .filter(obj => obj instanceof Enemy) as Enemy[];
    
    // Filter enemies in range
    const enemiesInRange = enemies.filter(enemy => {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y, enemy.x, enemy.y
      );
      return distance <= this.range && enemy.active;
    });
    
    // Sort by progress along path (target further along)
    enemiesInRange.sort((a, b) => b.pathProgress - a.pathProgress);
    
    // Target first enemy in range
    this.targetEnemy = enemiesInRange[0] || null;
  }

  private fireAtTarget(time: number) {
    if (!this.targetEnemy) return;
    
    // Set last fired time
    this.lastFired = time;
    
    // Handle different tower attack types
    switch (this.type) {
      case 'basic_tower':
        this.basicAttack();
        break;
      case 'rapid_tower':
        this.rapidAttack();
        break;
      case 'splash_tower':
        this.splashAttack();
        break;
      case 'freeze_tower':
        this.freezeAttack();
        break;
      case 'lightning_tower':
        this.lightningAttack();
        break;
      case 'income_tower':
        this.generateIncome();
        break;
      case 'buff_tower':
        this.buffNearbyTowers();
        break;
    }
  }

  private basicAttack() {
    if (!this.targetEnemy) return;
    
    // Create a simple projectile
    const projectile = this.scene.add.circle(this.x, this.y, 5, 0xffff00);
    
    // Animate projectile to target
    this.scene.tweens.add({
      targets: projectile,
      x: this.targetEnemy.x,
      y: this.targetEnemy.y,
      duration: 300,
      onComplete: () => {
        // Apply damage to enemy
        if (this.targetEnemy && this.targetEnemy.active) {
          this.targetEnemy.takeDamage(this.damage);
        }
        projectile.destroy();
      }
    });
  }

  private rapidAttack() {
    if (!this.targetEnemy) return;
    
    // Create a smaller, faster projectile
    const projectile = this.scene.add.circle(this.x, this.y, 3, 0xff0000);
    
    // Animate projectile to target
    this.scene.tweens.add({
      targets: projectile,
      x: this.targetEnemy.x,
      y: this.targetEnemy.y,
      duration: 200,
      onComplete: () => {
        // Apply damage to enemy
        if (this.targetEnemy && this.targetEnemy.active) {
          this.targetEnemy.takeDamage(this.damage);
        }
        projectile.destroy();
      }
    });
  }

  private splashAttack() {
    if (!this.targetEnemy) return;
    
    // Create a larger projectile
    const projectile = this.scene.add.circle(this.x, this.y, 8, 0xff9900);
    
    // Animate projectile to target with arc
    this.scene.tweens.add({
      targets: projectile,
      x: this.targetEnemy.x,
      y: this.targetEnemy.y,
      duration: 600,
      ease: Phaser.Math.Easing.Quadratic.Out,
      onUpdate: (tween) => {
        // Add arc effect
        const value = tween.getValue();
        const arc = Math.sin(value * Math.PI) * 50;
        projectile.y -= arc;
      },
      onComplete: () => {
        // Create splash effect
        const splash = this.scene.add.circle(
          this.targetEnemy.x,
          this.targetEnemy.y,
          30,
          0xff9900,
          0.7
        );
        
        // Animate splash
        this.scene.tweens.add({
          targets: splash,
          alpha: 0,
          scale: 2,
          duration: 300,
          onComplete: () => {
            splash.destroy();
          }
        });
        
        // Apply damage to all enemies in splash radius
        const enemies = this.scene.children.getChildren()
          .filter(obj => obj instanceof Enemy) as Enemy[];
        
        enemies.forEach(enemy => {
          const distance = Phaser.Math.Distance.Between(
            this.targetEnemy!.x, this.targetEnemy!.y, enemy.x, enemy.y
          );
          
          if (distance <= 60) {
            enemy.takeDamage(this.damage);
          }
        });
        
        projectile.destroy();
      }
    });
  }

  private freezeAttack() {
    if (!this.targetEnemy) return;
    
    // Create a freeze beam
    const beam = this.scene.add.line(
      0, 0,
      this.x, this.y,
      this.targetEnemy.x, this.targetEnemy.y,
      0x00ffff
    ).setLineWidth(2);
    
    // Add pulsing effect
    this.scene.tweens.add({
      targets: beam,
      alpha: 0,
      duration: 500,
      onComplete: () => {
        beam.destroy();
      }
    });
    
    // Apply slow effect to target
    this.targetEnemy.applyEffect('freeze', 2000, 0.5);
    
    // Apply damage
    this.targetEnemy.takeDamage(this.damage);
    
    // Create freeze effect
    const frames = [];
    for (let i = 1; i <= 5; i++) {
      frames.push({ key: `freeze_${i}` });
    }
    
    this.scene.anims.create({
      key: 'freeze_effect',
      frames: frames,
      frameRate: 10,
      repeat: 0
    });
    
    const effect = this.scene.add.sprite(this.targetEnemy.x, this.targetEnemy.y, 'freeze_1');
    effect.play('freeze_effect');
    
    effect.once('animationcomplete', () => {
      effect.destroy();
    });
  }

  private lightningAttack() {
    if (!this.targetEnemy) return;
    
    // Create a lightning effect
    const points = this.createLightningPoints(
      this.x, this.y,
      this.targetEnemy.x, this.targetEnemy.y,
      5 // Number of segments
    );
    
    // Draw lightning
    const lightning = this.scene.add.graphics();
    lightning.lineStyle(3, 0x9966ff);
    lightning.beginPath();
    lightning.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      lightning.lineTo(points[i].x, points[i].y);
    }
    
    lightning.strokePath();
    
    // Animate lightning effect
    this.scene.tweens.add({
      targets: lightning,
      alpha: 0,
      duration: 300,
      onComplete: () => {
        lightning.destroy();
      }
    });
    
    // Apply damage to primary target
    this.targetEnemy.takeDamage(this.damage);
    
    // Chain lightning to nearby enemies
    if (this.level >= 2) {
      const enemies = this.scene.children.getChildren()
        .filter(obj => obj instanceof Enemy && obj !== this.targetEnemy) as Enemy[];
      
      const nearbyEnemies = enemies.filter(enemy => {
        const distance = Phaser.Math.Distance.Between(
          this.targetEnemy!.x, this.targetEnemy!.y, enemy.x, enemy.y
        );
        return distance <= 80 && enemy.active;
      }).slice(0, 2); // Chain to up to 2 additional enemies
      
      nearbyEnemies.forEach(enemy => {
        // Create chain lightning effect
        const chainPoints = this.createLightningPoints(
          this.targetEnemy!.x, this.targetEnemy!.y,
          enemy.x, enemy.y,
          3 // Fewer segments for chain lightning
        );
        
        const chainLightning = this.scene.add.graphics();
        chainLightning.lineStyle(2, 0x9966ff);
        chainLightning.beginPath();
        chainLightning.moveTo(chainPoints[0].x, chainPoints[0].y);
        
        for (let i = 1; i < chainPoints.length; i++) {
          chainLightning.lineTo(chainPoints[i].x, chainPoints[i].y);
        }
        
        chainLightning.strokePath();
        
        // Animate chain lightning
        this.scene.tweens.add({
          targets: chainLightning,
          alpha: 0,
          duration: 200,
          onComplete: () => {
            chainLightning.destroy();
          }
        });
        
        // Apply reduced damage to chained targets
        enemy.takeDamage(this.damage * 0.5);
      });
    }
  }

  private generateIncome() {
    // Income tower generates money over time
    if (!this.isPlayerOwned) return; // Only player-owned income towers generate money
    
    // Generate floating money indicator
    const moneyText = this.scene.add.text(this.x, this.y, `+$${this.level * 10}`, {
      fontSize: '16px',
      color: '#ffff00'
    }).setOrigin(0.5);
    
    // Animate money text
    this.scene.tweens.add({
      targets: moneyText,
      y: this.y - 40,
      alpha: 0,
      duration: 1500,
      onComplete: () => {
        moneyText.destroy();
      }
    });
    
    // Emit event to add money to player
    this.scene.events.emit('generateIncome', this.level * 10);
  }

  private buffNearbyTowers() {
    // Find towers in range to buff
    const towers = this.scene.children.getChildren()
      .filter(obj => obj instanceof Tower && obj !== this) as Tower[];
    
    const towersInRange = towers.filter(tower => {
      const distance = Phaser.Math.Distance.Between(
        this.x, this.y, tower.x, tower.y
      );
      return distance <= this.range;
    });
    
    // Show buff effect
    const buffCircle = this.scene.add.circle(
      this.x, this.y,
      this.range,
      0x00ff00,
      0.2
    );
    
    // Animate buff circle
    this.scene.tweens.add({
      targets: buffCircle,
      alpha: 0,
      scale: 1.2,
      duration: 1000,
      onComplete: () => {
        buffCircle.destroy();
      }
    });
    
    // Apply buff to towers in range
    towersInRange.forEach(tower => {
      // Show connection line to buffed towers
      const line = this.scene.add.line(
        0, 0,
        this.x, this.y,
        tower.x, tower.y,
        0x00ff00
      ).setLineWidth(1).setAlpha(0.5);
      
      // Animate line
      this.scene.tweens.add({
        targets: line,
        alpha: 0,
        duration: 1000,
        onComplete: () => {
          line.destroy();
        }
      });
      
      // Apply buff effect (20% damage increase)
      tower.applyBuff(0.2 * this.level, 5000);
    });
  }

  applyBuff(multiplier: number, duration: number) {
    // Apply temporary damage buff
    const originalDamage = this.damage;
    this.damage *= (1 + multiplier);
    
    // Show buff icon
    const buffIcon = this.scene.add.text(
      this.x, this.y - 20,
      '⚡',
      { fontSize: '16px' }
    ).setOrigin(0.5);
    
    // Remove buff after duration
    this.scene.time.delayedCall(duration, () => {
      this.damage = originalDamage;
      buffIcon.destroy();
    });
  }

  private rotateToTarget() {
    if (!this.targetEnemy) return;
    
    // Calculate angle to target
    const angle = Phaser.Math.Angle.Between(
      this.x, this.y,
      this.targetEnemy.x, this.targetEnemy.y
    );
    
    // Convert to degrees and set rotation
    this.rotation = angle + Math.PI / 2; // Add 90 degrees to point correctly
  }

  private createLightningPoints(
    startX: number, startY: number,
    endX: number, endY: number,
    segments: number
  ): { x: number; y: number }[] {
    const points = [];
    points.push({ x: startX, y: startY });
    
    // Create jagged lightning effect
    for (let i = 1; i < segments; i++) {
      const ratio = i / segments;
      const x = startX + (endX - startX) * ratio;
      const y = startY + (endY - startY) * ratio;
      
      // Add randomness
      const randomAngle = Phaser.Math.FloatBetween(-Math.PI / 4, Math.PI / 4);
      const segmentLength = Phaser.Math.Distance.Between(startX, startY, endX, endY) / segments;
      const offset = segmentLength * 0.3;
      
      points.push({
        x: x + Math.cos(randomAngle) * offset,
        y: y + Math.sin(randomAngle) * offset
      });
    }
    
    points.push({ x: endX, y: endY });
    return points;
  }

  private handleClick() {
    // Toggle range display
    this.showingRange = !this.showingRange;
    this.rangeCircle.setVisible(this.showingRange);
    
    // Emit selection event for tower info panel
    this.scene.events.emit('towerSelected', this);
  }

  private handlePointerOver() {
    this.setTint(0x00ff00);
  }

  private handlePointerOut() {
    this.clearTint();
  }

  private updateRangeCircle() {
    this.rangeCircle.clear();
    this.rangeCircle.lineStyle(2, 0xffffff, 0.5);
    this.rangeCircle.strokeCircle(this.x, this.y, this.range);
    this.rangeCircle.fillStyle(0xffffff, 0.1);
    this.rangeCircle.fillCircle(this.x, this.y, this.range);
  }
}
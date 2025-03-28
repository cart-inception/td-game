import Phaser from 'phaser';
import { EnemyData } from '@/types/game';

interface Effect {
  type: string;
  duration: number;
  value: number;
  endTime: number;
}

export default class Enemy extends Phaser.GameObjects.Sprite {
  public id: string;
  public type: string;
  public health: number;
  public maxHealth: number;
  public speed: number;
  public baseSpeed: number;
  public path: Phaser.Curves.Path;
  public follower: { t: number };
  public pathProgress: number;
  public healthBar: Phaser.GameObjects.Graphics;
  public effects: Effect[] = [];
  public camo: boolean = false;
  public regen: boolean = false;

  constructor(
    scene: Phaser.Scene,
    id: string,
    type: string,
    health: number,
    maxHealth: number,
    speed: number,
    path: Phaser.Curves.Path
  ) {
    // Get initial position at the start of the path
    const startPosition = path.getPoint(0);
    super(scene, startPosition.x, startPosition.y, type);
    
    this.id = id;
    this.type = type;
    this.health = health;
    this.maxHealth = maxHealth;
    this.speed = speed;
    this.baseSpeed = speed;
    this.path = path;
    this.follower = { t: 0 };
    this.pathProgress = 0;
    
    // Set up special properties based on type
    this.setupEnemyProperties();
    
    // Create health bar
    this.healthBar = this.scene.add.graphics();
    this.updateHealthBar();
    
    // Add to scene
    this.scene.add.existing(this);
  }

  update() {
    // Update path follower
    this.updateFollower();
    
    // Update health bar position
    this.updateHealthBar();
    
    // Update active effects
    this.updateEffects();
    
    // Apply regeneration if applicable
    if (this.regen && this.health < this.maxHealth) {
      this.health += 0.001 * this.maxHealth;
      this.health = Math.min(this.health, this.maxHealth);
    }
  }

  updateFromData(data: EnemyData) {
    // Update properties from server data
    this.health = data.health;
    this.pathProgress = data.pathProgress;
    
    // Update position based on path progress
    this.follower.t = this.pathProgress;
    const point = this.path.getPoint(this.follower.t);
    this.setPosition(point.x, point.y);
    
    // Update health bar
    this.updateHealthBar();
  }

  setPathPosition(progress: number) {
    this.pathProgress = progress;
    this.follower.t = progress;
    const point = this.path.getPoint(progress);
    this.setPosition(point.x, point.y);
  }

  takeDamage(amount: number) {
    // Apply damage
    this.health -= amount;
    
    // Update health bar
    this.updateHealthBar();
    
    // Check if enemy is defeated
    if (this.health <= 0) {
      this.defeat();
    } else {
      // Show damage text
      this.showDamageText(amount);
    }
  }

  applyEffect(type: string, duration: number, value: number) {
    // Remove any existing effect of the same type
    this.effects = this.effects.filter(effect => effect.type !== type);
    
    // Add new effect
    this.effects.push({
      type,
      duration,
      value,
      endTime: this.scene.time.now + duration
    });
    
    // Apply effect immediately
    this.applyEffectImpact(type, value);
    
    // Show effect indicator
    this.showEffectIndicator(type);
  }

  private setupEnemyProperties() {
    // Set properties based on enemy type
    switch (this.type) {
      case 'basic_bloon':
        // Standard bloon, no special properties
        break;
      case 'fast_bloon':
        this.speed *= 1.5;
        this.baseSpeed = this.speed;
        break;
      case 'heavy_bloon':
        this.speed *= 0.8;
        this.baseSpeed = this.speed;
        break;
      case 'camo_bloon':
        this.camo = true;
        this.alpha = 0.7; // Visual indicator of camo status
        break;
      case 'regen_bloon':
        this.regen = true;
        break;
      case 'boss_bloon':
        this.speed *= 0.5;
        this.baseSpeed = this.speed;
        this.setScale(1.5); // Larger size for boss
        break;
    }
  }

  private updateFollower() {
    // Advance follower along the path
    this.follower.t += this.speed / 10000;
    this.pathProgress = this.follower.t;
    
    // Get new position
    const point = this.path.getPoint(this.follower.t);
    
    // Calculate rotation to face movement direction
    if (this.x !== point.x || this.y !== point.y) {
      const angle = Phaser.Math.Angle.Between(this.x, this.y, point.x, point.y);
      this.rotation = angle + Math.PI / 2; // Add 90 degrees to point in the right direction
    }
    
    // Update position
    this.setPosition(point.x, point.y);
    
    // Check if reached the end of the path
    if (this.follower.t >= 1) {
      this.reachedEnd();
    }
  }

  private updateHealthBar() {
    this.healthBar.clear();
    
    // Draw background
    this.healthBar.fillStyle(0x000000, 0.5);
    this.healthBar.fillRect(this.x - 15, this.y - 20, 30, 5);
    
    // Calculate health ratio
    const healthRatio = Math.max(0, this.health) / this.maxHealth;
    
    // Draw health fill
    if (healthRatio > 0) {
      // Color based on health percentage
      let color = 0x00ff00; // Green
      if (healthRatio < 0.6) color = 0xffff00; // Yellow
      if (healthRatio < 0.3) color = 0xff0000; // Red
      
      this.healthBar.fillStyle(color, 1);
      this.healthBar.fillRect(this.x - 15, this.y - 20, 30 * healthRatio, 5);
    }
  }

  private updateEffects() {
    const currentTime = this.scene.time.now;
    
    // Check each effect for expiration
    this.effects = this.effects.filter(effect => {
      if (currentTime >= effect.endTime) {
        // Remove effect impact
        this.removeEffectImpact(effect.type, effect.value);
        return false;
      }
      return true;
    });
  }

  private applyEffectImpact(type: string, value: number) {
    switch (type) {
      case 'freeze':
        // Slow down movement
        this.speed = this.baseSpeed * (1 - value);
        // Add visual effect
        this.setTint(0x00ffff);
        break;
      case 'poison':
        // Will apply damage over time in update
        this.setTint(0x00ff00);
        break;
      case 'stun':
        // Stop movement completely
        this.speed = 0;
        // Add visual effect
        this.setTint(0xffff00);
        break;
    }
  }

  private removeEffectImpact(type: string, value: number) {
    switch (type) {
      case 'freeze':
      case 'stun':
        // Restore normal speed
        this.speed = this.baseSpeed;
        // Remove visual effect
        this.clearTint();
        break;
      case 'poison':
        // Stop poison damage
        this.clearTint();
        break;
    }
  }

  private showEffectIndicator(type: string) {
    let text = '';
    let color = '#ffffff';
    
    switch (type) {
      case 'freeze':
        text = '❄️';
        color = '#00ffff';
        break;
      case 'poison':
        text = '☠️';
        color = '#00ff00';
        break;
      case 'stun':
        text = '⚡';
        color = '#ffff00';
        break;
    }
    
    // Create floating text indicator
    const indicator = this.scene.add.text(this.x, this.y - 30, text, {
      fontSize: '16px',
      color: color
    }).setOrigin(0.5);
    
    // Animate and remove
    this.scene.tweens.add({
      targets: indicator,
      y: indicator.y - 20,
      alpha: 0,
      duration: 1000,
      onComplete: () => {
        indicator.destroy();
      }
    });
  }

  private showDamageText(amount: number) {
    // Create floating damage text
    const damageText = this.scene.add.text(
      this.x,
      this.y - 15,
      Math.round(amount * 10) / 10 + '',
      {
        fontSize: '14px',
        color: '#ff0000',
        fontStyle: 'bold'
      }
    ).setOrigin(0.5);
    
    // Animate and remove
    this.scene.tweens.add({
      targets: damageText,
      y: damageText.y - 30,
      alpha: 0,
      duration: 800,
      onComplete: () => {
        damageText.destroy();
      }
    });
  }

  private defeat() {
    // Create pop animation
    const frames = [];
    for (let i = 1; i <= 5; i++) {
      frames.push({ key: `pop_${i}` });
    }
    
    this.scene.anims.create({
      key: 'enemy_pop',
      frames: frames,
      frameRate: 10,
      repeat: 0
    });
    
    const popEffect = this.scene.add.sprite(this.x, this.y, 'pop_1');
    popEffect.play('enemy_pop');
    
    popEffect.once('animationcomplete', () => {
      popEffect.destroy();
    });
    
    // Play pop sound
    this.scene.sound.play('pop');
    
    // Remove health bar
    this.healthBar.destroy();
    
    // Emit defeat event to game scene
    this.scene.events.emit('enemyDefeated', this.id);
    
    // Remove enemy
    this.destroy();
  }

  private reachedEnd() {
    // Emit event for reaching the end
    this.scene.events.emit('enemyReachedEnd', this.id);
    
    // Remove health bar
    this.healthBar.destroy();
    
    // Remove enemy
    this.destroy();
  }
}
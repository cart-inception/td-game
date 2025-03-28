import Phaser from 'phaser';

export const gameConfig: Phaser.Types.Core.GameConfig = {
  type: Phaser.AUTO,
  width: 1280,
  height: 720,
  backgroundColor: '#333333',
  physics: {
    default: 'arcade',
    arcade: {
      gravity: { y: 0 },
      debug: process.env.NODE_ENV === 'development'
    }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH
  },
  scene: []
};
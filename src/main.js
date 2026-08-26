import Phaser from 'phaser';
import { CONFIG } from './config/gameConfig';
import GameScene from './scenes/GameScene';

const config = {
  type: Phaser.AUTO,
  width: CONFIG.WORLD_WIDTH,
  height: CONFIG.WORLD_HEIGHT,
  backgroundColor: '#000000',
  roundPixels: true,
  physics: {
    default: 'arcade',
    arcade: { gravity: { y: 0 }, debug: false }
  },
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
  scene: [GameScene]
};

// Check if a game instance already exists in the window scope during hot-reloads
if (window.gameInstance) {
  window.gameInstance.destroy(true);
}

window.gameInstance = new Phaser.Game(config);
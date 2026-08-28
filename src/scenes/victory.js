

import Phaser from 'phaser';

export default class VictoryScene extends Phaser.Scene {
  constructor() {
    super('VictoryScene');
  }

  init(data) {
    this.finalScore = data.finalScore || 40;
  }

  create() {
    const width = this.scale.width;
    const height = this.scale.height;

    // Victory Title
    this.add.text(width / 2, height / 2 - 60, 'VICTORY!', {
      font: 'bold 48px Arial',
      fill: '#00ffcc'
    }).setOrigin(0.5);

    // Final Stats
    this.add.text(width / 2, height / 2, `Enemies Defeated: ${this.finalScore}`, {
      font: '24px Arial',
      fill: '#ffffff'
    }).setOrigin(0.5);

    // Saved Confirmation
    this.add.text(width / 2, height / 2 + 40, 'Game Saved Successfully!', {
      font: '16px Arial',
      fill: '#888888'
    }).setOrigin(0.5);

    // Restart Button
    const restartButton = this.add.text(width / 2, height / 2 + 100, 'PLAY AGAIN', {
      font: '20px Arial',
      fill: '#ffffff',
      backgroundColor: '#333333',
      padding: { x: 15, y: 8 }
    })
    .setOrigin(0.5)
    .setInteractive();

    restartButton.on('pointerdown', () => {
      this.scene.start('GameScene', { level: 1 });
    });
  }
}
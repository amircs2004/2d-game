import Phaser from 'phaser';
import { createCharacterAnimations } from './utils/animationHelper';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    // LOAD ALL ASSETS SO PHASER DOES NOT CRASH
    this.load.spritesheet('player_idle', '/images/assets/Fighter/Idle.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_walk', '/images/assets/Fighter/Walk.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_run', '/images/assets/Fighter/Run.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_jump', '/images/assets/Fighter/Jump.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_attack1', '/images/assets/Fighter/Attack_1.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_attack2', '/images/assets/Fighter/Attack_2.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_attack3', '/images/assets/Fighter/Attack_3.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_shield', '/images/assets/Fighter/Shield.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_hurt', '/images/assets/Fighter/Hurt.png', { frameWidth: 128, frameHeight: 128 });
    this.load.spritesheet('player_dead', '/images/assets/Fighter/Dead.png', { frameWidth: 128, frameHeight: 128 });
  }

  create() {
    // Generate all animations safely now that everything is loaded
    createCharacterAnimations(this.anims);

    // Spawn player
    this.player = this.add.sprite(400, 300, 'player_idle');
    this.player.setScale(1.5);
    this.player.play('player-idle');

    // Define Custom Keys: Z, S, A, E, Space, T
    this.keyZ = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z);
    this.keyS = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S);
    this.keyA = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A);
    this.keyE = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E);
    this.keySpace = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);
    this.keyT = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T);

    this.isAttacking = false;
    this.attackComboStep = 1;

    // T Key: Attack Combo (1 -> 2 -> 3)
    this.keyT.on('down', () => {
      if (!this.isAttacking) {
        this.isAttacking = true;
        let currentAttackKey = `player-attack${this.attackComboStep}`;
        this.player.play(currentAttackKey, true);

        this.player.once(`animationcomplete-${currentAttackKey}`, () => {
          this.isAttacking = false;
          this.attackComboStep = this.attackComboStep >= 3 ? 1 : this.attackComboStep + 1;
        });
      }
    });

    // Space Key: Jump
    this.keySpace.on('down', () => {
      if (!this.isAttacking) {
        this.player.play('player-jump', true);
        this.player.once('animationcomplete-player-jump', () => {
          this.player.play('player-idle', true);
        });
      }
    });
  }

  update() {
    if (this.isAttacking) return;

    let isMoving = false;

    // Left (A) and Right (E)
    if (this.keyA.isDown) {
      this.player.x -= 3;
      this.player.setFlipX(true);
      isMoving = true;
    } else if (this.keyE.isDown) {
      this.player.x += 3;
      this.player.setFlipX(false);
      isMoving = true;
    }

    // Up (Z) and Down (S)
    if (this.keyZ.isDown) {
      this.player.y -= 3;
      isMoving = true;
    } else if (this.keyS.isDown) {
      this.player.y += 3;
      isMoving = true;
    }

    const currentAnim = this.player.anims.currentAnim?.key;

    if (isMoving) {
      if (currentAnim !== 'player-run' && currentAnim !== 'player-jump') {
        this.player.play('player-run', true);
      }
    } else {
      if (currentAnim === 'player-run') {
        this.player.play('player-idle', true);
      }
    }
  }
 
} 
const config = {
  type: Phaser.AUTO,
  width: 800,
  height: 600,
  backgroundColor: '#fffefe', // Dark background so you can see if the canvas loaded
  scene: [GameScene]
};

// This line is what actually boots up Phaser and renders everything!
const game = new Phaser.Game(config);
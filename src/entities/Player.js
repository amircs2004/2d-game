import Phaser from 'phaser';
import { CONFIG } from '../config/gameConfig';

export default class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'player_idle');
    
    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(1.5).setCollideWorldBounds(true);
    this.body.setSize(40, 80).setOffset(44, 44);
    this.body.setAllowGravity(false);
    // Stats & Flags
    this.health = 100;
    this.maxHealth = 100;
    this.isDead = false;
    this.isHurt = false;
    this.isAttacking = false;
    this.isDashing = false;
    this.isInvincible = false;
    this.attackComboStep = 1;

    // Touch & Keyboard inputs state reference
    this.touchLeft = false;
    this.touchRight = false;
    this.touchUp = false;
    this.touchDown = false;

    // Animation Complete Listener
    this.on('animationcomplete', (animation) => {
      if (animation.key.startsWith('player-attack')) {
        this.isAttacking = false;
        this.attackComboStep = this.attackComboStep >= 3 ? 1 : this.attackComboStep + 1;
        this.play('player-idle', true);
      } else if (animation.key === 'player-hurt') {
        this.isHurt = false;
        this.play('player-idle', true);
      } else if (animation.key === 'player-jump') {
        this.play('player-idle', true);
      }
    });
  }

  handleInput(cursors, keys) {
    if (this.isDead || this.isDashing || this.isAttacking || this.isHurt) return;

    let vx = 0;
    let vy = 0;
    let isMoving = false;

    if (keys.keyA.isDown || this.touchLeft) {
      vx = -CONFIG.PLAYER_SPEED;
      this.setFlipX(true);
      isMoving = true;
    } else if (keys.keyE.isDown || this.touchRight) {
      vx = CONFIG.PLAYER_SPEED;
      this.setFlipX(false);
      isMoving = true;
    }

    if (keys.keyZ.isDown || this.touchUp) {
      vy = -CONFIG.PLAYER_SPEED;
      isMoving = true;
    } else if (keys.keyS.isDown || this.touchDown) {
      vy = CONFIG.PLAYER_SPEED;
      isMoving = true;
    }

    this.setVelocity(vx, vy);

    const currentAnim = this.anims.currentAnim?.key;
    if (isMoving) {
      if (currentAnim !== 'player-run' && currentAnim !== 'player-jump') {
        this.play('player-run', true);
      }
    } else {
      if (currentAnim === 'player-run' || currentAnim === 'player-hurt' || currentAnim?.startsWith('player-attack')) {
        this.play('player-idle', true);
      }
    }

    return isMoving && vx !== 0 ? Math.sign(vx) : 0;
  }

  triggerAttack() {
    if (this.isDead || this.isAttacking || this.isHurt || this.isDashing) return;
    this.isAttacking = true;
    this.setVelocityX(0);
    this.play(`player-attack${this.attackComboStep}`, true);
  }

  triggerDash() {
    if (this.isDead || this.isDashing || this.isAttacking || this.isHurt) return;
    this.isDashing = true;
    this.isInvincible = true;
    const direction = this.flipX ? -1 : 1;
    this.setTint(0x00ffff);
    this.setVelocityX(direction * CONFIG.PLAYER_DASH_SPEED);

    this.scene.time.delayedCall(200, () => {
      this.setVelocityX(0);
      this.clearTint();
      this.isDashing = false;
      this.scene.time.delayedCall(150, () => this.isInvincible = false);
    });
  }

  triggerJump() {
    if (this.isDead || this.isAttacking || this.isHurt || this.isDashing) return;
    this.play('player-jump', true);
  }
 hurt(amount) {
    if (this.isDead || this.isInvincible) return false;
    this.health = Math.max(0, this.health - amount);
    
    if (this.health <= 0) {
      this.isDead = true;
      this.setVelocity(0, 0);
      this.play('player-dead', true);
      return true; // signals death
    }

    this.isHurt = true;
    this.isAttacking = false; // Cancel ongoing attacks to react to hit
    this.isInvincible = true;  // Give temporary i-frames so you aren't stunlock-killed instantly
    this.play('player-hurt', true);

    // Flash red and clear hurt/invincibility status after a brief moment
    this.setTint(0xff0000);
    this.scene.time.delayedCall(300, () => {
      this.clearTint();
      this.isHurt = false;
    });
    this.scene.time.delayedCall(600, () => {
      this.isInvincible = false;
    });

    return false;
  }
}
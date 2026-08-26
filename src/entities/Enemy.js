import Phaser from 'phaser';
import { CONFIG } from '../config/gameConfig';

export default class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, score) {
    super(scene, x, y, 'enemy_idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(1.5).setTint(0xff5555).setCollideWorldBounds(true);
    this.body.setSize(40, 80).setOffset(44, 44);

    this.health = 100 + (score * 5);
    this.maxHealth = this.health;
    this.isDead = false;
    this.isHurt = false;
    this.isAttacking = false;
    this.canAttack = true;
    this.attackComboStep = 1;

    this.on('animationcomplete', (animation) => {
      if (animation.key.startsWith('enemy-attack')) {
        this.isAttacking = false;
        this.attackComboStep = this.attackComboStep >= 3 ? 1 : this.attackComboStep + 1;
        this.play('enemy-idle', true);
      } else if (animation.key === 'enemy-hurt') {
        this.isHurt = false;
        this.play('enemy-idle', true);
      }
    });
  }

  updateAI(player, scene, onAttackCallback) {
    if (this.isDead || this.isHurt || this.isAttacking) return;

    const distance = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
    const enemyAnim = this.anims.currentAnim?.key;

    this.setFlipX(this.x >= player.x);

    if (distance < 75) {
      this.setVelocity(0, 0);
      if (this.canAttack) {
        this.isAttacking = true;
        this.canAttack = false;
        this.play(`enemy-attack${this.attackComboStep}`, true);
        
        if (onAttackCallback) onAttackCallback();

        scene.time.delayedCall(1300, () => this.canAttack = true);
      } else if (enemyAnim !== 'enemy-idle' && !enemyAnim?.startsWith('enemy-attack')) {
        this.play('enemy-idle', true);
      }
    } else if (distance < 350) {
      scene.physics.moveToObject(this, player, CONFIG.ENEMY_SPEED);
      if (enemyAnim !== 'enemy-run') {
        this.play('enemy-run', true);
      }
    } else {
      this.setVelocity(0, 0);
      if (enemyAnim !== 'enemy-idle') {
        this.play('enemy-idle', true);
      }
    }
  }

  hurt(damage, playerX) {
    if (this.isDead) return false;
    this.health = Math.max(0, this.health - damage);

    if (this.health <= 0) {
      this.isDead = true;
      this.setVelocity(0, 0);
      this.play('enemy-dead', true);
      return true; // Is dead
    }

    this.isHurt = true;
    this.isAttacking = false;
    this.play('enemy-hurt', true);
    this.x += (this.x < playerX) ? -20 : 20;
    return false;
  }
}
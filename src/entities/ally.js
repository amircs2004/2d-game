import Phaser from 'phaser';
import { CONFIG } from '../config/gameConfig';

export default class Ally extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y) {
    super(scene, x, y, 'samurai_idle');

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setScale(1.5).setCollideWorldBounds(true);
    this.body.setSize(40, 80).setOffset(44, 44);
    this.body.setAllowGravity(false);

    this.health = 150;
    this.maxHealth = 150;
    this.damage = 80; // Increased base attack damage
    this.isDead = false;
    this.isHurt = false;
    this.isAttacking = false;
    this.canAttack = true;
    this.attackComboStep = 1;

    this.on('animationcomplete', (animation) => {
      if (animation.key.startsWith('samurai-attack')) {
        this.isAttacking = false;
        this.attackComboStep = this.attackComboStep >= 3 ? 1 : this.attackComboStep + 1;
        this.play('samurai-idle', true);
      } else if (animation.key === 'samurai-hurt') {
        this.isHurt = false;
        this.play('samurai-idle', true);
      }
    });
  }

  updateAI(player, enemies, scene) {
    if (this.isDead || this.isHurt || this.isAttacking) return;

    let closestEnemy = null;
    let minDistance = Infinity;

    enemies.getChildren().forEach(enemy => {
      if (enemy.isDead) return;
      const dist = Phaser.Math.Distance.Between(this.x, this.y, enemy.x, enemy.y);
      if (dist < minDistance) {
        minDistance = dist;
        closestEnemy = enemy;
      }
    });

    const currentAnim = this.anims.currentAnim?.key;

    if (closestEnemy && minDistance < 350) {
      this.setFlipX(this.x >= closestEnemy.x);

      if (minDistance < 70) {
        this.setVelocity(0, 0);
        if (this.canAttack) {
          this.isAttacking = true;
          this.canAttack = false;
          this.play(`samurai-attack${this.attackComboStep}`, true);

          // Apply the increased damage property
          const isDead = closestEnemy.hurt(this.damage, this.x);
          scene.spawnFloatingText(closestEnemy.x, closestEnemy.y, `-${this.damage}`, '#ff3333');

          if (isDead) {
            scene.spawnBlueCrystal(closestEnemy.x, closestEnemy.y);
            scene.score += 1;
            scene.scoreText.setText(`KILLS: ${scene.score}`);
            scene.updateStyleRank(25);
            scene.time.delayedCall(1500, () => closestEnemy.destroy());
          }

          scene.time.delayedCall(900, () => this.canAttack = true);
        } else if (currentAnim !== 'samurai-idle') {
          this.play('samurai-idle', true);
        }
      } else {
        scene.physics.moveToObject(this, closestEnemy, CONFIG.ENEMY_SPEED * 1.1);
        if (currentAnim !== 'samurai-run') {
          this.play('samurai-run', true);
        }
      }
    } else {
      const distToPlayer = Phaser.Math.Distance.Between(this.x, this.y, player.x, player.y);
      if (distToPlayer > 100) {
        this.setFlipX(this.x >= player.x);
        scene.physics.moveToObject(this, player, CONFIG.PLAYER_SPEED * 0.9);
        if (currentAnim !== 'samurai-run') {
          this.play('samurai-run', true);
        }
      } else {
        this.setVelocity(0, 0);
        if (currentAnim !== 'samurai-idle') {
          this.play('samurai-idle', true);
        }
      }
    }
  }

  hurt(amount) {
    if (this.isDead) return false;
    this.health = Math.max(0, this.health - amount);
    if (this.health <= 0) {
      this.isDead = true;
      this.setVelocity(0, 0);
      this.play('samurai-dead', true);
      return true;
    }
    this.isHurt = true;
    this.isAttacking = false;
    this.play('samurai-hurt', true);
    return false;
  }
}
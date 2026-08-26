import Phaser from 'phaser';
import { CONFIG } from '../config/gameConfig';
import { createCharacterAnimations } from '../utils/animationHelper';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }

  preload() {
    const assets = ['idle', 'walk', 'run', 'jump', 'attack1', 'attack2', 'attack3', 'shield', 'hurt', 'dead'];
    assets.forEach(asset => {
      const fileName = asset === 'attack1' ? 'Attack_1' : asset === 'attack2' ? 'Attack_2' : asset === 'attack3' ? 'Attack_3' : asset.charAt(0).toUpperCase() + asset.slice(1);
      this.load.spritesheet(`player_${asset}`, `/images/assets/Fighter/${fileName}.png`, { frameWidth: 128, frameHeight: 128 });
      this.load.spritesheet(`enemy_${asset}`, `/images/assets/Shinobi/${fileName}.png`, { frameWidth: 128, frameHeight: 128 });
    });

    for (let i = 1; i <= 4; i++) {
      this.load.image(`layer${i}`, `/images/assets/background/craftpix-net-139108-free-1-bit-graveyard-pixel-art-backgrounds/background%202/${i}.png`);
    }
  }

   create() {
    createCharacterAnimations(this.anims);
    
    // Parallax Backgrounds (Pinned to camera view)
    const screenW = this.scale.width;
    const screenH = this.scale.height;

    this.bgLayer1 = this.add.tileSprite(0, 0, screenW, screenH, 'layer1').setOrigin(0, 0).setScrollFactor(0);
    this.bgLayer2 = this.add.tileSprite(0, 0, screenW, screenH, 'layer2').setOrigin(0, 0).setScrollFactor(0);
    this.bgLayer3 = this.add.tileSprite(0, 0, screenW, screenH, 'layer3').setOrigin(0, 0).setScrollFactor(0);
    this.bgLayer4 = this.add.tileSprite(0, 0, screenW, screenH, 'layer4').setOrigin(0, 0).setScrollFactor(0);

    // 1. Expand Physics & Camera World Bounds
    this.physics.world.setBounds(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);

    // Instantiate Player
    this.player = new Player(this, 300, 450);
    
    // 2. Camera Follow
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);

    // Groups & Colliders
    this.enemies = this.physics.add.group();
    this.crystals = this.physics.add.group();
    this.physics.add.overlap(this.player, this.crystals, this.collectCrystal, null, this);
    this.physics.add.collider(this.player, this.enemies);

    this.score = 0;
    this.spawnTimer = CONFIG.BASE_SPAWN_INTERVAL;
    this.bloodPoints = 0;
    this.maxBloodPoints = 100;
    this.stylePoints = 0;
    this.styleRank = 'D';
    this.styleMultiplier = 1;

    this.spawnEnemy();
    this.waveEvent = this.time.addEvent({
      delay: this.spawnTimer,
      callback: () => {
        this.spawnEnemy();
        this.updateWaveDifficulty();
      },
      loop: true
    });

    // 3. UI elements pinned to screen (setScrollFactor & setDepth)
    this.healthBarBg = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.healthBar = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.bloodBarBg = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.bloodBar = this.add.graphics().setScrollFactor(0).setDepth(100);

    this.scoreText = this.add.text(570, 20, 'KILLS: 0', { font: '16px monospace', fill: '#ff5500', backgroundColor: '#111111', padding: { x: 6, y: 4 } }).setScrollFactor(0).setDepth(100);
    this.rankText = this.add.text(570, 52, 'STYLE: D (1.0x)', { font: '14px monospace', fill: '#00ffcc', backgroundColor: '#111111', padding: { x: 6, y: 4 } }).setScrollFactor(0).setDepth(100);
    
    this.updatePlayerUI();

    // Input Bindings
    this.keys = {
      keyZ: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      keyS: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      keyA: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      keyE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    };

    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T).on('down', () => this.triggerPlayerAttack());
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R).on('down', () => this.triggerBloodRage());
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SHIFT).on('down', () => this.player.triggerDash());
    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE).on('down', () => this.player.triggerJump());

    this.createTouchControls();
  }

  updateWaveDifficulty() {
    this.spawnTimer = Math.max(1200, CONFIG.BASE_SPAWN_INTERVAL - (this.score * 75));
    this.waveEvent.delay = this.spawnTimer;
  }

  spawnEnemy() {
    if (this.player.isDead) return;
    if (this.enemies.countActive(true) >= CONFIG.BASE_MAX_ENEMIES + Math.floor(this.score / 6)) return;

    const spawnX = Math.random() > 0.5 ? 850 : -50;
    const enemy = new Enemy(this, spawnX, 450, this.score);
    this.enemies.add(enemy);
  }

  createTouchControls() {
    const createButton = (x, y, w, h, label, cb) => {
      const btn = this.add.rectangle(x, y, w, h, 0xffffff, 0.15).setInteractive().setScrollFactor(0).setDepth(100);
      this.add.text(x, y, label, { font: '16px monospace', fill: '#ffffff' }).setOrigin(0.5).setDepth(100);
      btn.on('pointerdown', () => { btn.setFillStyle(0xffffff, 0.4); cb(true); });
      btn.on('pointerup', () => { btn.setFillStyle(0xffffff, 0.15); cb(false); });
      btn.on('pointerout', () => { btn.setFillStyle(0xffffff, 0.15); cb(false); });
    };

    createButton(70, 500, 50, 50, 'A', d => this.player.touchLeft = d);
    createButton(190, 500, 50, 50, 'E', d => this.player.touchRight = d);
    createButton(130, 440, 50, 50, 'Z', d => this.player.touchUp = d);
    createButton(130, 560, 50, 50, 'S', d => this.player.touchDown = d);

    createButton(730, 530, 55, 55, 'ATK', () => this.triggerPlayerAttack());
    createButton(660, 530, 50, 50, 'JMP', () => this.player.triggerJump());
    createButton(730, 460, 50, 50, 'DSH', () => this.player.triggerDash());
    createButton(660, 460, 50, 50, 'RGE', () => this.triggerBloodRage());
  }

  triggerHitStop(duration = 50) {
    this.physics.world.timeScale = 0.05;
    this.time.delayedCall(duration, () => { this.physics.world.timeScale = 1.0; });
  }

  spawnFloatingText(x, y, text, color = '#ffcc00') {
    const floatText = this.add.text(x, y - 30, text, { font: 'bold 16px monospace', fill: color, stroke: '#000000', strokeThickness: 3 }).setOrigin(0.5).setDepth(150);
    this.tweens.add({ targets: floatText, y: y - 80, alpha: 0, scale: 1.2, duration: 600, onComplete: () => floatText.destroy() });
  }

  updateStyleRank(pointsGained) {
    this.stylePoints = Math.min(300, this.stylePoints + pointsGained);
    if (this.stylePoints >= 250) { this.styleRank = 'SSS'; this.styleMultiplier = 2.5; }
    else if (this.stylePoints >= 180) { this.styleRank = 'SS'; this.styleMultiplier = 2.0; }
    else if (this.stylePoints >= 120) { this.styleRank = 'S'; this.styleMultiplier = 1.7; }
    else if (this.stylePoints >= 70) { this.styleRank = 'A'; this.styleMultiplier = 1.4; }
    else if (this.stylePoints >= 30) { this.styleRank = 'B'; this.styleMultiplier = 1.2; }
    else { this.styleRank = 'D'; this.styleMultiplier = 1.0; }
    this.rankText.setText(`STYLE: ${this.styleRank} (${this.styleMultiplier}x)`);
  }

  spawnBlueCrystal(x, y) {
    const crystal = this.physics.add.sprite(x, y, 'blue_crystal').setScale(1.4);
    crystal.body.setAllowGravity(false);
    this.crystals.add(crystal);
    this.tweens.add({ targets: crystal, y: y - 16, duration: 700, yoyo: true, repeat: -1, ease: 'Sine.easeInOut' });
  }

  collectCrystal(player, crystal) {
    this.bloodPoints = Math.min(this.maxBloodPoints, this.bloodPoints + 25);
    this.updateBloodBar();
    this.spawnFloatingText(crystal.x, crystal.y, '+25 BLOOD!', '#00ffff');
    crystal.destroy();
  }

  triggerPlayerAttack() {
    if (this.player.isDead || this.player.isAttacking || this.player.isHurt || this.player.isDashing) return;

    this.player.triggerAttack();
    const facingRight = !this.player.flipX;

    this.enemies.getChildren().forEach(enemy => {
      if (enemy.isDead) return;
      const xDist = enemy.x - this.player.x;
      const yDist = Math.abs(enemy.y - this.player.y);
      const hitInFront = facingRight ? (xDist > 0 && xDist < CONFIG.ATTACK_RANGE_X) : (xDist < 0 && xDist > -CONFIG.ATTACK_RANGE_X);

      if (hitInFront && yDist < CONFIG.ATTACK_RANGE_Y) {
        const damage = Math.round(25 * this.styleMultiplier);
        this.handleEnemyHit(enemy, damage);
      }
    });
  }

  triggerBloodRage() {
    if (this.player.isDead || this.player.isAttacking || this.player.isHurt || this.player.isDashing) return;
    if (this.bloodPoints >= this.maxBloodPoints) {
      this.bloodPoints = 0;
      this.updateBloodBar();
      this.player.isAttacking = true;
      this.player.setVelocityX(0);
      this.player.setTint(0xff0055);
      this.player.play('player-attack3', true);
      this.cameras.main.flash(250, 180, 0, 40);
      this.triggerHitStop(80);

      this.enemies.getChildren().forEach(enemy => {
        if (!enemy.isDead && Phaser.Math.Distance.Between(this.player.x, this.player.y, enemy.x, enemy.y) < CONFIG.BLOOD_RAGE_RANGE) {
          this.handleEnemyHit(enemy, Math.round(50 * this.styleMultiplier));
        }
      });
      this.time.delayedCall(400, () => this.player.clearTint());
    }
  }

  handleEnemyHit(enemy, damage) {
    const isDead = enemy.hurt(damage, this.player.x);
    this.triggerHitStop(40);
    this.updateStyleRank(15);
    this.bloodPoints = Math.min(this.maxBloodPoints, this.bloodPoints + Math.round(10 * this.styleMultiplier));
    this.updateBloodBar();
    this.spawnFloatingText(enemy.x, enemy.y, `-${damage}`, '#ffcc00');

    if (isDead) {
      this.spawnBlueCrystal(enemy.x, enemy.y);
      this.score += 1;
      this.scoreText.setText(`KILLS: ${this.score}`);
      this.updateStyleRank(35);
      this.time.delayedCall(1500, () => enemy.destroy());
    }
  }

  updateHealthBar() {
    this.healthBarBg.clear().fillStyle(0x333333).fillRect(30, 20, 200, 16);
    this.healthBar.clear().fillStyle(0xcc0000);
    const w = (this.player.health / this.player.maxHealth) * 200;
    if (w > 0) this.healthBar.fillRect(30, 20, w, 16);
  }

  updateBloodBar() {
    this.bloodBarBg.clear().fillStyle(0x221122).fillRect(30, 42, 200, 10);
    this.bloodBar.clear().fillStyle(this.bloodPoints >= this.maxBloodPoints ? 0xff00aa : 0x00aacc);
    const w = (this.bloodPoints / this.maxBloodPoints) * 200;
    if (w > 0) this.bloodBar.fillRect(30, 42, w, 10);
  }

  updatePlayerUI() {
    this.updateHealthBar();
    this.updateBloodBar();
  }
 update(time, delta) {
    if (this.player.isDead) return;

    if (this.stylePoints > 0) {
      this.stylePoints = Math.max(0, this.stylePoints - (delta * 0.005));
      this.updateStyleRank(0);
    }

    // Process player input/movement
    this.player.handleInput(null, this.keys);

    // Parallax background scrolling tied smoothly to camera movement
    const scrollX = this.cameras.main.scrollX;
    this.bgLayer1.tilePositionX = scrollX * 0.1;
    this.bgLayer2.tilePositionX = scrollX * 0.3;
    this.bgLayer3.tilePositionX = scrollX * 0.6;
    this.bgLayer4.tilePositionX = scrollX * 1.0;

    // Update Enemies
    this.enemies.getChildren().forEach(enemy => {
      enemy.updateAI(this.player, this, () => {
        const isDead = this.player.hurt(10);
        this.updateHealthBar();
        this.stylePoints = 0;
        this.updateStyleRank(0);
        if (isDead) {
          this.time.delayedCall(2000, () => this.scene.restart());
        }
      });
    });
  }
}
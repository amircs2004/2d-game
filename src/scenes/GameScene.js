import Phaser from 'phaser';
import { CONFIG } from '../config/gameConfig';
import { createCharacterAnimations } from '../utils/animationHelper';
import Player from '../entities/Player';
import Enemy from '../entities/Enemy';
import Ally from '../entities/ally';

export default class GameScene extends Phaser.Scene {
  constructor() {
    super('GameScene');
  }
  
  preload() {
    const assets = ['idle', 'walk', 'run', 'jump', 'attack1', 'attack2', 'attack3', 'shield', 'hurt', 'dead'];
    
    // Load Player & Enemy assets
    assets.forEach(asset => {
      const fileName = asset === 'attack1' ? 'Attack_1' : asset === 'attack2' ? 'Attack_2' : asset === 'attack3' ? 'Attack_3' : asset.charAt(0).toUpperCase() + asset.slice(1);
      this.load.spritesheet(`player_${asset}`, `/images/assets/Fighter/${fileName}.png`, { frameWidth: 128, frameHeight: 128 });
      this.load.spritesheet(`enemy_${asset}`, `/images/assets/Shinobi/${fileName}.png`, { frameWidth: 128, frameHeight: 128 });
    });

    // Load Samurai Ally assets
    assets.forEach(asset => {
      const fileName = asset === 'attack1' ? 'Attack_1' : asset === 'attack2' ? 'Attack_2' : asset === 'attack3' ? 'Attack_3' : asset.charAt(0).toUpperCase() + asset.slice(1);
      this.load.spritesheet(`samurai_${asset}`, `/images/assets/Samurai/${fileName}.png`, { frameWidth: 128, frameHeight: 128 });
    });

    for (let i = 1; i <= 4; i++) {
      this.load.image(`layer${i}`, `/images/assets/background/craftpix-net-139108-free-1-bit-graveyard-pixel-art-backgrounds/background%202/${i}.png`);
    }
    this.load.svg('door', '/images/assets/door/door_spritesheet.svg');
  }

  create() {
    // Slicing up the chunk of images frame by frame 
    const doorTex = this.textures.get('door');
    if (doorTex && !doorTex.has(1)) {
      doorTex.add(0, 0, 0, 0, 32, 32);
      doorTex.add(1, 0, 32, 0, 32, 32);
    }
    
    createCharacterAnimations(this.anims);
    
    const screenW = this.scale.width;
    const screenH = this.scale.height;

    const createBgLayer = (key) => {
      const texture = this.textures.get(key).getSourceImage();
      const scale = screenH / texture.height;
      const tile = this.add.tileSprite(0, 0, screenW / scale, texture.height, key)
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setScale(scale);
      return tile;
    };

    this.bgLayer1 = createBgLayer('layer1');
    this.bgLayer2 = createBgLayer('layer2');
    this.bgLayer3 = createBgLayer('layer3');
    this.bgLayer4 = createBgLayer('layer4');

    // Physics & World Bounds
    this.physics.world.setBounds(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);

    // Instantiate Player and Ally
    this.player = new Player(this, 300, 450);
    this.ally = new Ally(this, 200, 450);
    
    // Camera Follow & Bounds
    this.cameras.main.startFollow(this.player, true, 0.08, 0.08);
    this.cameras.main.setBounds(0, 0, CONFIG.WORLD_WIDTH, CONFIG.WORLD_HEIGHT);

    // Fence Barrier Configuration
    const fenceY = 280; 
    this.fenceBarrier = this.add.rectangle(CONFIG.WORLD_WIDTH / 2, fenceY, CONFIG.WORLD_WIDTH, 10, 0x00ff00, 0);
    this.physics.add.existing(this.fenceBarrier, true);

    // Groups & Colliders
    this.enemies = this.physics.add.group();
    this.crystals = this.physics.add.group();
    
    this.physics.add.overlap(this.player, this.crystals, this.collectCrystal, null, this);
    this.physics.add.collider(this.player, this.enemies);
    this.physics.add.collider(this.ally, this.enemies);
    this.physics.add.collider(this.player, this.ally);
    
    // Fence Colliders
    this.physics.add.collider(this.player, this.fenceBarrier);
    this.physics.add.collider(this.enemies, this.fenceBarrier);
    this.physics.add.collider(this.ally, this.fenceBarrier);

    this.score = 0;
    this.spawnTimer = CONFIG.BASE_SPAWN_INTERVAL;
    this.stylePoints = 0;
    this.styleRank = 'D';
    this.styleMultiplier = 1;
    this.doorSpawned = false;
    this.isVictoryHandled = false;

    this.spawnEnemy();
    this.waveEvent = this.time.addEvent({
      delay: this.spawnTimer,
      callback: () => {
        this.spawnEnemy();
        this.updateWaveDifficulty();
      },
      loop: true
    });

    // UI elements pinned to screen
    this.healthBarBg = this.add.graphics().setScrollFactor(0).setDepth(100);
    this.healthBar = this.add.graphics().setScrollFactor(0).setDepth(100);

    this.scoreText = this.add.text(570, 20, 'KILLS: 0', { font: '16px monospace', fill: '#ff5500', backgroundColor: '#111111', padding: { x: 6, y: 4 } }).setScrollFactor(0).setDepth(100);
    this.rankText = this.add.text(570, 52, 'STYLE: D (1.0x)', { font: '14px monospace', fill: '#00ffcc', backgroundColor: '#111111', padding: { x: 6, y: 4 } }).setScrollFactor(0).setDepth(100);
    
    this.updateHealthBar();

    // Input Bindings
    this.keys = {
      keyZ: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Z),
      keyS: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
      keyA: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
      keyE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
    };

    this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.T).on('down', () => this.triggerPlayerAttack());
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
    this.player.health = Math.min(this.player.maxHealth, this.player.health + 25);
    this.updateHealthBar();
    this.spawnFloatingText(crystal.x, crystal.y, '+25 HP!', '#ff3333');
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

  handleEnemyHit(enemy, damage) {
    const isDead = enemy.hurt(damage, this.player.x);
    this.triggerHitStop(40);
    this.updateStyleRank(15);
    this.spawnFloatingText(enemy.x, enemy.y, `-${damage}`, '#ffcc00');

    if (isDead) {
      this.handleEnemyDeath(enemy);
    }
  }

  handleEnemyDeath(enemy) {
    if (enemy.isScoreCounted) return;
    enemy.isScoreCounted = true;

    this.spawnBlueCrystal(enemy.x, enemy.y);
    this.score += 1;
    this.scoreText.setText(`KILLS: ${this.score}`);
    
    this.updateStyleRank(35);

    // Check kill threshold for victory door (3 kills for both player and ally kills)
    if (this.score >= 3 && !this.doorSpawned) {
      this.doorSpawned = true;
      this.spawnVictoryDoor();
    }

    this.time.delayedCall(1500, () => enemy.destroy());
  }

  spawnVictoryDoor() {
    const doorX = this.player.x + 400; 
    const doorY = 450; 

    this.victoryDoor = this.physics.add.sprite(doorX, doorY, 'door');
    this.victoryDoor.setScale(5.0);
    this.victoryDoor.play('door_closed');
    
    if (this.victoryDoor.body) {
      this.victoryDoor.body.setAllowGravity(false);
    }
    
    this.tweens.add({
      targets: this.victoryDoor,
      scaleX: 5.3,
      scaleY: 5.3,
      duration: 800,
      yoyo: true,
      repeat: -1,
      ease: 'Sine.easeInOut'
    });
    
    this.spawnFloatingText(this.victoryDoor.x, this.victoryDoor.y - 60, 'PORTAL OPEN!', '#00ffcc');

    this.physics.add.overlap(this.player, this.victoryDoor, () => {
      this.handleVictory();
    });
  }

  handleVictory() {
    if (this.isVictoryHandled) return;
    this.isVictoryHandled = true;

    if (this.victoryDoor) {
      this.victoryDoor.play('door_open');
    }

    this.spawnFloatingText(this.player.x, this.player.y - 40, 'LEVEL CLEARED!', '#00ffcc');
    this.physics.world.timeScale = 0.5;

    this.time.delayedCall(1500, () => {
      this.physics.world.timeScale = 1.0;
      this.scene.restart();
    });
  }

  updateHealthBar() {
    this.healthBarBg.clear().fillStyle(0x333333).fillRect(30, 20, 200, 16);
    this.healthBar.clear().fillStyle(0xcc0000);
    const w = (this.player.health / this.player.maxHealth) * 200;
    if (w > 0) this.healthBar.fillRect(30, 20, w, 16);
  }

  update(time, delta) {
    if (this.player.isDead) return;

    if (this.stylePoints > 0) {
      this.stylePoints = Math.max(0, this.stylePoints - (delta * 0.005));
      this.updateStyleRank(0);
    }

    this.player.handleInput(null, this.keys);
    this.ally.updateAI(this.player, this.enemies, this);

    // Parallax scrolling
    const px = this.player.x;
    this.bgLayer1.tilePositionX = px * 0.1;
    this.bgLayer2.tilePositionX = px * 0.3;
    this.bgLayer3.tilePositionX = px * 0.6;
    this.bgLayer4.tilePositionX = px * 1.0;

    // Monitor enemy deaths from any source (including ally kills)
    this.enemies.getChildren().forEach(enemy => {
      if (enemy.isDead && !enemy.isScoreCounted) {
        this.handleEnemyDeath(enemy);
      }

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
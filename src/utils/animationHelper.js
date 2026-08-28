export function createCharacterAnimations(anims) {
  // --- PLAYER ANIMATIONS ---
  anims.create({
    key: 'player-idle',
    frames: anims.generateFrameNumbers('player_idle', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  anims.create({
    key: 'player-walk',
    frames: anims.generateFrameNumbers('player_walk', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  anims.create({
    key: 'player-run',
    frames: anims.generateFrameNumbers('player_run', { start: 0, end: 7 }),
    frameRate: 12,
    repeat: -1
  });

  anims.create({
    key: 'player-jump',
    frames: anims.generateFrameNumbers('player_jump', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: 0
  });

  anims.create({
    key: 'player-attack1',
    frames: anims.generateFrameNumbers('player_attack1', { start: 0, end: 5 }),
    frameRate: 14,
    repeat: 0
  });

  anims.create({
    key: 'player-attack2',
    frames: anims.generateFrameNumbers('player_attack2', { start: 0, end: 5 }),
    frameRate: 14,
    repeat: 0
  });

  anims.create({
    key: 'player-attack3',
    frames: anims.generateFrameNumbers('player_attack3', { start: 0, end: 5 }),
    frameRate: 14,
    repeat: 0
  });

  anims.create({
    key: 'player-shield',
    frames: anims.generateFrameNumbers('player_shield', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  anims.create({
    key: 'player-hurt',
    frames: anims.generateFrameNumbers('player_hurt', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0
  });

  anims.create({
    key: 'player-dead',
    frames: anims.generateFrameNumbers('player_dead', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0
  });

  // --- ENEMY ANIMATIONS ---
  anims.create({
    key: 'enemy-idle',
    frames: anims.generateFrameNumbers('enemy_idle', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  anims.create({
    key: 'enemy-walk',
    frames: anims.generateFrameNumbers('enemy_walk', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  anims.create({
    key: 'enemy-run',
    frames: anims.generateFrameNumbers('enemy_run', { start: 0, end: 7 }),
    frameRate: 12,
    repeat: -1
  });

  anims.create({
    key: 'enemy-jump',
    frames: anims.generateFrameNumbers('enemy_jump', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: 0
  });

  anims.create({
    key: 'enemy-attack1',
    frames: anims.generateFrameNumbers('enemy_attack1', { start: 0, end: 3 }),
    frameRate: 14,
    repeat: 0
  });

  anims.create({
    key: 'enemy-attack2',
    frames: anims.generateFrameNumbers('enemy_attack2', { start: 0, end: 3 }),
    frameRate: 14,
    repeat: 0
  });

  anims.create({
    key: 'enemy-attack3',
    frames: anims.generateFrameNumbers('enemy_attack3', { start: 0, end: 3 }),
    frameRate: 14,
    repeat: 0
  });

  anims.create({
    key: 'enemy-shield',
    frames: anims.generateFrameNumbers('enemy_shield', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  anims.create({
    key: 'enemy-hurt',
    frames: anims.generateFrameNumbers('enemy_hurt', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0
  });

  anims.create({
    key: 'enemy-dead',
    frames: anims.generateFrameNumbers('enemy_dead', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0
  });

  // --- SAMURAI ALLY ANIMATIONS ---
  anims.create({
    key: 'samurai-idle',
    frames: anims.generateFrameNumbers('samurai_idle', { start: 0, end: 3 }),
    frameRate: 8,
    repeat: -1
  });

  anims.create({
    key: 'samurai-run',
    frames: anims.generateFrameNumbers('samurai_run', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  anims.create({
    key: 'samurai-attack1',
    frames: anims.generateFrameNumbers('samurai_attack1', { start: 0, end: 5 }),
    frameRate: 12,
    repeat: 0
  });

  anims.create({
    key: 'samurai-attack2',
    frames: anims.generateFrameNumbers('samurai_attack2', { start: 0, end: 5 }),
    frameRate: 12,
    repeat: 0
  });

  anims.create({
    key: 'samurai-attack3',
    frames: anims.generateFrameNumbers('samurai_attack3', { start: 0, end: 5 }),
    frameRate: 12,
    repeat: 0
  });

  anims.create({
    key: 'samurai-hurt',
    frames: anims.generateFrameNumbers('samurai_hurt', { start: 0, end: 1 }),
    frameRate: 8,
    repeat: 0
  });

  anims.create({
    key: 'samurai-dead',
    frames: anims.generateFrameNumbers('samurai_dead', { start: 0, end: 3 }),
    frameRate: 8,
    repeat: 0
  });

  anims.create({
    key: 'door_closed',
    frames: [{ key: 'door', frame: 0 }],
    frameRate: 1,
    repeat: 0
  });

  anims.create({
    key: 'door_open',
    frames: [{ key: 'door', frame: 1 }],
    frameRate: 1,
    repeat: 0
  });
}
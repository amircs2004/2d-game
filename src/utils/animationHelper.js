export function createCharacterAnimations(anims) {
  // 1. Idle
  anims.create({
    key: 'player-idle',
    frames: anims.generateFrameNumbers('player_idle', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  // 2. Walk
  anims.create({
    key: 'player-walk',
    frames: anims.generateFrameNumbers('player_walk', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: -1
  });

  // 3. Run
  anims.create({
    key: 'player-run',
    frames: anims.generateFrameNumbers('player_run', { start: 0, end: 7 }),
    frameRate: 12,
    repeat: -1
  });

  // 4. Jump
  anims.create({
    key: 'player-jump',
    frames: anims.generateFrameNumbers('player_jump', { start: 0, end: 7 }),
    frameRate: 10,
    repeat: 0
  });

  // 5. Attacks (1, 2, and 3)
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

  // 6. Shield / Guard
  anims.create({
    key: 'player-shield',
    frames: anims.generateFrameNumbers('player_shield', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: -1
  });

  // 7. Hurt
  anims.create({
    key: 'player-hurt',
    frames: anims.generateFrameNumbers('player_hurt', { start: 0, end: 3 }),
    frameRate: 10,
    repeat: 0
  });

  // 8. Dead
  anims.create({
    key: 'player-dead',
    frames: anims.generateFrameNumbers('player_dead', { start: 0, end: 5 }),
    frameRate: 10,
    repeat: 0
  });
}
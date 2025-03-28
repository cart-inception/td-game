const { v4: uuidv4 } = require('uuid');
const roundData = require('./roundData');

class GameManager {
  constructor() {
    this.games = {};
    this.updateInterval = 100; // ms between game state updates
    this.activeIntervals = {};
  }

  createGame(roomId, players) {
    const gameId = roomId;
    
    // Create player sections on the map
    const playerSections = this.createPlayerSections(players.length);
    
    // Initialize game state
    this.games[gameId] = {
      id: gameId,
      players: players.map((player, index) => ({
        id: player.id,
        username: player.username,
        section: playerSections[index],
        position: index,
        ready: false
      })),
      towers: [],
      enemies: [],
      round: 0,
      lives: 100,
      playerMoney: {},
      active: true,
      roundInProgress: false,
      enemyIdCounter: 0,
      lastUpdateTime: Date.now()
    };
    
    // Initialize player money
    players.forEach(player => {
      this.games[gameId].playerMoney[player.id] = 650; // Starting money
    });
    
    // Start the game update loop
    this.startGameLoop(gameId);
    
    return gameId;
  }

  getGameState(gameId) {
    if (!this.games[gameId]) return null;
    
    // Return a safe copy of the game state (without private fields)
    return {
      id: this.games[gameId].id,
      players: this.games[gameId].players,
      towers: this.games[gameId].towers,
      enemies: this.games[gameId].enemies,
      round: this.games[gameId].round,
      lives: this.games[gameId].lives,
      playerMoney: this.games[gameId].playerMoney,
      active: this.games[gameId].active
    };
  }

  getPlayerData(gameId, playerId) {
    if (!this.games[gameId]) return null;
    
    return this.games[gameId].players.find(p => p.id === playerId);
  }

  placeTower(gameId, playerId, towerType, x, y) {
    const game = this.games[gameId];
    if (!game) return null;
    
    // Get player's section
    const player = game.players.find(p => p.id === playerId);
    if (!player) return null;
    
    // Check if position is within player's section
    const section = player.section;
    const inSection = (
      x >= section.x &&
      x <= section.x + section.width &&
      y >= section.y &&
      y <= section.y + section.height
    );
    
    if (!inSection) return null;
    
    // Check if player has enough money
    const towerCost = this.getTowerCost(towerType);
    if (game.playerMoney[playerId] < towerCost) return null;
    
    // Check if position is too close to existing towers
    const tooClose = game.towers.some(tower => {
      const dx = tower.x - x;
      const dy = tower.y - y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < 40; // Minimum distance between towers
    });
    
    if (tooClose) return null;
    
    // Check if position is too close to the path
    // This is a simplified check - in a real implementation, you would
    // check against actual path coordinates
    
    // Create tower
    const towerId = uuidv4();
    game.towers.push({
      id: towerId,
      type: towerType,
      x,
      y,
      level: 1,
      ownerId: playerId
    });
    
    // Deduct cost from player money
    game.playerMoney[playerId] -= towerCost;
    
    return towerId;
  }

  upgradeTower(gameId, playerId, towerId) {
    const game = this.games[gameId];
    if (!game) return false;
    
    // Find tower
    const towerIndex = game.towers.findIndex(t => t.id === towerId);
    if (towerIndex === -1) return false;
    
    const tower = game.towers[towerIndex];
    
    // Check if player owns the tower
    if (tower.ownerId !== playerId) return false;
    
    // Check if tower is already at max level
    if (tower.level >= 3) return false;
    
    // Calculate upgrade cost (increases with each level)
    const baseCost = this.getTowerCost(tower.type);
    const upgradeCost = Math.ceil(baseCost * 0.75 * tower.level);
    
    // Check if player has enough money
    if (game.playerMoney[playerId] < upgradeCost) return false;
    
    // Upgrade tower
    tower.level += 1;
    
    // Deduct cost from player money
    game.playerMoney[playerId] -= upgradeCost;
    
    // Update tower in game state
    game.towers[towerIndex] = tower;
    
    return true;
  }

  startRound(gameId) {
    const game = this.games[gameId];
    if (!game || game.roundInProgress) return 0;
    
    // Increment round number
    game.round += 1;
    const currentRound = game.round;
    
    // Get round data
    const round = roundData.find(r => r.number === currentRound);
    if (!round) return 0;
    
    // Mark round in progress
    game.roundInProgress = true;
    
    // Spawn enemies for this round
    this.spawnRoundEnemies(gameId, round);
    
    return currentRound;
  }

  removePlayer(gameId, playerId) {
    const game = this.games[gameId];
    if (!game) return;
    
    // Remove player from game
    game.players = game.players.filter(p => p.id !== playerId);
    
    // If no players left, end the game
    if (game.players.length === 0) {
      this.endGame(gameId);
    }
  }

  endGame(gameId) {
    // Clear update interval
    if (this.activeIntervals[gameId]) {
      clearInterval(this.activeIntervals[gameId]);
      delete this.activeIntervals[gameId];
    }
    
    // Remove game state
    delete this.games[gameId];
  }

  startGameLoop(gameId) {
    // Set up interval for game updates
    this.activeIntervals[gameId] = setInterval(() => {
      this.updateGame(gameId);
    }, this.updateInterval);
  }

  updateGame(gameId) {
    const game = this.games[gameId];
    if (!game || !game.active) return;
    
    // Calculate time since last update
    const now = Date.now();
    const deltaTime = now - game.lastUpdateTime;
    game.lastUpdateTime = now;
    
    // Update towers (attack enemies)
    this.updateTowers(game, deltaTime);
    
    // Update enemies (move along path)
    this.updateEnemies(game, deltaTime);
    
    // Check for round completion
    if (game.roundInProgress && game.enemies.length === 0) {
      game.roundInProgress = false;
      
      // Award money to all players at the end of the round
      Object.keys(game.playerMoney).forEach(playerId => {
        game.playerMoney[playerId] += 100 + (game.round * 50);
      });
    }
    
    // Check for game over
    if (game.lives <= 0) {
      game.active = false;
      clearInterval(this.activeIntervals[gameId]);
      delete this.activeIntervals[gameId];
    }
  }

  updateTowers(game, deltaTime) {
    // For each tower, find targets and attack
    game.towers.forEach(tower => {
      // Skip towers that don't attack
      if (tower.type === 'income_tower') {
        // Generate income periodically
        if (!tower.lastIncomeTime || now - tower.lastIncomeTime >= 5000) {
          tower.lastIncomeTime = now;
          const income = 10 * tower.level;
          game.playerMoney[tower.ownerId] += income;
        }
        return;
      }
      
      if (tower.type === 'buff_tower') {
        // Buff nearby towers periodically
        // In a real implementation, you would apply buffs to towers
        return;
      }
      
      // Check if enough time has passed since last attack
      const fireRate = this.getTowerFireRate(tower.type, tower.level);
      if (tower.lastAttackTime && now - tower.lastAttackTime < fireRate) {
        return;
      }
      
      // Find enemies in range
      const range = this.getTowerRange(tower.type, tower.level);
      const enemiesInRange = game.enemies.filter(enemy => {
        const dx = enemy.x - tower.x;
        const dy = enemy.y - tower.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        return distance <= range;
      });
      
      if (enemiesInRange.length === 0) return;
      
      // Attack based on tower type
      tower.lastAttackTime = now;
      
      switch (tower.type) {
        case 'basic_tower':
          // Attack single enemy
          this.attackEnemy(game, tower, enemiesInRange[0]);
          break;
        case 'rapid_tower':
          // Attack single enemy with lower damage
          this.attackEnemy(game, tower, enemiesInRange[0], 0.5);
          break;
        case 'splash_tower':
          // Attack multiple enemies in splash radius
          this.splashAttack(game, tower, enemiesInRange[0], 60);
          break;
        case 'freeze_tower':
          // Slow enemies in range
          this.freezeAttack(game, tower, enemiesInRange);
          break;
        case 'lightning_tower':
          // Chain attack to multiple enemies
          this.lightningAttack(game, tower, enemiesInRange);
          break;
      }
    });
  }

  updateEnemies(game, deltaTime) {
    // Update each enemy
    game.enemies.forEach(enemy => {
      // Move enemy along path
      enemy.pathProgress += enemy.speed * (deltaTime / 10000);
      
      // Check if enemy reached the end
      if (enemy.pathProgress >= 1) {
        // Damage player lives
        game.lives -= this.getEnemyDamage(enemy.type);
        
        // Remove enemy
        this.removeEnemy(game, enemy.id);
      }
      
      // Update effects
      if (enemy.effects) {
        enemy.effects = enemy.effects.filter(effect => {
          // Check if effect has expired
          if (now >= effect.endTime) {
            // Remove effect impact (e.g., restore speed)
            if (effect.type === 'freeze') {
              enemy.speed = enemy.baseSpeed;
            }
            return false;
          }
          return true;
        });
      }
      
      // Apply regeneration if enemy has that property
      if (enemy.regen && enemy.health < enemy.maxHealth) {
        enemy.health += enemy.maxHealth * 0.0005 * (deltaTime / 1000);
        enemy.health = Math.min(enemy.health, enemy.maxHealth);
      }
    });
  }

  spawnRoundEnemies(gameId, round) {
    const game = this.games[gameId];
    if (!game) return;
    
    let spawnDelay = 0;
    
    // Create enemies for each type in the round data
    round.enemies.forEach(enemyGroup => {
      for (let i = 0; i < enemyGroup.count; i++) {
        // Calculate delay for this enemy
        const delay = spawnDelay + (i * enemyGroup.spacing);
        
        // Schedule enemy spawn
        setTimeout(() => {
          this.spawnEnemy(gameId, enemyGroup.type);
        }, delay);
      }
      
      // Add group delay to total spawn delay
      spawnDelay += enemyGroup.delay + (enemyGroup.count * enemyGroup.spacing);
    });
    
    // Schedule round completion check
    setTimeout(() => {
      if (game.enemies.length === 0) {
        game.roundInProgress = false;
      }
    }, spawnDelay + 5000); // Add buffer time
  }

  spawnEnemy(gameId, enemyType) {
    const game = this.games[gameId];
    if (!game) return null;
    
    // Get enemy properties
    const enemyProps = this.getEnemyProperties(enemyType, game.round);
    
    // Create enemy
    const enemyId = `enemy_${game.enemyIdCounter++}`;
    const enemy = {
      id: enemyId,
      type: enemyType,
      health: enemyProps.health,
      maxHealth: enemyProps.health,
      speed: enemyProps.speed,
      baseSpeed: enemyProps.speed,
      pathProgress: 0,
      effects: []
    };
    
    // Add to game state
    game.enemies.push(enemy);
    
    return enemyId;
  }

  attackEnemy(game, tower, enemy, damageMultiplier = 1) {
    if (!enemy) return;
    
    // Calculate damage
    const baseDamage = this.getTowerDamage(tower.type, tower.level);
    const damage = baseDamage * damageMultiplier;
    
    // Apply damage to enemy
    enemy.health -= damage;
    
    // Check if enemy is defeated
    if (enemy.health <= 0) {
      // Award money to tower owner
      const moneyReward = this.getEnemyReward(enemy.type);
      game.playerMoney[tower.ownerId] += moneyReward;
      
      // Remove enemy
      this.removeEnemy(game, enemy.id);
    }
  }

  splashAttack(game, tower, targetEnemy, splashRadius) {
    if (!targetEnemy) return;
    
    // Calculate damage
    const damage = this.getTowerDamage(tower.type, tower.level);
    
    // Get enemies in splash radius
    const enemiesInSplash = game.enemies.filter(enemy => {
      const dx = enemy.x - targetEnemy.x;
      const dy = enemy.y - targetEnemy.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance <= splashRadius;
    });
    
    // Apply damage to all enemies in splash
    enemiesInSplash.forEach(enemy => {
      enemy.health -= damage;
      
      // Check if enemy is defeated
      if (enemy.health <= 0) {
        // Award money to tower owner
        const moneyReward = this.getEnemyReward(enemy.type);
        game.playerMoney[tower.ownerId] += moneyReward;
        
        // Remove enemy
        this.removeEnemy(game, enemy.id);
      }
    });
  }

  freezeAttack(game, tower, enemies) {
    // Calculate effect duration based on tower level
    const duration = 2000 + (tower.level * 1000);
    const slowFactor = 0.3 + (tower.level * 0.1);
    
    // Apply freeze effect to all enemies in range
    enemies.forEach(enemy => {
      // Apply damage
      const damage = this.getTowerDamage(tower.type, tower.level);
      enemy.health -= damage;
      
      // Apply freeze effect
      this.applyEffect(enemy, 'freeze', duration, slowFactor);
      
      // Check if enemy is defeated
      if (enemy.health <= 0) {
        // Award money to tower owner
        const moneyReward = this.getEnemyReward(enemy.type);
        game.playerMoney[tower.ownerId] += moneyReward;
        
        // Remove enemy
        this.removeEnemy(game, enemy.id);
      }
    });
  }

  lightningAttack(game, tower, enemies) {
    if (enemies.length === 0) return;
    
    // Sort enemies by distance from tower
    enemies.sort((a, b) => {
      const distA = Math.sqrt(Math.pow(a.x - tower.x, 2) + Math.pow(a.y - tower.y, 2));
      const distB = Math.sqrt(Math.pow(b.x - tower.x, 2) + Math.pow(b.y - tower.y, 2));
      return distA - distB;
    });
    
    // Get primary target
    const primaryTarget = enemies[0];
    
    // Calculate damage
    const damage = this.getTowerDamage(tower.type, tower.level);
    
    // Attack primary target
    primaryTarget.health -= damage;
    
    // Chain to additional targets based on tower level
    const chainCount = tower.level;
    let lastTarget = primaryTarget;
    
    for (let i = 1; i < Math.min(chainCount + 1, enemies.length); i++) {
      const nextTarget = enemies[i];
      
      // Calculate distance between targets
      const dx = nextTarget.x - lastTarget.x;
      const dy = nextTarget.y - lastTarget.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Only chain if within range
      if (distance <= 120) {
        // Apply reduced damage to chained targets
        nextTarget.health -= damage * (0.7 - (i * 0.1));
        lastTarget = nextTarget;
      } else {
        break;
      }
    }
    
    // Check for defeated enemies
    enemies.forEach(enemy => {
      if (enemy.health <= 0) {
        // Award money to tower owner
        const moneyReward = this.getEnemyReward(enemy.type);
        game.playerMoney[tower.ownerId] += moneyReward;
        
        // Remove enemy
        this.removeEnemy(game, enemy.id);
      }
    });
  }

  applyEffect(enemy, type, duration, value) {
    // Remove existing effect of the same type
    if (!enemy.effects) {
      enemy.effects = [];
    }
    
    enemy.effects = enemy.effects.filter(effect => effect.type !== type);
    
    // Add new effect
    enemy.effects.push({
      type,
      duration,
      value,
      endTime: Date.now() + duration
    });
    
    // Apply effect impact
    if (type === 'freeze') {
      enemy.speed = enemy.baseSpeed * (1 - value);
    }
  }

  removeEnemy(game, enemyId) {
    game.enemies = game.enemies.filter(e => e.id !== enemyId);
  }

  createPlayerSections(playerCount) {
    // Create player sections based on the number of players
    const sections = [];
    
    if (playerCount <= 2) {
      // Horizontal split for 1-2 players
      sections.push(
        { x: 0, y: 0, width: 1280, height: 360 },
        { x: 0, y: 360, width: 1280, height: 360 }
      );
    } else if (playerCount <= 4) {
      // Quadrant split for 3-4 players
      sections.push(
        { x: 0, y: 0, width: 640, height: 360 },
        { x: 640, y: 0, width: 640, height: 360 },
        { x: 0, y: 360, width: 640, height: 360 },
        { x: 640, y: 360, width: 640, height: 360 }
      );
    } else {
      // 6-section split for 5-6 players
      sections.push(
        { x: 0, y: 0, width: 426, height: 360 },
        { x: 426, y: 0, width: 428, height: 360 },
        { x: 854, y: 0, width: 426, height: 360 },
        { x: 0, y: 360, width: 426, height: 360 },
        { x: 426, y: 360, width: 428, height: 360 },
        { x: 854, y: 360, width: 426, height: 360 }
      );
    }
    
    // Return only the number of sections needed
    return sections.slice(0, playerCount);
  }

  getTowerCost(towerType) {
    // Define base costs for different tower types
    const costs = {
      'basic_tower': 200,
      'rapid_tower': 350,
      'splash_tower': 400,
      'freeze_tower': 500,
      'lightning_tower': 650,
      'income_tower': 800,
      'buff_tower': 450
    };
    
    return costs[towerType] || 200;
  }

  getTowerRange(towerType, level) {
    // Define base ranges for different tower types
    const baseRanges = {
      'basic_tower': 150,
      'rapid_tower': 120,
      'splash_tower': 180,
      'freeze_tower': 140,
      'lightning_tower': 200,
      'income_tower': 100,
      'buff_tower': 250
    };
    
    // Apply level multiplier
    const rangeMultiplier = 1 + 0.2 * (level - 1);
    return Math.floor((baseRanges[towerType] || 150) * rangeMultiplier);
  }

  getTowerDamage(towerType, level) {
    // Define base damage for different tower types
    const baseDamage = {
      'basic_tower': 1,
      'rapid_tower': 0.5,
      'splash_tower': 0.8,
      'freeze_tower': 0.3,
      'lightning_tower': 0.7,
      'income_tower': 0,
      'buff_tower': 0
    };
    
    // Apply level multiplier
    const damageMultiplier = 1 + 0.3 * (level - 1);
    return (baseDamage[towerType] || 1) * damageMultiplier;
  }

  getTowerFireRate(towerType, level) {
    // Define base fire rates (in ms) for different tower types
    const baseFireRates = {
      'basic_tower': 1000,
      'rapid_tower': 400,
      'splash_tower': 1500,
      'freeze_tower': 1200,
      'lightning_tower': 1000,
      'income_tower': 5000,
      'buff_tower': 3000
    };
    
    // Apply level multiplier (lower is faster)
    const fireRateMultiplier = 1 - 0.15 * (level - 1);
    return Math.max(100, (baseFireRates[towerType] || 1000) * fireRateMultiplier);
  }

  getEnemyProperties(enemyType, round) {
    // Base properties for different enemy types
    const baseProps = {
      'basic_bloon': { health: 1, speed: 1, reward: 1 },
      'fast_bloon': { health: 1, speed: 1.5, reward: 2 },
      'heavy_bloon': { health: 3, speed: 0.8, reward: 3 },
      'camo_bloon': { health: 1.5, speed: 1, reward: 3 },
      'regen_bloon': { health: 2, speed: 1, reward: 4 },
      'boss_bloon': { health: 15, speed: 0.5, reward: 10 }
    };
    
    // Scale health and reward based on round number
    const healthScale = 1 + (round * 0.2);
    const rewardScale = 1 + (round * 0.1);
    
    const props = baseProps[enemyType] || baseProps['basic_bloon'];
    
    return {
      health: props.health * healthScale,
      speed: props.speed,
      reward: Math.ceil(props.reward * rewardScale)
    };
  }

  getEnemyReward(enemyType) {
    // Define base rewards for different enemy types
    const rewards = {
      'basic_bloon': 1,
      'fast_bloon': 2,
      'heavy_bloon': 3,
      'camo_bloon': 3,
      'regen_bloon': 4,
      'boss_bloon': 10
    };
    
    return rewards[enemyType] || 1;
  }

  getEnemyDamage(enemyType) {
    // Define damage to player lives for different enemy types
    const damage = {
      'basic_bloon': 1,
      'fast_bloon': 1,
      'heavy_bloon': 2,
      'camo_bloon': 1,
      'regen_bloon': 2,
      'boss_bloon': 10
    };
    
    return damage[enemyType] || 1;
  }
}

module.exports = GameManager;
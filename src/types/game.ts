// Game state types
export interface GameState {
  id: string;
  players: PlayerData[];
  towers: TowerData[];
  enemies: EnemyData[];
  round: number;
  lives: number;
  playerMoney: { [playerId: string]: number };
  active: boolean;
}

// Player data
export interface PlayerData {
  id: string;
  username: string;
  section: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  position: number;
  ready: boolean;
}

// Tower data
export interface TowerData {
  id: string;
  type: string;
  x: number;
  y: number;
  level: number;
  ownerId: string;
  targets?: string[];
}

// Enemy data
export interface EnemyData {
  id: string;
  type: string;
  health: number;
  maxHealth: number;
  speed: number;
  pathProgress: number;
  effects?: {
    type: string;
    duration: number;
    value: number;
    endTime: number;
  }[];
}

// Round data
export interface RoundData {
  number: number;
  enemies: {
    type: string;
    count: number;
    delay: number;
    spacing: number;
  }[];
}

// Tower types
export enum TowerType {
  Basic = 'basic_tower',
  Rapid = 'rapid_tower',
  Splash = 'splash_tower',
  Freeze = 'freeze_tower',
  Lightning = 'lightning_tower',
  Income = 'income_tower',
  Buff = 'buff_tower'
}

// Enemy types
export enum EnemyType {
  Basic = 'basic_bloon',
  Fast = 'fast_bloon',
  Heavy = 'heavy_bloon',
  Camo = 'camo_bloon',
  Regen = 'regen_bloon',
  Boss = 'boss_bloon'
}

// Game events
export enum GameEvent {
  RoundStart = 'roundStart',
  RoundEnd = 'roundEnd',
  PlayerJoin = 'playerJoin',
  PlayerLeave = 'playerLeave',
  TowerPlaced = 'towerPlaced',
  TowerUpgraded = 'towerUpgraded',
  EnemySpawned = 'enemySpawned',
  EnemyDefeated = 'enemyDefeated',
  EnemyReachedEnd = 'enemyReachedEnd',
  GameOver = 'gameOver',
  GameWon = 'gameWon'
}
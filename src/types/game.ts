export interface Vector2 {
  x: number;
  y: number;
}

export interface InputState {
  up: boolean;
  down: boolean;
  left: boolean;
  right: boolean;
  action1: boolean;
  action2: boolean;
  action3: boolean;
  action4: boolean;
}

export interface Objective {
  id: string;
  type: 'collect' | 'collectType' | 'reachPoint' | 'survive' | 'avoid' | 'find' | 'escort' | 'timedReturn' | 'scan' | 'combat' | 'repair' | 'search' | 'evacuate';
  name: string;
  description: string;
  target: number;
  currentCount: number;
  reward: number;
  optional?: boolean;
  targetId?: string;
  targetType?: string;
}

export interface LevelConfig {
  id: string;
  name: string;
  description: string;
  depth: number;
  objectives: Objective[];
  timeLimit: number;
  unlockScore: number;
  background: string;
  hazards: string[];
  entities: string[];
}

export interface SonarResult {
  type: 'sample' | 'creature' | 'hazard' | 'beacon' | 'exit';
  x: number;
  y: number;
  distance: number;
  size: number;
}

export interface GameSave {
  playerName: string;
  currentLevel: string;
  unlockedLevels: string[];
  upgrades: Record<string, number>;
  collectedSamples: string[];
  collectedLogs: string[];
  highScores: Record<string, number>;
  totalCredits: number;
}

export interface SettlementResult {
  score: number;
  stars: 1 | 2 | 3;
  timeUsed: number;
  samplesCollected: number;
  objectivesCompleted: number;
  creditsEarned: number;
  newUnlocks: string[];
  collectedSampleIds: string[];
}

export type GameState = 'menu' | 'base' | 'playing' | 'paused' | 'settlement';

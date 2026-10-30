export type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

export type Difficulty = 'easy' | 'medium' | 'hard';

export type GameStatus = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export interface Coordinate {
  x: number;
  y: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  color: string;
  alpha: number;
  size: number;
  decay: number;
}

export interface FloatingText {
  id: number;
  x: number;
  y: number;
  text: string;
  color: string;
  alpha: number;
  life: number;
}

export interface FoodItem extends Coordinate {
  type: 'standard' | 'bonus';
  points: number;
  expiresAt?: number;
}

export interface DifficultyConfig {
  id: Difficulty;
  label: string;
  description: string;
  baseIntervalMs: number;
  speedStepMs: number;
  minIntervalMs: number;
  color: string;
}

export interface HighScoreRecord {
  easy: number;
  medium: number;
  hard: number;
  overall: number;
}

export interface GameSettings {
  soundEnabled: boolean;
  showGrid: boolean;
  glowEffects: boolean;
  vibration: boolean;
  showOnScreenControls: boolean;
}

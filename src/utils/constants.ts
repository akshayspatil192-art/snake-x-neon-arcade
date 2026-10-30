import { Difficulty, DifficultyConfig } from '../types/game';

export const GRID_SIZE = 25; // 25x25 grid as requested

export const POINTS_PER_FOOD = 10;
export const POINTS_PER_BONUS = 30;
export const SPEED_INCREMENT_THRESHOLD = 50; // Speed increases every 50 points

export const DIFFICULTY_CONFIGS: Record<Difficulty, DifficultyConfig> = {
  easy: {
    id: 'easy',
    label: 'Easy',
    description: 'Relaxed speed, great for mastering snake navigation and maneuvering.',
    baseIntervalMs: 140,
    speedStepMs: 6,
    minIntervalMs: 60,
    color: '#22c55e',
  },
  medium: {
    id: 'medium',
    label: 'Medium',
    description: 'Standard arcade velocity. Dynamic acceleration as score climbs.',
    baseIntervalMs: 95,
    speedStepMs: 6,
    minIntervalMs: 42,
    color: '#06b6d4',
  },
  hard: {
    id: 'hard',
    label: 'Hard',
    description: 'Blazing reflex speed for elite players with sharp reaction times.',
    baseIntervalMs: 65,
    speedStepMs: 5,
    minIntervalMs: 30,
    color: '#f43f5e',
  },
};

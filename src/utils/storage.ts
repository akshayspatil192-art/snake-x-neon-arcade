import { Difficulty, GameSettings, HighScoreRecord } from '../types/game';

const HIGH_SCORE_KEY = 'snake_x_high_scores';
const SETTINGS_KEY = 'snake_x_settings';

const DEFAULT_HIGH_SCORES: HighScoreRecord = {
  easy: 0,
  medium: 0,
  hard: 0,
  overall: 0,
};

const DEFAULT_SETTINGS: GameSettings = {
  soundEnabled: true,
  showGrid: true,
  glowEffects: true,
  vibration: true,
  showOnScreenControls: true,
};

export function getStoredHighScores(): HighScoreRecord {
  if (typeof window === 'undefined') return DEFAULT_HIGH_SCORES;
  try {
    const raw = localStorage.getItem(HIGH_SCORE_KEY);
    if (!raw) return DEFAULT_HIGH_SCORES;
    const parsed = JSON.parse(raw);
    return {
      easy: Number(parsed.easy) || 0,
      medium: Number(parsed.medium) || 0,
      hard: Number(parsed.hard) || 0,
      overall: Math.max(
        Number(parsed.overall) || 0,
        Number(parsed.easy) || 0,
        Number(parsed.medium) || 0,
        Number(parsed.hard) || 0
      ),
    };
  } catch {
    return DEFAULT_HIGH_SCORES;
  }
}

export function saveHighScore(difficulty: Difficulty, score: number): { isNewHigh: boolean; records: HighScoreRecord } {
  const current = getStoredHighScores();
  const prevDiffScore = current[difficulty];
  const isNewDiffHigh = score > prevDiffScore;
  const isNewOverallHigh = score > current.overall;

  if (isNewDiffHigh) {
    current[difficulty] = score;
  }
  if (isNewOverallHigh) {
    current.overall = score;
  }

  try {
    localStorage.setItem(HIGH_SCORE_KEY, JSON.stringify(current));
  } catch {
    // Storage quota or disabled
  }

  return {
    isNewHigh: isNewDiffHigh,
    records: current,
  };
}

export function getStoredSettings(): GameSettings {
  if (typeof window === 'undefined') return DEFAULT_SETTINGS;
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return DEFAULT_SETTINGS;
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

export function saveStoredSettings(settings: GameSettings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch {
    // Storage quota or disabled
  }
}

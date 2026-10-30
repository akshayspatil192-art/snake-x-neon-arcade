import React from 'react';
import { RotateCcw, Home, Trophy, Clock, Apple, Zap } from 'lucide-react';
import { Difficulty, HighScoreRecord } from '../types/game';
import { DIFFICULTY_CONFIGS } from '../utils/constants';

interface GameOverProps {
  score: number;
  highScores: HighScoreRecord;
  isNewHighScore: boolean;
  duration: number;
  foodsEaten: number;
  speedLevel: number;
  difficulty: Difficulty;
  onRestart: () => void;
  onReturnToMenu: () => void;
}

export const GameOver: React.FC<GameOverProps> = ({
  score,
  highScores,
  isNewHighScore,
  duration,
  foodsEaten,
  speedLevel,
  difficulty,
  onRestart,
  onReturnToMenu,
}) => {
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const diffConfig = DIFFICULTY_CONFIGS[difficulty];
  const difficultyHighScore = highScores[difficulty];

  return (
    <div className="w-full max-w-md mx-auto p-6 bg-slate-900/95 border border-rose-500/40 rounded-3xl neon-glow-red shadow-2xl backdrop-blur-xl animate-fade-in text-center select-none">
      {/* Game Over Title */}
      <div className="mb-4">
        <span className="font-arcade text-xs tracking-widest uppercase text-rose-400 font-bold block mb-1">
          SYSTEM BREACH
        </span>
        <h1 className="font-arcade text-4xl sm:text-5xl font-black text-rose-500 neon-text-red tracking-wider">
          GAME OVER
        </h1>
      </div>

      {/* New High Score Callout */}
      {isNewHighScore && (
        <div className="mb-4 py-2 px-4 rounded-xl bg-amber-500/15 border border-amber-400/40 neon-glow-blue flex items-center justify-center gap-2">
          <Trophy className="w-5 h-5 text-amber-400" />
          <span className="font-arcade text-sm font-bold text-amber-300 tracking-wider">
            NEW RECORD ACHIEVED!
          </span>
        </div>
      )}

      {/* Score Summary Card */}
      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl p-4 mb-5 space-y-3">
        <div className="flex flex-col items-center justify-center pb-3 border-b border-slate-800/80">
          <span className="text-xs text-slate-400 uppercase tracking-widest font-medium mb-1">
            Final Score
          </span>
          <span className="font-arcade text-4xl font-extrabold text-white tabular-nums neon-text-green">
            {score.toLocaleString()}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-left text-xs pt-1">
          {/* Best Score for Difficulty */}
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <Trophy className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Best ({diffConfig.label})</span>
              <span className="font-arcade font-bold text-slate-100 text-sm">
                {difficultyHighScore.toLocaleString()}
              </span>
            </div>
          </div>

          {/* Time Survived */}
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <Clock className="w-4 h-4 text-purple-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Time Survived</span>
              <span className="font-arcade font-bold text-slate-100 text-sm">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* Foods Eaten */}
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <Apple className="w-4 h-4 text-rose-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Orbs Devoured</span>
              <span className="font-arcade font-bold text-slate-100 text-sm">
                {foodsEaten}
              </span>
            </div>
          </div>

          {/* Speed Level Reached */}
          <div className="bg-slate-900/70 p-2.5 rounded-xl border border-slate-800/80 flex items-center gap-2.5">
            <Zap className="w-4 h-4 text-cyan-400 shrink-0" />
            <div>
              <span className="text-slate-400 block text-[10px]">Peak Velocity</span>
              <span className="font-arcade font-bold text-slate-100 text-sm">
                Level {speedLevel}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row gap-3">
        <button
          onClick={onRestart}
          className="flex-1 flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade font-bold tracking-wider transition-all transform active:scale-95 neon-glow-green cursor-pointer shadow-lg"
        >
          <RotateCcw className="w-4 h-4 stroke-[2.5]" />
          <span>PLAY AGAIN</span>
        </button>

        <button
          onClick={onReturnToMenu}
          className="flex items-center justify-center gap-2 py-3.5 px-5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white font-arcade font-semibold tracking-wider transition-all border border-slate-700 active:scale-95 cursor-pointer"
        >
          <Home className="w-4 h-4" />
          <span>MAIN MENU</span>
        </button>
      </div>

      <p className="text-[11px] text-slate-400 mt-4">
        Press <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">Space</kbd> or <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 font-mono text-[10px] text-slate-300">Enter</kbd> to quick restart
      </p>
    </div>
  );
};

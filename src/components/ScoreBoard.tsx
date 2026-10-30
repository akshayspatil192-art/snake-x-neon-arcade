import React from 'react';
import { Volume2, VolumeX, Pause, Play, RotateCcw, Zap, Clock, Trophy } from 'lucide-react';
import { Difficulty } from '../types/game';
import { DIFFICULTY_CONFIGS } from '../utils/constants';

interface ScoreBoardProps {
  score: number;
  highScore: number;
  duration: number;
  speedLevel: number;
  currentSpeedMs: number;
  difficulty: Difficulty;
  isPaused: boolean;
  isMuted: boolean;
  onTogglePause: () => void;
  onToggleMute: () => void;
  onRestart: () => void;
}

export const ScoreBoard: React.FC<ScoreBoardProps> = ({
  score,
  highScore,
  duration,
  speedLevel,
  currentSpeedMs,
  difficulty,
  isPaused,
  isMuted,
  onTogglePause,
  onToggleMute,
  onRestart,
}) => {
  // Format elapsed seconds as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const currentDiff = DIFFICULTY_CONFIGS[difficulty];

  // Calculate speed percentage indicator
  const speedPercentage = Math.min(
    100,
    Math.round(
      ((currentDiff.baseIntervalMs - currentSpeedMs) /
        (currentDiff.baseIntervalMs - currentDiff.minIntervalMs || 1)) *
        100
    )
  );

  return (
    <div className="w-full max-w-[560px] mx-auto mb-3 bg-slate-900/80 border border-slate-800/80 rounded-2xl p-3.5 backdrop-blur-md shadow-xl">
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 items-center mb-3">
        {/* Current Score */}
        <div className="flex flex-col bg-slate-950/70 border border-emerald-500/30 rounded-xl p-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-medium text-emerald-400/90 uppercase tracking-wider mb-0.5">
            <span>Score</span>
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <div className="font-arcade text-2xl font-bold text-white tabular-nums neon-text-green">
            {score.toLocaleString()}
          </div>
        </div>

        {/* High Score */}
        <div className="flex flex-col bg-slate-950/70 border border-amber-500/30 rounded-xl p-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-medium text-amber-400/90 uppercase tracking-wider mb-0.5">
            <span>Best</span>
            <Trophy className="w-3 h-3 text-amber-400" />
          </div>
          <div className="font-arcade text-2xl font-bold text-amber-300 tabular-nums neon-text-amber">
            {highScore.toLocaleString()}
          </div>
        </div>

        {/* Speed / Pace Gauge */}
        <div className="flex flex-col bg-slate-950/70 border border-cyan-500/30 rounded-xl p-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-medium text-cyan-400/90 uppercase tracking-wider mb-0.5">
            <span>Velocity</span>
            <div className="flex items-center gap-1">
              <Zap className="w-3 h-3 text-cyan-400 fill-cyan-400/30" />
              <span className="text-[10px] text-cyan-300">LVL {speedLevel}</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="font-arcade text-xl font-bold text-cyan-300 tabular-nums neon-text-cyan">
              {Math.round(1000 / currentSpeedMs)}
            </span>
            <span className="text-[10px] text-slate-400">ticks/s</span>
          </div>
          {/* Subtle Speed Meter Bar */}
          <div className="w-full h-1 bg-slate-800 rounded-full mt-1.5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-emerald-400 transition-all duration-300"
              style={{ width: `${Math.max(15, speedPercentage)}%` }}
            />
          </div>
        </div>

        {/* Game Timer */}
        <div className="flex flex-col bg-slate-950/70 border border-purple-500/30 rounded-xl p-2.5 relative overflow-hidden">
          <div className="flex items-center justify-between text-[11px] font-medium text-purple-400/90 uppercase tracking-wider mb-0.5">
            <span>Duration</span>
            <Clock className="w-3 h-3 text-purple-400" />
          </div>
          <div className="font-arcade text-2xl font-bold text-purple-200 tabular-nums">
            {formatTime(duration)}
          </div>
        </div>
      </div>

      {/* Control Actions Bar */}
      <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Mode:</span>
          <span
            className="font-arcade font-bold px-2 py-0.5 rounded text-[11px] uppercase tracking-wider"
            style={{ color: currentDiff.color, backgroundColor: `${currentDiff.color}15` }}
          >
            {currentDiff.label}
          </span>
        </div>

        <div className="flex items-center gap-1.5">
          {/* Pause / Resume */}
          <button
            onClick={onTogglePause}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white transition-all text-xs font-medium cursor-pointer active:scale-95 border border-slate-700/60"
            title="Pause/Resume (Space)"
            aria-label={isPaused ? 'Resume Game' : 'Pause Game'}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-emerald-400 fill-emerald-400" /> : <Pause className="w-3.5 h-3.5 text-amber-400" />}
            <span className="font-arcade text-[11px]">{isPaused ? 'RESUME' : 'PAUSE'}</span>
          </button>

          {/* Quick Restart */}
          <button
            onClick={onRestart}
            className="flex items-center justify-center p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 border border-slate-700/60"
            title="Restart Game"
            aria-label="Restart Game"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={onToggleMute}
            className="flex items-center justify-center p-1.5 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-300 hover:text-white transition-all cursor-pointer active:scale-95 border border-slate-700/60"
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
            aria-label={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-3.5 h-3.5 text-rose-400" /> : <Volume2 className="w-3.5 h-3.5 text-emerald-400" />}
          </button>
        </div>
      </div>
    </div>
  );
};

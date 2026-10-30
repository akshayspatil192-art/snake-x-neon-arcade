import React, { useState } from 'react';
import { Play, Volume2, VolumeX, HelpCircle, Trophy, Sparkles, Settings as SettingsIcon } from 'lucide-react';
import { Difficulty, GameSettings, HighScoreRecord } from '../types/game';
import { DIFFICULTY_CONFIGS } from '../utils/constants';

interface MainMenuProps {
  difficulty: Difficulty;
  highScores: HighScoreRecord;
  settings: GameSettings;
  onSelectDifficulty: (difficulty: Difficulty) => void;
  onStartGame: () => void;
  onToggleSound: () => void;
  onOpenSettings: () => void;
}

export const MainMenu: React.FC<MainMenuProps> = ({
  difficulty,
  highScores,
  settings,
  onSelectDifficulty,
  onStartGame,
  onToggleSound,
  onOpenSettings,
}) => {
  const [showHowToPlay, setShowHowToPlay] = useState<boolean>(false);

  return (
    <div className="w-full max-w-lg mx-auto p-6 sm:p-8 bg-slate-900/90 border border-emerald-500/30 rounded-3xl neon-glow-green shadow-2xl backdrop-blur-xl text-center select-none animate-fade-in relative overflow-hidden">
      {/* Decorative ambient neon background glows */}
      <div className="absolute -top-24 -left-24 w-48 h-48 rounded-full bg-emerald-500/15 blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -right-24 w-48 h-48 rounded-full bg-cyan-500/15 blur-3xl pointer-events-none" />

      {/* Top utility row */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={onToggleSound}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs cursor-pointer hover:border-slate-700 active:scale-95"
          aria-label={settings.soundEnabled ? 'Mute Sound' : 'Enable Sound'}
        >
          {settings.soundEnabled ? (
            <>
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <span className="font-arcade text-[10px]">SOUND ON</span>
            </>
          ) : (
            <>
              <VolumeX className="w-4 h-4 text-rose-400" />
              <span className="font-arcade text-[10px]">MUTED</span>
            </>
          )}
        </button>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowHowToPlay(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs cursor-pointer hover:border-slate-700 active:scale-95"
            aria-label="How to play"
          >
            <HelpCircle className="w-4 h-4 text-cyan-400" />
            <span className="font-arcade text-[10px]">RULES</span>
          </button>

          <button
            onClick={onOpenSettings}
            className="p-1.5 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300 hover:text-white transition-all text-xs cursor-pointer hover:border-slate-700 active:scale-95"
            aria-label="Game Settings"
          >
            <SettingsIcon className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Hero Arcade Logo */}
      <div className="mb-6 relative">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono mb-3 tracking-widest">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>NEON ARCADE ENGINE</span>
        </div>

        <h1 className="font-arcade text-5xl sm:text-6xl font-black tracking-tight text-white mb-1">
          SNAKE <span className="text-emerald-400 neon-text-green">X</span>
        </h1>
        <p className="font-arcade text-xs tracking-[0.3em] uppercase text-cyan-400 neon-text-cyan font-bold">
          VELOCITY PROTOCOL
        </p>
      </div>

      {/* Best Scores Overview */}
      <div className="mb-6 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 flex items-center justify-around text-xs">
        <div className="flex items-center gap-2">
          <Trophy className="w-4 h-4 text-amber-400" />
          <span className="text-slate-400">All-Time High:</span>
          <span className="font-arcade font-bold text-amber-300 text-sm tabular-nums">
            {highScores.overall.toLocaleString()}
          </span>
        </div>
        <div className="text-slate-600">|</div>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">{DIFFICULTY_CONFIGS[difficulty].label} Record:</span>
          <span className="font-arcade font-bold text-emerald-400 text-sm tabular-nums">
            {highScores[difficulty].toLocaleString()}
          </span>
        </div>
      </div>

      {/* Difficulty Selector */}
      <div className="mb-6 text-left">
        <label className="block text-xs font-arcade font-semibold uppercase tracking-wider text-slate-400 mb-2 text-center">
          SELECT DIFFICULTY
        </label>
        <div className="grid grid-cols-3 gap-2">
          {(['easy', 'medium', 'hard'] as Difficulty[]).map((d) => {
            const config = DIFFICULTY_CONFIGS[d];
            const isSelected = difficulty === d;
            return (
              <button
                key={d}
                onClick={() => onSelectDifficulty(d)}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border transition-all cursor-pointer active:scale-95 text-center ${
                  isSelected
                    ? 'bg-slate-800/90 text-white font-bold shadow-lg'
                    : 'bg-slate-950/50 text-slate-400 border-slate-800/80 hover:border-slate-700 hover:text-slate-200'
                }`}
                style={{
                  borderColor: isSelected ? config.color : undefined,
                  boxShadow: isSelected ? `0 0 16px ${config.color}35` : undefined,
                }}
              >
                <span
                  className="font-arcade text-sm font-bold tracking-wider mb-0.5"
                  style={{ color: isSelected ? config.color : undefined }}
                >
                  {config.label}
                </span>
                <span className="text-[10px] text-slate-400">
                  {d === 'easy' ? '140ms' : d === 'medium' ? '95ms' : '65ms'}
                </span>
              </button>
            );
          })}
        </div>
        <p className="text-[11px] text-slate-400 text-center mt-2 px-2">
          {DIFFICULTY_CONFIGS[difficulty].description}
        </p>
      </div>

      {/* Primary Action Button: Play Game */}
      <button
        onClick={onStartGame}
        className="w-full flex items-center justify-center gap-2.5 py-4 px-6 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade text-lg font-black tracking-wider transition-all transform hover:scale-[1.02] active:scale-98 neon-glow-green-lg cursor-pointer shadow-xl mb-4"
      >
        <Play className="w-5 h-5 fill-slate-950" />
        <span>START MISSION</span>
      </button>

      {/* Quick Controls Pill Bar */}
      <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] text-slate-400 font-mono">
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">W A S D</kbd>
          or
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">↑ ↓ ← →</kbd>
        </span>
        <span>·</span>
        <span className="flex items-center gap-1">
          <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-300">Space</kbd> Pause
        </span>
        <span>·</span>
        <span>Touch / D-Pad on Mobile</span>
      </div>

      {/* How to Play Modal */}
      {showHowToPlay && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in text-left">
          <div className="w-full max-w-md bg-slate-900 border border-emerald-500/40 rounded-3xl p-6 shadow-2xl neon-glow-green relative max-h-[90vh] overflow-y-auto">
            <h2 className="font-arcade text-2xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="text-emerald-400 neon-text-green">HOW TO PLAY</span>
            </h2>

            <div className="space-y-3.5 text-xs text-slate-300 leading-relaxed mb-6">
              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 mt-1 shrink-0 neon-glow-green" />
                <div>
                  <h3 className="font-bold text-white mb-0.5 font-arcade">Continuous Navigation</h3>
                  <p className="text-slate-400">
                    Your snake moves continuously across the 25x25 grid. Steer using arrow keys, WASD, mobile D-pad, or swipe gestures.
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-rose-500 mt-1 shrink-0 neon-glow-red" />
                <div>
                  <h3 className="font-bold text-white mb-0.5 font-arcade">Feed the Core</h3>
                  <p className="text-slate-400">
                    Devour pulsing Red Orbs to gain <strong className="text-white">+10 points</strong> and lengthen the snake. Bonus Golden Orbs award <strong className="text-amber-300">+30 points</strong> before disappearing!
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-cyan-400 mt-1 shrink-0 neon-glow-blue" />
                <div>
                  <h3 className="font-bold text-white mb-0.5 font-arcade">Dynamic Acceleration</h3>
                  <p className="text-slate-400">
                    Every 50 points earned increases game speed. Stay sharp as velocity levels climb higher!
                  </p>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/80 border border-slate-800 flex items-start gap-3">
                <span className="w-3.5 h-3.5 rounded-full bg-amber-400 mt-1 shrink-0" />
                <div>
                  <h3 className="font-bold text-white mb-0.5 font-arcade">Hazard Avoidance</h3>
                  <p className="text-slate-400">
                    Crashing into the outer boundary perimeter or colliding into your own tail causes immediate game over.
                  </p>
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowHowToPlay(false)}
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-arcade font-bold tracking-wider transition-all cursor-pointer text-center"
            >
              GOT IT, LET'S PLAY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

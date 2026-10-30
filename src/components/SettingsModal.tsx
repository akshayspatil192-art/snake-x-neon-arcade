import React from 'react';
import { X, Volume2, Sparkles, Grid, Smartphone, Trash2 } from 'lucide-react';
import { GameSettings } from '../types/game';

interface SettingsModalProps {
  isOpen: boolean;
  settings: GameSettings;
  onUpdateSettings: (settings: GameSettings) => void;
  onClose: () => void;
  onResetHighScores: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  settings,
  onUpdateSettings,
  onClose,
  onResetHighScores,
}) => {
  if (!isOpen) return null;

  const toggleSound = () => {
    onUpdateSettings({ ...settings, soundEnabled: !settings.soundEnabled });
  };

  const toggleGlow = () => {
    onUpdateSettings({ ...settings, glowEffects: !settings.glowEffects });
  };

  const toggleGrid = () => {
    onUpdateSettings({ ...settings, showGrid: !settings.showGrid });
  };

  const toggleVibration = () => {
    onUpdateSettings({ ...settings, vibration: !settings.vibration });
  };

  const handleResetHighScores = () => {
    if (window.confirm('Are you sure you want to reset all high scores to 0?')) {
      onResetHighScores();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in select-none">
      <div className="w-full max-w-sm bg-slate-900 border border-slate-700/80 rounded-3xl p-6 shadow-2xl relative">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <h2 className="font-arcade text-lg font-bold text-white tracking-wider flex items-center gap-2">
            <span>GAME SETTINGS</span>
          </h2>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Toggles */}
        <div className="space-y-3.5 mb-6 text-xs">
          {/* Sound FX */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Volume2 className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-medium text-slate-200 block">Sound FX</span>
                <span className="text-[10px] text-slate-400">Synthesized 8-bit audio</span>
              </div>
            </div>
            <button
              onClick={toggleSound}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                settings.soundEnabled ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              aria-label="Toggle Sound"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.soundEnabled ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Neon Glow */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Sparkles className="w-4 h-4 text-cyan-400" />
              <div>
                <span className="font-medium text-slate-200 block">Neon Glow</span>
                <span className="text-[10px] text-slate-400">Pulsing auras & particles</span>
              </div>
            </div>
            <button
              onClick={toggleGlow}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                settings.glowEffects ? 'bg-cyan-500' : 'bg-slate-700'
              }`}
              aria-label="Toggle Glow"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.glowEffects ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Board Grid Lines */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Grid className="w-4 h-4 text-purple-400" />
              <div>
                <span className="font-medium text-slate-200 block">25x25 Grid Lines</span>
                <span className="text-[10px] text-slate-400">Subtle background matrix</span>
              </div>
            </div>
            <button
              onClick={toggleGrid}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                settings.showGrid ? 'bg-purple-500' : 'bg-slate-700'
              }`}
              aria-label="Toggle Grid"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.showGrid ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* Haptics */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Smartphone className="w-4 h-4 text-amber-400" />
              <div>
                <span className="font-medium text-slate-200 block">Touch Haptics</span>
                <span className="text-[10px] text-slate-400">Vibration on crash & turn</span>
              </div>
            </div>
            <button
              onClick={toggleVibration}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                settings.vibration ? 'bg-amber-500' : 'bg-slate-700'
              }`}
              aria-label="Toggle Vibration"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.vibration ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>

          {/* On-screen controls */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
            <div className="flex items-center gap-2.5">
              <Grid className="w-4 h-4 text-emerald-400" />
              <div>
                <span className="font-medium text-slate-200 block">On-Screen D-Pad</span>
                <span className="text-[10px] text-slate-400">Directional buttons for touch/mouse</span>
              </div>
            </div>
            <button
              onClick={() => onUpdateSettings({ ...settings, showOnScreenControls: !settings.showOnScreenControls })}
              className={`w-12 h-6 rounded-full p-0.5 transition-colors cursor-pointer ${
                settings.showOnScreenControls ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
              aria-label="Toggle On-Screen D-Pad"
            >
              <div
                className={`w-5 h-5 rounded-full bg-white transition-transform ${
                  settings.showOnScreenControls ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Reset High Scores */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={handleResetHighScores}
            className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/20 transition-all text-xs font-semibold cursor-pointer active:scale-98"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Reset High Scores</span>
          </button>
        </div>
      </div>
    </div>
  );
};

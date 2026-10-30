import React from 'react';
import { ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';
import { Direction } from '../types/game';
import { soundFx } from '../utils/audio';

interface GameControlsProps {
  currentDirection: Direction;
  onDirectionChange: (dir: Direction) => void;
  vibration: boolean;
}

export const GameControls: React.FC<GameControlsProps> = ({
  currentDirection,
  onDirectionChange,
  vibration,
}) => {
  const handlePress = (direction: Direction) => {
    onDirectionChange(direction);
    if (vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(20);
    }
  };

  return (
    <div className="w-full max-w-[340px] mx-auto mt-2 flex flex-col items-center justify-center select-none touch-none pb-2">
      {/* Visual Diamond D-Pad */}
      <div className="grid grid-cols-3 grid-rows-3 gap-2 w-48 h-48 p-2 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md shadow-lg">
        {/* Row 1: UP button in column 2 */}
        <div />
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handlePress('UP');
          }}
          className={`flex items-center justify-center rounded-xl border transition-all cursor-pointer touch-manipulation active:scale-90 ${
            currentDirection === 'UP'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 neon-glow-green'
              : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-750'
          }`}
          aria-label="Move Up"
        >
          <ArrowUp className="w-7 h-7" />
        </button>
        <div />

        {/* Row 2: LEFT, CENTER CORE, RIGHT */}
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handlePress('LEFT');
          }}
          className={`flex items-center justify-center rounded-xl border transition-all cursor-pointer touch-manipulation active:scale-90 ${
            currentDirection === 'LEFT'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 neon-glow-green'
              : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-750'
          }`}
          aria-label="Move Left"
        >
          <ArrowLeft className="w-7 h-7" />
        </button>

        {/* Center core indicator */}
        <div className="flex items-center justify-center rounded-xl bg-slate-950 border border-slate-800 text-[10px] font-arcade text-emerald-400/80">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/40 border border-emerald-400/70" />
        </div>

        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handlePress('RIGHT');
          }}
          className={`flex items-center justify-center rounded-xl border transition-all cursor-pointer touch-manipulation active:scale-90 ${
            currentDirection === 'RIGHT'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 neon-glow-green'
              : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-750'
          }`}
          aria-label="Move Right"
        >
          <ArrowRight className="w-7 h-7" />
        </button>

        {/* Row 3: DOWN button in column 2 */}
        <div />
        <button
          type="button"
          onPointerDown={(e) => {
            e.preventDefault();
            handlePress('DOWN');
          }}
          className={`flex items-center justify-center rounded-xl border transition-all cursor-pointer touch-manipulation active:scale-90 ${
            currentDirection === 'DOWN'
              ? 'bg-emerald-500 text-slate-950 border-emerald-400 neon-glow-green'
              : 'bg-slate-800/90 text-slate-200 border-slate-700 hover:border-emerald-500/50 hover:bg-slate-750'
          }`}
          aria-label="Move Down"
        >
          <ArrowDown className="w-7 h-7" />
        </button>
        <div />
      </div>

      <p className="text-[11px] text-slate-400 mt-2 text-center">
        Swipe directly on grid or tap directional buttons
      </p>
    </div>
  );
};

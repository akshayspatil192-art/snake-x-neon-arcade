import React, { useState, useEffect } from 'react';
import { GameSettings, HighScoreRecord } from './types/game';
import { getStoredSettings, saveStoredSettings, getStoredHighScores } from './utils/storage';
import { useSnakeGame } from './hooks/useSnakeGame';
import { MainMenu } from './components/MainMenu';
import { ScoreBoard } from './components/ScoreBoard';
import { GameBoard } from './components/GameBoard';
import { GameControls } from './components/GameControls';
import { GameOver } from './components/GameOver';
import { SettingsModal } from './components/SettingsModal';
import { soundFx } from './utils/audio';

export default function App() {
  const [settings, setSettings] = useState<GameSettings>(getStoredSettings);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);

  // Sync settings with soundFx
  useEffect(() => {
    soundFx.setMuted(!settings.soundEnabled);
    saveStoredSettings(settings);
  }, [settings]);

  const {
    status,
    score,
    highScores,
    isNewHighScore,
    duration,
    foodsEaten,
    speedLevel,
    currentSpeedMs,
    difficulty,
    snakeRef,
    directionRef,
    foodRef,
    bonusFoodRef,
    particlesRef,
    floatingTextsRef,
    setDifficulty,
    startGame,
    pauseGame,
    resumeGame,
    togglePause,
    returnToMenu,
    changeDirection,
  } = useSnakeGame({ settings });

  const handleUpdateSettings = (newSettings: GameSettings) => {
    setSettings(newSettings);
  };

  const handleToggleSound = () => {
    setSettings((prev) => ({
      ...prev,
      soundEnabled: !prev.soundEnabled,
    }));
  };

  const handleResetHighScores = () => {
    const emptyScores: HighScoreRecord = { easy: 0, medium: 0, hard: 0, overall: 0 };
    try {
      localStorage.setItem('snake_x_high_scores', JSON.stringify(emptyScores));
      window.location.reload();
    } catch {
      // ignore
    }
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col items-center justify-between arcade-grid-bg selection:bg-emerald-500/30 selection:text-emerald-300">
      {/* Top Header Navigation (One-row contract) */}
      <header className="w-full max-w-6xl mx-auto flex items-center justify-between gap-8 px-4 sm:px-6 py-3 border-b border-slate-800/80 bg-slate-950/70 backdrop-blur-md z-30">
        {/* Zone 1: Brand Wordmark */}
        <button
          onClick={returnToMenu}
          className="text-left font-arcade text-lg sm:text-xl font-black tracking-wider text-white whitespace-nowrap shrink-0 hover:text-emerald-400 transition-colors cursor-pointer"
        >
          SNAKE <span className="text-emerald-400 neon-text-green">X</span>
        </button>

        {/* Zone 2: Informational / Status Metadata */}
        <div className="hidden md:flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>25x25 Neon Grid</span>
          <span aria-hidden="true">·</span>
          <span>Web Audio Synth</span>
          <span aria-hidden="true">·</span>
          <span>Dynamic Velocity</span>
        </div>

        {/* Zone 3: Quick Action */}
        <div className="flex items-center gap-2 shrink-0">
          {status === 'PLAYING' || status === 'PAUSED' ? (
            <button
              onClick={returnToMenu}
              className="px-3 py-1.5 text-xs font-semibold font-arcade rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-all border border-slate-700 cursor-pointer"
            >
              QUIT MISSION
            </button>
          ) : (
            <button
              onClick={() => setIsSettingsOpen(true)}
              className="px-3 py-1.5 text-xs font-medium rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white transition-all border border-slate-800 cursor-pointer"
            >
              Preferences
            </button>
          )}
        </div>
      </header>

      {/* Main Viewport Container */}
      <main className="w-full max-w-3xl flex-1 flex flex-col items-center justify-center p-3 sm:p-6 my-auto">
        {/* State: Main Menu */}
        {status === 'MENU' && (
          <MainMenu
            difficulty={difficulty}
            highScores={highScores}
            settings={settings}
            onSelectDifficulty={setDifficulty}
            onStartGame={() => startGame()}
            onToggleSound={handleToggleSound}
            onOpenSettings={() => setIsSettingsOpen(true)}
          />
        )}

        {/* State: Playing or Paused */}
        {(status === 'PLAYING' || status === 'PAUSED') && (
          <div className="w-full flex flex-col items-center animate-fade-in">
            {/* Top Score & Game Meters */}
            <ScoreBoard
              score={score}
              highScore={highScores[difficulty]}
              duration={duration}
              speedLevel={speedLevel}
              currentSpeedMs={currentSpeedMs}
              difficulty={difficulty}
              isPaused={status === 'PAUSED'}
              isMuted={!settings.soundEnabled}
              onTogglePause={togglePause}
              onToggleMute={handleToggleSound}
              onRestart={() => startGame()}
            />

            {/* Game Canvas Board */}
            <GameBoard
              snakeRef={snakeRef}
              directionRef={directionRef}
              foodRef={foodRef}
              bonusFoodRef={bonusFoodRef}
              particlesRef={particlesRef}
              floatingTextsRef={floatingTextsRef}
              settings={settings}
              isPaused={status === 'PAUSED'}
              onSwipeDirection={changeDirection}
              onResume={resumeGame}
            />

            {/* On-Screen Touch / Mouse D-Pad Controls */}
            {settings.showOnScreenControls && (
              <div className="w-full mt-1 animate-fade-in">
                <GameControls
                  currentDirection={directionRef.current}
                  onDirectionChange={changeDirection}
                  vibration={settings.vibration}
                />
              </div>
            )}
          </div>
        )}

        {/* State: Game Over */}
        {status === 'GAME_OVER' && (
          <GameOver
            score={score}
            highScores={highScores}
            isNewHighScore={isNewHighScore}
            duration={duration}
            foodsEaten={foodsEaten}
            speedLevel={speedLevel}
            difficulty={difficulty}
            onRestart={() => startGame()}
            onReturnToMenu={returnToMenu}
          />
        )}
      </main>

      {/* Footer */}
      <footer className="w-full max-w-6xl mx-auto py-3 px-4 border-t border-slate-900 text-center text-xs text-slate-400 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="font-arcade text-emerald-400 font-bold">SNAKE X</span>
          <span>© 2026 Neon Arcade</span>
        </div>
        <div className="flex items-center gap-3">
          <span>Arrows or WASD to navigate</span>
          <span>·</span>
          <span>Space to pause</span>
        </div>
      </footer>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        settings={settings}
        onUpdateSettings={handleUpdateSettings}
        onClose={() => setIsSettingsOpen(false)}
        onResetHighScores={handleResetHighScores}
      />
    </div>
  );
}

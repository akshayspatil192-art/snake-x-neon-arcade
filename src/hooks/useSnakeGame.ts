import { useState, useEffect, useRef, useCallback } from 'react';
import {
  Coordinate,
  Difficulty,
  Direction,
  FloatingText,
  FoodItem,
  GameSettings,
  GameStatus,
  HighScoreRecord,
  Particle,
} from '../types/game';
import {
  DIFFICULTY_CONFIGS,
  GRID_SIZE,
  POINTS_PER_BONUS,
  POINTS_PER_FOOD,
  SPEED_INCREMENT_THRESHOLD,
} from '../utils/constants';
import { soundFx } from '../utils/audio';
import { getStoredHighScores, saveHighScore } from '../utils/storage';

interface UseSnakeGameProps {
  settings: GameSettings;
}

const OPPOSITE_DIRECTIONS: Record<Direction, Direction> = {
  UP: 'DOWN',
  DOWN: 'UP',
  LEFT: 'RIGHT',
  RIGHT: 'LEFT',
};

const INITIAL_SNAKE: Coordinate[] = [
  { x: 12, y: 12 },
  { x: 11, y: 12 },
  { x: 10, y: 12 },
  { x: 9, y: 12 },
];

export function useSnakeGame({ settings }: UseSnakeGameProps) {
  const [difficulty, setDifficulty] = useState<Difficulty>('medium');
  const [status, setStatus] = useState<GameStatus>('MENU');
  const [score, setScore] = useState<number>(0);
  const [highScores, setHighScores] = useState<HighScoreRecord>(getStoredHighScores);
  const [isNewHighScore, setIsNewHighScore] = useState<boolean>(false);
  const [duration, setDuration] = useState<number>(0);
  const [foodsEaten, setFoodsEaten] = useState<number>(0);
  const [speedLevel, setSpeedLevel] = useState<number>(1);
  const [currentSpeedMs, setCurrentSpeedMs] = useState<number>(DIFFICULTY_CONFIGS.medium.baseIntervalMs);

  // Entities stored in refs for high-frequency game loop without re-render stutter
  const snakeRef = useRef<Coordinate[]>(INITIAL_SNAKE);
  const directionRef = useRef<Direction>('RIGHT');
  const directionQueueRef = useRef<Direction[]>([]);
  const foodRef = useRef<FoodItem>({ x: 18, y: 12, type: 'standard', points: POINTS_PER_FOOD });
  const bonusFoodRef = useRef<FoodItem | null>(null);
  const particlesRef = useRef<Particle[]>([]);
  const floatingTextsRef = useRef<FloatingText[]>([]);

  // Timing refs
  const lastTickTimeRef = useRef<number>(0);
  const timerIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const bonusTimerRef = useRef<NodeJS.Timeout | null>(null);
  const animationFrameIdRef = useRef<number | null>(null);

  // State sync for UI
  const [snakeLength, setSnakeLength] = useState<number>(INITIAL_SNAKE.length);

  // Helper: check if cell is occupied by snake
  const isCellOccupied = useCallback((x: number, y: number, snake: Coordinate[]) => {
    return snake.some((segment) => segment.x === x && segment.y === y);
  }, []);

  // Helper: generate random unoccupied coordinate
  const generateRandomPosition = useCallback(
    (snake: Coordinate[], extraExclude?: Coordinate | null): Coordinate => {
      const emptyCells: Coordinate[] = [];
      for (let x = 0; x < GRID_SIZE; x++) {
        for (let y = 0; y < GRID_SIZE; y++) {
          const isSnake = snake.some((seg) => seg.x === x && seg.y === y);
          const isExtra = extraExclude && extraExclude.x === x && extraExclude.y === y;
          if (!isSnake && !isExtra) {
            emptyCells.push({ x, y });
          }
        }
      }
      if (emptyCells.length === 0) {
        return { x: 0, y: 0 };
      }
      const randomIndex = Math.floor(Math.random() * emptyCells.length);
      return emptyCells[randomIndex];
    },
    []
  );

  // Calculate speed based on score & difficulty
  const calculateSpeedMs = useCallback((scoreVal: number, diff: Difficulty) => {
    const config = DIFFICULTY_CONFIGS[diff];
    const level = 1 + Math.floor(scoreVal / SPEED_INCREMENT_THRESHOLD);
    const speed = Math.max(config.minIntervalMs, config.baseIntervalMs - (level - 1) * config.speedStepMs);
    return { speed, level };
  }, []);

  // Add particles effect
  const addParticles = useCallback((x: number, y: number, color: string, count = 12) => {
    if (!settings.glowEffects) return;
    const newParticles: Particle[] = [];
    for (let i = 0; i < count; i++) {
      const angle = (Math.PI * 2 * i) / count + (Math.random() - 0.5) * 0.5;
      const speed = 1.2 + Math.random() * 2.5;
      newParticles.push({
        x: x + 0.5,
        y: y + 0.5,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        color,
        alpha: 1,
        size: 2 + Math.random() * 2.5,
        decay: 0.025 + Math.random() * 0.03,
      });
    }
    particlesRef.current.push(...newParticles);
  }, [settings.glowEffects]);

  // Add floating text
  const addFloatingText = useCallback((x: number, y: number, text: string, color: string) => {
    floatingTextsRef.current.push({
      id: Date.now() + Math.random(),
      x: x + 0.5,
      y: y + 0.5,
      text,
      color,
      alpha: 1,
      life: 40,
    });
  }, []);

  // Spawn standard food
  const spawnFood = useCallback(() => {
    const pos = generateRandomPosition(snakeRef.current, bonusFoodRef.current);
    foodRef.current = {
      x: pos.x,
      y: pos.y,
      type: 'standard',
      points: POINTS_PER_FOOD,
    };
  }, [generateRandomPosition]);

  // Spawn bonus food with expiration
  const maybeSpawnBonusFood = useCallback(() => {
    if (bonusFoodRef.current || Math.random() > 0.35) return;
    const pos = generateRandomPosition(snakeRef.current, foodRef.current);
    const expiresAt = Date.now() + 8000;
    bonusFoodRef.current = {
      x: pos.x,
      y: pos.y,
      type: 'bonus',
      points: POINTS_PER_BONUS,
      expiresAt,
    };

    if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);
    bonusTimerRef.current = setTimeout(() => {
      bonusFoodRef.current = null;
    }, 8000);
  }, [generateRandomPosition]);

  // Change direction with queue support
  const changeDirection = useCallback((newDir: Direction) => {
    const queue = directionQueueRef.current;
    const lastDir = queue.length > 0 ? queue[queue.length - 1] : directionRef.current;

    if (newDir !== lastDir && newDir !== OPPOSITE_DIRECTIONS[lastDir]) {
      if (queue.length < 2) {
        queue.push(newDir);
      }
    }
  }, []);

  // Start new game
  const startGame = useCallback((selectedDifficulty?: Difficulty) => {
    const diff = selectedDifficulty || difficulty;
    setDifficulty(diff);
    soundFx.setMuted(!settings.soundEnabled);
    soundFx.playClick();

    const config = DIFFICULTY_CONFIGS[diff];
    snakeRef.current = [
      { x: 12, y: 12 },
      { x: 11, y: 12 },
      { x: 10, y: 12 },
      { x: 9, y: 12 },
    ];
    directionRef.current = 'RIGHT';
    directionQueueRef.current = [];
    particlesRef.current = [];
    floatingTextsRef.current = [];
    bonusFoodRef.current = null;

    if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);

    setScore(0);
    setSnakeLength(4);
    setFoodsEaten(0);
    setDuration(0);
    setSpeedLevel(1);
    setCurrentSpeedMs(config.baseIntervalMs);
    setIsNewHighScore(false);

    // Initial food
    const initialFoodPos = generateRandomPosition(snakeRef.current);
    foodRef.current = {
      x: initialFoodPos.x,
      y: initialFoodPos.y,
      type: 'standard',
      points: POINTS_PER_FOOD,
    };

    lastTickTimeRef.current = performance.now();
    setStatus('PLAYING');
  }, [difficulty, generateRandomPosition, settings.soundEnabled]);

  // Pause game
  const pauseGame = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'PLAYING') {
        soundFx.playClick();
        return 'PAUSED';
      }
      return prev;
    });
  }, []);

  // Resume game
  const resumeGame = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'PAUSED') {
        soundFx.playClick();
        lastTickTimeRef.current = performance.now();
        return 'PLAYING';
      }
      return prev;
    });
  }, []);

  // Toggle Pause
  const togglePause = useCallback(() => {
    setStatus((prev) => {
      if (prev === 'PLAYING') {
        soundFx.playClick();
        return 'PAUSED';
      }
      if (prev === 'PAUSED') {
        soundFx.playClick();
        lastTickTimeRef.current = performance.now();
        return 'PLAYING';
      }
      return prev;
    });
  }, []);

  // Return to Menu
  const returnToMenu = useCallback(() => {
    soundFx.playClick();
    if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);
    setStatus('MENU');
  }, []);

  // Handle Game Over
  const handleGameOver = useCallback((collisionPoint: Coordinate) => {
    soundFx.playCrash();
    if (settings.vibration && typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate([120, 60, 120]);
    }

    addParticles(collisionPoint.x, collisionPoint.y, '#ef4444', 24);
    addFloatingText(collisionPoint.x, collisionPoint.y, 'CRASH!', '#ef4444');

    if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);

    setScore((finalScore) => {
      const { isNewHigh, records } = saveHighScore(difficulty, finalScore);
      setHighScores(records);
      setIsNewHighScore(isNewHigh);
      return finalScore;
    });

    setStatus('GAME_OVER');
  }, [addFloatingText, addParticles, difficulty, settings.vibration]);

  // Main game tick update
  const gameStep = useCallback(() => {
    if (status !== 'PLAYING') return;

    // Process queued direction
    if (directionQueueRef.current.length > 0) {
      const nextDir = directionQueueRef.current.shift()!;
      if (nextDir !== OPPOSITE_DIRECTIONS[directionRef.current]) {
        directionRef.current = nextDir;
      }
    }

    const currentSnake = snakeRef.current;
    const head = currentSnake[0];
    const dir = directionRef.current;

    // Calculate new head
    let nextX = head.x;
    let nextY = head.y;

    if (dir === 'UP') nextY -= 1;
    if (dir === 'DOWN') nextY += 1;
    if (dir === 'LEFT') nextX -= 1;
    if (dir === 'RIGHT') nextX += 1;

    // 1. Wall collision check
    if (nextX < 0 || nextX >= GRID_SIZE || nextY < 0 || nextY >= GRID_SIZE) {
      handleGameOver({ x: head.x, y: head.y });
      return;
    }

    // 2. Self collision check
    // If the snake is about to eat food, the tail won't move. If it doesn't eat food,
    // the last tail segment will be vacated this tick.
    const isEatingStandard = nextX === foodRef.current.x && nextY === foodRef.current.y;
    const isEatingBonus = bonusFoodRef.current && nextX === bonusFoodRef.current.x && nextY === bonusFoodRef.current.y;
    const bodyToCheck = (isEatingStandard || isEatingBonus)
      ? currentSnake
      : currentSnake.slice(0, currentSnake.length - 1);

    if (isCellOccupied(nextX, nextY, bodyToCheck)) {
      handleGameOver({ x: nextX, y: nextY });
      return;
    }

    // Move snake
    const newHead = { x: nextX, y: nextY };
    const newSnake = [newHead, ...currentSnake];

    if (isEatingStandard) {
      // Eat standard food
      soundFx.playEat();
      addParticles(nextX, nextY, '#22c55e', 14);
      addFloatingText(nextX, nextY, '+10', '#4ade80');

      setScore((prev) => {
        const nextScore = prev + POINTS_PER_FOOD;
        const { speed, level } = calculateSpeedMs(nextScore, difficulty);
        setCurrentSpeedMs(speed);
        setSpeedLevel((prevLevel) => {
          if (level > prevLevel) {
            soundFx.playSpeedUp();
            addFloatingText(nextX, nextY - 1, 'SPEED UP!', '#38bdf8');
          }
          return level;
        });
        return nextScore;
      });

      setFoodsEaten((prev) => prev + 1);
      setSnakeLength(newSnake.length);
      spawnFood();
      maybeSpawnBonusFood();
    } else if (isEatingBonus) {
      // Eat bonus food
      soundFx.playBonusEat();
      addParticles(nextX, nextY, '#f59e0b', 20);
      addFloatingText(nextX, nextY, '+30 BONUS!', '#fbbf24');

      setScore((prev) => {
        const nextScore = prev + POINTS_PER_BONUS;
        const { speed, level } = calculateSpeedMs(nextScore, difficulty);
        setCurrentSpeedMs(speed);
        setSpeedLevel((prevLevel) => {
          if (level > prevLevel) {
            soundFx.playSpeedUp();
            addFloatingText(nextX, nextY - 1, 'SPEED UP!', '#38bdf8');
          }
          return level;
        });
        return nextScore;
      });

      bonusFoodRef.current = null;
      if (bonusTimerRef.current) clearTimeout(bonusTimerRef.current);
      setFoodsEaten((prev) => prev + 1);
      setSnakeLength(newSnake.length);
    } else {
      // Just step forward, drop tail
      newSnake.pop();
    }

    snakeRef.current = newSnake;
  }, [
    addFloatingText,
    addParticles,
    calculateSpeedMs,
    difficulty,
    handleGameOver,
    isCellOccupied,
    maybeSpawnBonusFood,
    spawnFood,
    status,
  ]);

  // Main game loop using requestAnimationFrame + delta timing
  useEffect(() => {
    let animId: number;

    const loop = (timestamp: number) => {
      if (status === 'PLAYING') {
        const elapsed = timestamp - lastTickTimeRef.current;
        if (elapsed >= currentSpeedMs) {
          gameStep();
          lastTickTimeRef.current = timestamp;
        }
      }
      animId = requestAnimationFrame(loop);
    };

    animId = requestAnimationFrame(loop);
    animationFrameIdRef.current = animId;

    return () => {
      cancelAnimationFrame(animId);
    };
  }, [currentSpeedMs, gameStep, status]);

  // Duration timer
  useEffect(() => {
    if (status === 'PLAYING') {
      timerIntervalRef.current = setInterval(() => {
        setDuration((d) => d + 1);
      }, 1000);
    } else {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    }

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [status]);

  // Keyboard controls listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent browser scroll for game keys during PLAYING
      const gameKeys = ['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'Space'];
      if (gameKeys.includes(e.key) && (status === 'PLAYING' || status === 'PAUSED')) {
        e.preventDefault();
      }

      if (status === 'PLAYING') {
        switch (e.key) {
          case 'ArrowUp':
          case 'w':
          case 'W':
            changeDirection('UP');
            break;
          case 'ArrowDown':
          case 's':
          case 'S':
            changeDirection('DOWN');
            break;
          case 'ArrowLeft':
          case 'a':
          case 'A':
            changeDirection('LEFT');
            break;
          case 'ArrowRight':
          case 'd':
          case 'D':
            changeDirection('RIGHT');
            break;
          case ' ':
          case 'p':
          case 'P':
            togglePause();
            break;
        }
      } else if (status === 'PAUSED') {
        if (e.key === ' ' || e.key === 'p' || e.key === 'P') {
          togglePause();
        }
      } else if (status === 'GAME_OVER') {
        if (e.key === ' ' || e.key === 'Enter') {
          startGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [changeDirection, startGame, status, togglePause]);

  return {
    status,
    score,
    highScores,
    isNewHighScore,
    duration,
    foodsEaten,
    speedLevel,
    currentSpeedMs,
    difficulty,
    snakeLength,
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
  };
}

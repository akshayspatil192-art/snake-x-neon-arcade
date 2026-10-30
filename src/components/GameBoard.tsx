import React, { useRef, useEffect, useCallback } from 'react';
import { Coordinate, Direction, FloatingText, FoodItem, GameSettings, Particle } from '../types/game';
import { GRID_SIZE } from '../utils/constants';

interface GameBoardProps {
  snakeRef: React.MutableRefObject<Coordinate[]>;
  directionRef: React.MutableRefObject<Direction>;
  foodRef: React.MutableRefObject<FoodItem>;
  bonusFoodRef: React.MutableRefObject<FoodItem | null>;
  particlesRef: React.MutableRefObject<Particle[]>;
  floatingTextsRef: React.MutableRefObject<FloatingText[]>;
  settings: GameSettings;
  isPaused: boolean;
  onSwipeDirection: (direction: Direction) => void;
  onResume: () => void;
}

export const GameBoard: React.FC<GameBoardProps> = ({
  snakeRef,
  directionRef,
  foodRef,
  bonusFoodRef,
  particlesRef,
  floatingTextsRef,
  settings,
  isPaused,
  onSwipeDirection,
  onResume,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  // Canvas drawing loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;

    const render = (time: number) => {
      const width = canvas.width;
      const height = canvas.height;
      const cellSize = width / GRID_SIZE;

      // 1. Clear background (Deep Void Navy / Black)
      ctx.fillStyle = '#050814';
      ctx.fillRect(0, 0, width, height);

      // 2. Draw Grid (if enabled)
      if (settings.showGrid) {
        ctx.strokeStyle = 'rgba(16, 185, 129, 0.07)';
        ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
          const pos = Math.round(i * cellSize);
          // Vertical lines
          ctx.beginPath();
          ctx.moveTo(pos, 0);
          ctx.lineTo(pos, height);
          ctx.stroke();

          // Horizontal lines
          ctx.beginPath();
          ctx.moveTo(0, pos);
          ctx.lineTo(width, pos);
          ctx.stroke();
        }
      }

      // 3. Draw standard food (Pulsing Neon Red Orb)
      const food = foodRef.current;
      if (food) {
        const fx = food.x * cellSize + cellSize / 2;
        const fy = food.y * cellSize + cellSize / 2;
        const pulse = Math.sin(time * 0.007) * 2;
        const radius = Math.max(2, cellSize * 0.38 + pulse);

        ctx.save();
        if (settings.glowEffects) {
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 14 + pulse * 2;
        }

        // Outer glow circle
        const radGrad = ctx.createRadialGradient(fx, fy, 2, fx, fy, radius);
        radGrad.addColorStop(0, '#fca5a5');
        radGrad.addColorStop(0.4, '#ef4444');
        radGrad.addColorStop(1, '#991b1b');

        ctx.fillStyle = radGrad;
        ctx.beginPath();
        ctx.arc(fx, fy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner glint highlight
        ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
        ctx.beginPath();
        ctx.arc(fx - radius * 0.3, fy - radius * 0.3, radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // 4. Draw Bonus Food (if active)
      const bonus = bonusFoodRef.current;
      if (bonus) {
        const bx = bonus.x * cellSize + cellSize / 2;
        const by = bonus.y * cellSize + cellSize / 2;
        const bonusPulse = Math.sin(time * 0.01) * 3;
        const bonusRadius = cellSize * 0.44 + bonusPulse;

        ctx.save();
        if (settings.glowEffects) {
          ctx.shadowColor = '#f59e0b';
          ctx.shadowBlur = 18;
        }

        // Rotating star sparkle
        const rot = time * 0.003;
        ctx.translate(bx, by);
        ctx.rotate(rot);

        const goldGrad = ctx.createRadialGradient(0, 0, 2, 0, 0, bonusRadius);
        goldGrad.addColorStop(0, '#fef08a');
        goldGrad.addColorStop(0.5, '#f59e0b');
        goldGrad.addColorStop(1, '#b45309');

        ctx.fillStyle = goldGrad;
        // Diamond / 8-pointed star shape
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const r = i % 2 === 0 ? bonusRadius : bonusRadius * 0.55;
          const a = (i * Math.PI) / 4;
          if (i === 0) ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r);
          else ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.fill();

        ctx.restore();
      }

      // 5. Draw Snake
      const snake = snakeRef.current;
      if (snake && snake.length > 0) {
        const segPadding = Math.max(1, cellSize * 0.06);
        const segSize = cellSize - segPadding * 2;
        const cornerRadius = cellSize * 0.28;

        // Draw segments from tail to head
        for (let i = snake.length - 1; i >= 0; i--) {
          const seg = snake[i];
          const isHead = i === 0;
          const sx = seg.x * cellSize + segPadding;
          const sy = seg.y * cellSize + segPadding;

          ctx.save();

          if (isHead) {
            // Head with strong neon glow
            if (settings.glowEffects) {
              ctx.shadowColor = '#22c55e';
              ctx.shadowBlur = 16;
            }

            const headGrad = ctx.createLinearGradient(sx, sy, sx + segSize, sy + segSize);
            headGrad.addColorStop(0, '#86efac');
            headGrad.addColorStop(1, '#22c55e');
            ctx.fillStyle = headGrad;

            // Rounded rectangle for head
            ctx.beginPath();
            ctx.roundRect(sx, sy, segSize, segSize, cornerRadius * 1.2);
            ctx.fill();

            // Draw Eyes based on current direction
            const dir = directionRef.current;
            ctx.fillStyle = '#022c22';
            let eye1X = sx + segSize * 0.3;
            let eye1Y = sy + segSize * 0.3;
            let eye2X = sx + segSize * 0.7;
            let eye2Y = sy + segSize * 0.3;

            if (dir === 'DOWN') {
              eye1Y = sy + segSize * 0.7;
              eye2Y = sy + segSize * 0.7;
            } else if (dir === 'LEFT') {
              eye1X = sx + segSize * 0.3;
              eye1Y = sy + segSize * 0.3;
              eye2X = sx + segSize * 0.3;
              eye2Y = sy + segSize * 0.7;
            } else if (dir === 'RIGHT') {
              eye1X = sx + segSize * 0.7;
              eye1Y = sy + segSize * 0.3;
              eye2X = sx + segSize * 0.7;
              eye2Y = sy + segSize * 0.7;
            }

            const eyeSize = Math.max(2, cellSize * 0.12);
            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, eyeSize, 0, Math.PI * 2);
            ctx.arc(eye2X, eye2Y, eyeSize, 0, Math.PI * 2);
            ctx.fill();

            // Pupil glow
            ctx.fillStyle = '#ffffff';
            ctx.beginPath();
            ctx.arc(eye1X, eye1Y, eyeSize * 0.45, 0, Math.PI * 2);
            ctx.arc(eye2X, eye2Y, eyeSize * 0.45, 0, Math.PI * 2);
            ctx.fill();

          } else {
            // Body segment: interpolate color and size slightly along length
            const factor = i / snake.length;
            if (settings.glowEffects && i < 5) {
              ctx.shadowColor = '#10b981';
              ctx.shadowBlur = 8 - i;
            }

            // Green gradient fade towards tail
            const greenVal = Math.round(197 - factor * 40);
            ctx.fillStyle = `rgb(34, ${greenVal}, 94)`;

            ctx.beginPath();
            ctx.roundRect(sx, sy, segSize, segSize, cornerRadius);
            ctx.fill();

            // Subtle interior circuit core
            ctx.fillStyle = 'rgba(167, 243, 208, 0.25)';
            ctx.beginPath();
            ctx.roundRect(
              sx + segSize * 0.25,
              sy + segSize * 0.25,
              segSize * 0.5,
              segSize * 0.5,
              cornerRadius * 0.5
            );
            ctx.fill();
          }

          ctx.restore();
        }
      }

      // 6. Draw and update particles
      const particles = particlesRef.current;
      if (particles.length > 0) {
        for (let i = particles.length - 1; i >= 0; i--) {
          const p = particles[i];
          p.x += p.vx * 0.15;
          p.y += p.vy * 0.15;
          p.alpha -= p.decay;

          if (p.alpha <= 0) {
            particles.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, p.alpha);
          ctx.fillStyle = p.color;
          if (settings.glowEffects) {
            ctx.shadowColor = p.color;
            ctx.shadowBlur = 6;
          }

          const px = p.x * cellSize;
          const py = p.y * cellSize;
          ctx.beginPath();
          ctx.arc(px, py, p.size, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      }

      // 7. Draw and update floating texts
      const floatingTexts = floatingTextsRef.current;
      if (floatingTexts.length > 0) {
        for (let i = floatingTexts.length - 1; i >= 0; i--) {
          const ft = floatingTexts[i];
          ft.y -= 0.03;
          ft.life -= 1;
          ft.alpha = ft.life / 40;

          if (ft.life <= 0) {
            floatingTexts.splice(i, 1);
            continue;
          }

          ctx.save();
          ctx.globalAlpha = Math.max(0, ft.alpha);
          ctx.font = `700 ${Math.max(12, cellSize * 0.75)}px 'Orbitron', monospace`;
          ctx.fillStyle = ft.color;
          if (settings.glowEffects) {
            ctx.shadowColor = ft.color;
            ctx.shadowBlur = 10;
          }
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(ft.text, ft.x * cellSize, ft.y * cellSize);
          ctx.restore();
        }
      }

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => {
      cancelAnimationFrame(animId);
    };
  }, [directionRef, floatingTextsRef, foodRef, bonusFoodRef, particlesRef, settings, snakeRef]);

  // Resize canvas to match container crispness with high DPI
  const handleResize = useCallback(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const rect = container.getBoundingClientRect();
    const size = Math.floor(Math.min(rect.width, rect.height || rect.width)) || 360;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = size * dpr;
    canvas.height = size * dpr;
    canvas.style.width = `${size}px`;
    canvas.style.height = `${size}px`;

    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.imageSmoothingEnabled = true;
    }
  }, []);

  useEffect(() => {
    handleResize();
    window.addEventListener('resize', handleResize);

    const container = containerRef.current;
    let observer: ResizeObserver | null = null;
    if (container && typeof ResizeObserver !== 'undefined') {
      observer = new ResizeObserver(() => {
        handleResize();
      });
      observer.observe(container);
    }

    return () => {
      window.removeEventListener('resize', handleResize);
      if (observer) {
        observer.disconnect();
      }
    };
  }, [handleResize]);

  // Touch Swipe Handlers for mobile gameplay directly on canvas
  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length !== 1) return;
    const touch = e.touches[0];
    touchStartRef.current = {
      x: touch.clientX,
      y: touch.clientY,
      time: Date.now(),
    };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current || e.changedTouches.length !== 1) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);
    const elapsed = Date.now() - touchStartRef.current.time;

    // Minimum swipe threshold: 24px and within 500ms
    if (elapsed < 500 && Math.max(absDx, absDy) > 24) {
      if (absDx > absDy) {
        onSwipeDirection(dx > 0 ? 'RIGHT' : 'LEFT');
      } else {
        onSwipeDirection(dy > 0 ? 'DOWN' : 'UP');
      }
    }
    touchStartRef.current = null;
  };

  return (
    <div
      ref={containerRef}
      className="relative flex items-center justify-center w-full aspect-square max-w-[560px] max-h-[560px] mx-auto p-1.5 rounded-2xl bg-slate-950/90 border-2 border-emerald-500/30 neon-glow-green shadow-2xl backdrop-blur-md overflow-hidden select-none"
    >
      {/* Corner neon accents */}
      <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-emerald-400 z-10 pointer-events-none" />
      <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-emerald-400 z-10 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-emerald-400 z-10 pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-emerald-400 z-10 pointer-events-none" />

      {/* Main HTML5 Canvas */}
      <canvas
        ref={canvasRef}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        className="block rounded-xl cursor-crosshair touch-none"
      />

      {/* Pause Overlay */}
      {isPaused && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="px-6 py-4 rounded-xl bg-slate-900/90 border border-emerald-500/40 neon-glow-green text-center">
            <h2 className="font-arcade text-3xl font-extrabold text-emerald-400 neon-text-green tracking-wider mb-2">
              GAME PAUSED
            </h2>
            <p className="text-sm text-slate-300 mb-4">Press SPACE or tap below to continue</p>
            <button
              onClick={onResume}
              className="px-6 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold font-arcade tracking-wider transition-all transform active:scale-95 shadow-lg"
            >
              RESUME PLAY
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

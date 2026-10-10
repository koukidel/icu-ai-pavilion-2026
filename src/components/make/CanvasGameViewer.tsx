'use client';

import React, { useRef, useEffect, useState } from 'react';
import { GameConfig } from '@/types/pavilion';
import { RotateCcw, Play, Trophy, Sparkles } from 'lucide-react';

interface Props {
  config: GameConfig;
  onGameOver?: (finalScore: number) => void;
}

export const CanvasGameViewer: React.FC<Props> = ({ config, onGameOver }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [isDead, setIsDead] = useState(false);

  // Game state refs (to avoid closure capture in requestAnimationFrame)
  const stateRef = useRef<{
    score: number;
    playerX: number;
    playerY: number;
    playerVy: number;
    isGrounded: boolean;
    obstacles: any[];
    items: any[];
    towerBlocks: any[];
    currentMovingBlock: any;
    targetOrbs: any[];
    keys: { [key: string]: boolean };
    lastSpawn: number;
    animId: number;
  }>({
    score: 0,
    playerX: 180,
    playerY: 200,
    playerVy: 0,
    isGrounded: false,
    obstacles: [],
    items: [],
    towerBlocks: [{ x: 120, y: 360, width: 120, height: 24, color: '#168eac' }],
    currentMovingBlock: { x: 50, y: 330, width: 120, height: 24, vx: 3, color: '#dc4f89' },
    targetOrbs: [],
    keys: {},
    lastSpawn: 0,
    animId: 0,
  });

  const startGame = () => {
    setIsDead(false);
    setScore(0);
    setIsPlaying(true);
    const s = stateRef.current;
    s.score = 0;
    s.playerX = 180;
    s.playerY = 200;
    s.playerVy = 0;
    s.obstacles = [];
    s.items = [];
    s.towerBlocks = [{ x: 120, y: 360, width: 120, height: 24, color: '#168eac' }];
    s.currentMovingBlock = { x: 50, y: 330, width: 120, height: 24, vx: 3, color: '#dc4f89' };
    s.targetOrbs = [];
    s.lastSpawn = 0;
  };

  const handleAction = () => {
    if (!isPlaying || isDead) {
      startGame();
      return;
    }
    const s = stateRef.current;
    if (config.engineType === 'flying') {
      s.playerVy = -5.5; // Flap
    } else if (config.engineType === 'endless_run') {
      if (s.isGrounded) {
        s.playerVy = -11; // Jump
        s.isGrounded = false;
      }
    } else if (config.engineType === 'balance_tower') {
      // Drop current moving block onto tower
      const mb = s.currentMovingBlock;
      const topBlock = s.towerBlocks[s.towerBlocks.length - 1];
      const diff = Math.abs(mb.x - topBlock.x);

      if (diff < mb.width) {
        // Successful stack
        const newWidth = Math.max(20, mb.width - diff * 0.4);
        const placedX = mb.x > topBlock.x ? mb.x : topBlock.x;
        s.towerBlocks.push({
          x: placedX,
          y: topBlock.y - 24,
          width: newWidth,
          height: 24,
          color: s.towerBlocks.length % 2 === 0 ? '#168eac' : '#dc4f89',
        });
        s.score += 10;
        setScore(s.score);

        // Spawn next moving block
        s.currentMovingBlock = {
          x: 20,
          y: topBlock.y - 48,
          width: newWidth,
          height: 24,
          vx: 3 + Math.min(4, s.towerBlocks.length * 0.3),
          color: '#f6dd59',
        };

        // Scroll camera if tower is high
        if (s.towerBlocks.length > 8) {
          s.towerBlocks.forEach((b) => (b.y += 24));
          s.currentMovingBlock.y += 24;
        }
      } else {
        // Missed tower!
        endGame();
      }
    }
  };

  const endGame = () => {
    setIsDead(true);
    setIsPlaying(false);
    onGameOver?.(stateRef.current.score);
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        handleAction();
      }
      stateRef.current.keys[e.code] = true;
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      stateRef.current.keys[e.code] = false;
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [config.engineType, isPlaying, isDead]);

  // Main Canvas Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = true;

    const render = () => {
      if (!running) return;
      const s = stateRef.current;
      const w = canvas.width;
      const h = canvas.height;

      // 1. Clear background
      ctx.fillStyle = config.backgroundColor || '#0c1b24';
      ctx.fillRect(0, 0, w, h);

      // Subtle background grid
      ctx.strokeStyle = 'rgba(22, 142, 172, 0.12)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += 30) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }

      // Render engine specifics
      if (config.engineType === 'fall_catch') {
        // Move paddle
        if (s.keys['ArrowLeft']) s.playerX -= 6;
        if (s.keys['ArrowRight']) s.playerX += 6;
        s.playerX = Math.max(30, Math.min(w - 30, s.playerX));

        if (isPlaying && !isDead) {
          s.lastSpawn++;
          if (s.lastSpawn > Math.max(25, 90 - config.spawnRate)) {
            s.lastSpawn = 0;
            const isHazard = Math.random() < 0.25;
            s.items.push({
              x: 30 + Math.random() * (w - 60),
              y: -10,
              radius: 12,
              vy: 2.5 + Math.random() * 2,
              isHazard,
              color: isHazard ? '#ff5252' : '#dc4f89',
            });
          }

          // Update & draw falling items
          for (let i = s.items.length - 1; i >= 0; i--) {
            const item = s.items[i];
            item.y += item.vy;

            // Draw item (Rose or Hazard)
            ctx.beginPath();
            ctx.arc(item.x, item.y, item.radius, 0, Math.PI * 2);
            ctx.fillStyle = item.color;
            ctx.fill();
            ctx.lineWidth = 2;
            ctx.strokeStyle = '#fff';
            ctx.stroke();

            // Catch check
            const dist = Math.hypot(item.x - s.playerX, item.y - (h - 40));
            if (dist < 32) {
              if (item.isHazard) {
                endGame();
              } else {
                s.score += 10;
                setScore(s.score);
              }
              s.items.splice(i, 1);
            } else if (item.y > h + 20) {
              s.items.splice(i, 1);
            }
          }
        }

        // Draw Player Catcher
        ctx.fillStyle = '#168eac';
        ctx.beginPath();
        ctx.roundRect(s.playerX - 35, h - 45, 70, 18, 8);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
        // Catcher character emblem
        ctx.fillStyle = '#f6dd59';
        ctx.beginPath();
        ctx.arc(s.playerX, h - 36, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (config.engineType === 'flying') {
        // Gravity & Flap
        if (isPlaying && !isDead) {
          s.playerVy += config.gravity || 0.28;
          s.playerY += s.playerVy;

          if (s.playerY > h - 20 || s.playerY < 10) {
            endGame();
          }

          // Obstacles
          s.lastSpawn++;
          if (s.lastSpawn > Math.max(50, 130 - config.spawnRate)) {
            s.lastSpawn = 0;
            const gapY = 80 + Math.random() * (h - 220);
            const gapSize = 100;
            s.obstacles.push({
              x: w,
              width: 40,
              topH: gapY,
              bottomY: gapY + gapSize,
              passed: false,
            });
          }

          for (let i = s.obstacles.length - 1; i >= 0; i--) {
            const ob = s.obstacles[i];
            ob.x -= 3.2;

            // Draw Cyber Columns
            ctx.fillStyle = 'rgba(22, 142, 172, 0.8)';
            ctx.fillRect(ob.x, 0, ob.width, ob.topH);
            ctx.fillRect(ob.x, ob.bottomY, ob.width, h - ob.bottomY);
            ctx.strokeStyle = '#26c6da';
            ctx.strokeRect(ob.x, 0, ob.width, ob.topH);
            ctx.strokeRect(ob.x, ob.bottomY, ob.width, h - ob.bottomY);

            // Hit test
            if (
              s.playerX + 14 > ob.x &&
              s.playerX - 14 < ob.x + ob.width &&
              (s.playerY - 14 < ob.topH || s.playerY + 14 > ob.bottomY)
            ) {
              endGame();
            }

            // Score point
            if (!ob.passed && ob.x + ob.width < s.playerX) {
              ob.passed = true;
              s.score += 1;
              setScore(s.score);
            }

            if (ob.x < -50) s.obstacles.splice(i, 1);
          }
        }

        // Draw Bird / Flying Rose Character
        ctx.save();
        ctx.translate(s.playerX, s.playerY);
        ctx.fillStyle = config.characterColor || '#dc4f89';
        ctx.beginPath();
        ctx.arc(0, 0, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.stroke();
        // Eye
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(5, -4, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#08718d';
        ctx.beginPath();
        ctx.arc(6, -4, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      } else if (config.engineType === 'endless_run') {
        const groundY = h - 60;
        // Gravity
        if (isPlaying && !isDead) {
          s.playerVy += 0.6;
          s.playerY += s.playerVy;
          if (s.playerY >= groundY - 18) {
            s.playerY = groundY - 18;
            s.playerVy = 0;
            s.isGrounded = true;
          }

          s.score += 1;
          if (s.score % 10 === 0) setScore(Math.floor(s.score / 10));

          // Spawn hurdles
          s.lastSpawn++;
          if (s.lastSpawn > Math.max(50, 140 - config.spawnRate)) {
            s.lastSpawn = 0;
            s.obstacles.push({
              x: w,
              y: groundY - 26,
              width: 22,
              height: 26,
            });
          }

          for (let i = s.obstacles.length - 1; i >= 0; i--) {
            const ob = s.obstacles[i];
            ob.x -= 4.5;
            // Draw hurdle
            ctx.fillStyle = '#dc4f89';
            ctx.fillRect(ob.x, ob.y, ob.width, ob.height);
            ctx.strokeStyle = '#fff';
            ctx.strokeRect(ob.x, ob.y, ob.width, ob.height);

            // Collision
            if (
              s.playerX + 16 > ob.x &&
              s.playerX - 16 < ob.x + ob.width &&
              s.playerY + 16 > ob.y
            ) {
              endGame();
            }
            if (ob.x < -30) s.obstacles.splice(i, 1);
          }
        }

        // Draw Ground
        ctx.fillStyle = '#168eac';
        ctx.fillRect(0, groundY, w, h - groundY);
        ctx.strokeStyle = '#fff';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, groundY);
        ctx.lineTo(w, groundY);
        ctx.stroke();

        // Draw Runner
        ctx.fillStyle = config.characterColor || '#f6dd59';
        ctx.beginPath();
        ctx.arc(s.playerX, s.playerY, 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#fff';
        ctx.stroke();
      } else if (config.engineType === 'target_smash') {
        if (isPlaying && !isDead) {
          s.lastSpawn++;
          if (s.lastSpawn > 40 && s.targetOrbs.length < 5) {
            s.lastSpawn = 0;
            s.targetOrbs.push({
              id: Math.random(),
              x: 50 + Math.random() * (w - 100),
              y: 50 + Math.random() * (h - 120),
              radius: 24,
              life: 100,
            });
          }

          for (let i = s.targetOrbs.length - 1; i >= 0; i--) {
            const orb = s.targetOrbs[i];
            orb.life -= 1.5;

            // Draw target orb
            ctx.beginPath();
            ctx.arc(orb.x, orb.y, (orb.radius * orb.life) / 100, 0, Math.PI * 2);
            ctx.fillStyle = '#dc4f89';
            ctx.fill();
            ctx.strokeStyle = '#f6dd59';
            ctx.lineWidth = 3;
            ctx.stroke();

            if (orb.life <= 0) {
              s.targetOrbs.splice(i, 1);
            }
          }
        }
      } else if (config.engineType === 'balance_tower') {
        // Draw stacked blocks
        s.towerBlocks.forEach((b) => {
          ctx.fillStyle = b.color;
          ctx.fillRect(b.x, b.y, b.width, b.height);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 1.5;
          ctx.strokeRect(b.x, b.y, b.width, b.height);
        });

        // Moving block
        if (isPlaying && !isDead) {
          const mb = s.currentMovingBlock;
          mb.x += mb.vx;
          if (mb.x < 10 || mb.x + mb.width > w - 10) {
            mb.vx *= -1;
          }
          ctx.fillStyle = mb.color;
          ctx.fillRect(mb.x, mb.y, mb.width, mb.height);
          ctx.strokeStyle = '#fff';
          ctx.lineWidth = 2;
          ctx.strokeRect(mb.x, mb.y, mb.width, mb.height);
        }
      }

      s.animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      running = false;
      cancelAnimationFrame(stateRef.current.animId);
    };
  }, [config, isPlaying, isDead]);

  // Touch on target smash
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isPlaying) {
      startGame();
      return;
    }

    if (config.engineType === 'target_smash') {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const rect = canvas.getBoundingClientRect();
      const clickX = ((e.clientX - rect.left) / rect.width) * canvas.width;
      const clickY = ((e.clientY - rect.top) / rect.height) * canvas.height;

      const s = stateRef.current;
      for (let i = s.targetOrbs.length - 1; i >= 0; i--) {
        const orb = s.targetOrbs[i];
        const dist = Math.hypot(clickX - orb.x, clickY - orb.y);
        if (dist < orb.radius + 10) {
          s.targetOrbs.splice(i, 1);
          s.score += 15;
          setScore(s.score);
          return;
        }
      }
    } else {
      handleAction();
    }
  };

  return (
    <div className="relative w-full max-w-sm mx-auto select-none">
      {/* Game Header Bar */}
      <div className="flex items-center justify-between px-3 py-2 bg-ink text-white rounded-t-xl border border-teal/40">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-yellow flex items-center gap-1">
            <Trophy className="w-3.5 h-3.5" /> スコア: {score}
          </span>
        </div>
        <div className="text-[11px] text-white/70 font-mono truncate max-w-[160px]">
          {config.title}
        </div>
      </div>

      {/* Canvas */}
      <div className="relative bg-chalk-bg border-x border-teal/40 overflow-hidden">
        <canvas
          ref={canvasRef}
          width={360}
          height={400}
          onClick={handleCanvasClick}
          className="w-full h-auto block touch-none cursor-pointer"
        />

        {/* Start / Game Over Overlay */}
        {(!isPlaying || isDead) && (
          <div
            onClick={startGame}
            className="absolute inset-0 bg-ink/75 backdrop-blur-xs flex flex-col items-center justify-center text-white p-4 cursor-pointer"
          >
            {isDead ? (
              <div className="text-center space-y-3">
                <div className="text-xs font-bold text-rose uppercase tracking-widest">
                  GAME OVER
                </div>
                <div className="text-3xl font-extrabold text-yellow">{score} 点</div>
                <button className="px-4 py-2 rounded-xl bg-teal text-white font-bold text-xs flex items-center gap-1.5 mx-auto hover:bg-teal-dark shadow-sm">
                  <RotateCcw className="w-3.5 h-3.5" /> もう一度あそぶ
                </button>
              </div>
            ) : (
              <div className="text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-rose flex items-center justify-center mx-auto shadow-md">
                  <Play className="w-6 h-6 text-white ml-0.5" />
                </div>
                <div>
                  <div className="text-base font-bold text-white">タップしてスタート</div>
                  <div className="text-xs text-white/70 mt-1">
                    {config.engineType === 'flying' && '画面タップで浮遊・障害物くぐり'}
                    {config.engineType === 'fall_catch' && '左右キーまたはドラッグでアイテム回収'}
                    {config.engineType === 'endless_run' && '画面タップでジャンプ'}
                    {config.engineType === 'target_smash' && '現れるターゲットを素早くタップ！'}
                    {config.engineType === 'balance_tower' && 'タイミングよくタップしてタワーを積む'}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Control Help bar */}
      <div className="p-2.5 bg-paper-light border border-teal/30 rounded-b-xl flex items-center justify-between text-xs text-ink/70">
        <span className="text-[11px] font-semibold text-teal-dark">
          {config.engineType.toUpperCase()}
        </span>
        <button
          onClick={startGame}
          className="hover:text-ink font-semibold flex items-center gap-1 text-[11px]"
        >
          <RotateCcw className="w-3 h-3 text-teal" /> リセット
        </button>
      </div>
    </div>
  );
};

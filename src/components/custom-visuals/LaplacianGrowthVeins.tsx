// Themes: vein growth, diffusion calm, organic branching
// Visualisation: A vein-like cluster grows by diffusion-limited aggregation, leaving ink veins across the parchment
// Unique mechanism: Implements diffusion-limited aggregation (Laplacian growth) on a coarse grid, drawing new branches each frame
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const LaplacianGrowthVeins: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    const cols = 90;
    const rows = 60;
    const grid = new Uint8Array(cols * rows);

    const idx = (x: number, y: number) => y * cols + x;

    const seedRadius = 4;
    const cx = Math.floor(cols / 2);
    const cy = Math.floor(rows / 2);
    for (let y = -seedRadius; y <= seedRadius; y++) {
      for (let x = -seedRadius; x <= seedRadius; x++) {
        const gx = cx + x;
        const gy = cy + y;
        if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
          grid[idx(gx, gy)] = 1;
        }
      }
    }

    const walkers = 45;

    const spawnWalker = () => {
      const angle = Math.random() * Math.PI * 2;
      const radius = Math.min(cols, rows) / 2 - 2;
      const x = Math.floor(cx + Math.cos(angle) * radius);
      const y = Math.floor(cy + Math.sin(angle) * radius);
      return { x, y, stuck: false };
    };

    const doStep = (walker: { x: number; y: number; stuck: boolean }) => {
      const moves = [
        [1, 0],
        [-1, 0],
        [0, 1],
        [0, -1],
      ];
      const move = moves[Math.floor(Math.random() * moves.length)];
      walker.x += move[0];
      walker.y += move[1];
      if (walker.x < 1 || walker.x >= cols - 1 || walker.y < 1 || walker.y >= rows - 1) {
        const reset = spawnWalker();
        walker.x = reset.x;
        walker.y = reset.y;
      }
      for (let dy = -1; dy <= 1; dy++) {
        for (let dx = -1; dx <= 1; dx++) {
          const nx = walker.x + dx;
          const ny = walker.y + dy;
          if (grid[idx(nx, ny)] === 1) {
            grid[idx(walker.x, walker.y)] = 1;
            walker.stuck = true;
            return;
          }
        }
      }
    };

    const walkersList = Array.from({ length: walkers }).map(() => spawnWalker());

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < walkersList.length; i++) {
        const walker = walkersList[i];
        if (!walker.stuck) {
          doStep(walker);
        } else {
          walkersList[i] = spawnWalker();
        }
      }

      ctx.fillStyle = 'rgba(25,25,25,0.22)';
      const cellW = width / cols;
      const cellH = height / rows;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          if (grid[idx(x, y)] === 1) {
            ctx.fillRect(x * cellW, y * cellH, cellW * 0.9, cellH * 0.9);
          }
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6', overflow: 'hidden' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

const metadata = {
  themes: 'laplacian,growth,veins',
  visualisation: 'Diffusion-limited aggregation forms ink veins',
  promptSuggestion: '1. Watch random walkers attach\n2. Imagine sap flowing into veins\n3. Let the organic branching relax you'
};
(LaplacianGrowthVeins as any).metadata = metadata;

export default LaplacianGrowthVeins;

// Differs from others by: Implements diffusion-limited aggregation on a grid to grow vein-like patterns.

// Themes: woven decisions, rhythmic tiling, patient oscillation
// Visualisation: A Truchet tile lattice flips orientation in rhythmic cellular pulses
// Unique mechanism: Wave-driven binary cellular automaton controlling Truchet tile rotations
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const TruchetRhythmTapestry: React.FC<VisualProps> = ({ width, height }) => {
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

    const cols = Math.max(14, Math.floor(width / 60));
    const rows = Math.max(14, Math.floor(height / 60));
    const state = new Uint8Array(cols * rows);
    const next = new Uint8Array(cols * rows);

    for (let i = 0; i < state.length; i++) {
      state[i] = i % 2;
    }

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          let sum = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const ny = (row + dy + rows) % rows;
              const nx = (col + dx + cols) % cols;
              sum += state[ny * cols + nx];
            }
          }
          const wave = 0.5 + 0.5 * Math.sin(time * 0.0004 + col * 0.35 + row * 0.27);
          const threshold = 3 + wave * 2;
          next[idx] = sum > threshold ? 1 : sum < threshold - 1 ? 0 : state[idx];
        }
      }

      state.set(next);

      const cellSize = Math.min(width / cols, height / rows);
      const offsetX = (width - cellSize * cols) / 2;
      const offsetY = (height - cellSize * rows) / 2;
      const r = cellSize / 2;

      ctx.lineWidth = 1.8;
      ctx.strokeStyle = 'rgba(30,30,30,0.2)';

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const x = offsetX + col * cellSize;
          const y = offsetY + row * cellSize;
          ctx.beginPath();
          if (state[idx] === 1) {
            ctx.arc(x + r, y, r, Math.PI, 2 * Math.PI);
            ctx.arc(x + r, y + cellSize, r, 0, Math.PI);
          } else {
            ctx.arc(x, y + r, r, Math.PI / 2, (3 * Math.PI) / 2);
            ctx.arc(x + cellSize, y + r, r, (-Math.PI) / 2, Math.PI / 2);
          }
          ctx.stroke();
        }
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.08)';
      ctx.lineWidth = 0.6;
      ctx.strokeRect(offsetX, offsetY, cellSize * cols, cellSize * rows);

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
  themes: 'tiling,rhythm,oscillation',
  visualisation: 'Wave-guided Truchet tiles flipping orientation',
  promptSuggestion: '1. Watch each tile listen to its neighbours\n2. Sense rhythm in the flips\n3. Relax into an ever-weaving lattice'
};
(TruchetRhythmTapestry as any).metadata = metadata;

export default TruchetRhythmTapestry;

// Differs from others by: Employs a wave-modulated cellular automaton to drive Truchet tile rotation patterns.

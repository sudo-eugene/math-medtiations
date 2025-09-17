// Themes: probabilistic mist, steady drift, stochastic calm
// Visualisation: A probability veil evolves under a Fokker–Planck equation with drift, leaving soft gradients
// Unique mechanism: Solves a discretized Fokker–Planck equation with drift and diffusion terms on a grid and renders density as misty streaks
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const FokkerPlanckVeil: React.FC<VisualProps> = ({ width, height }) => {
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

    const cols = 100;
    const rows = 70;
    const density = new Float32Array(cols * rows);
    const next = new Float32Array(cols * rows);

    const cellW = width / cols;
    const cellH = height / rows;

    const idx = (x: number, y: number) => {
      const xx = Math.min(Math.max(x, 1), cols - 2);
      const yy = Math.min(Math.max(y, 1), rows - 2);
      return yy * cols + xx;
    };

    const initialize = () => {
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const nx = (x / cols - 0.5) * 2;
          const ny = (y / rows - 0.5) * 2;
          density[y * cols + x] = Math.exp(-(nx * nx + ny * ny) * 2);
        }
      }
    };

    initialize();

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const driftX = 0.02 * Math.sin(time * 0.0003);
      const driftY = 0.02 * Math.cos(time * 0.0004);
      const diffusion = 0.18;

      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const center = density[y * cols + x];
          const gradX = (density[y * cols + (x + 1)] - density[y * cols + (x - 1)]) * 0.5;
          const gradY = (density[(y + 1) * cols + x] - density[(y - 1) * cols + x]) * 0.5;
          const lap =
            density[y * cols + (x + 1)] +
            density[y * cols + (x - 1)] +
            density[(y + 1) * cols + x] +
            density[(y - 1) * cols + x] -
            4 * center;
          next[y * cols + x] = center - (driftX * gradX + driftY * gradY) + diffusion * lap;
        }
      }

      for (let i = 0; i < density.length; i++) {
        density[i] = Math.max(0, next[i]);
      }

      ctx.fillStyle = 'rgba(25,25,25,0.18)';
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const value = density[y * cols + x];
          const alpha = Math.min(0.2, value * 0.4);
          if (alpha < 0.018) continue;
          ctx.globalAlpha = alpha;
          ctx.fillRect(x * cellW, y * cellH, cellW, cellH * 0.6);
        }
      }
      ctx.globalAlpha = 1;

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
  themes: 'fokker-planck,drift,veil',
  visualisation: 'Fokker–Planck dynamics create a drifting probability veil',
  promptSuggestion: '1. Watch probability drift and diffuse\n2. Imagine particles settling into balance\n3. Let the veil’s motion calm you'
};
(FokkerPlanckVeil as any).metadata = metadata;

export default FokkerPlanckVeil;

// Differs from others by: Solves a discretized Fokker–Planck equation with drift and diffusion to animate a probability veil.

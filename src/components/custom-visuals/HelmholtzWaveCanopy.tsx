// Themes: resonant canopy, wave hush, oscillatory calm
// Visualisation: Standing waves shimmer across a canopy-like grid, breathing gently in place
// Unique mechanism: Integrates a discrete Helmholtz equation on a coarse grid with reflective boundaries to form standing waves
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const HelmholtzWaveCanopy: React.FC<VisualProps> = ({ width, height }) => {
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
    const u = new Float32Array(cols * rows);
    const v = new Float32Array(cols * rows);

    const idx = (x: number, y: number) => {
      const xx = Math.min(Math.max(x, 1), cols - 2);
      const yy = Math.min(Math.max(y, 1), rows - 2);
      return yy * cols + xx;
    };

    const excite = (time: number) => {
      const pulseX = Math.floor(cols * (0.3 + 0.4 * Math.sin(time * 0.0009)));
      const pulseY = Math.floor(rows * (0.3 + 0.4 * Math.cos(time * 0.0007)));
      u[idx(pulseX, pulseY)] += 0.8;
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      excite(time);

      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const id = y * cols + x;
          const lap =
            u[id - 1] +
            u[id + 1] +
            u[id - cols] +
            u[id + cols] -
            4 * u[id];
          const waveSpeed = 0.12;
          const damping = 0.985;
          const accel = lap * waveSpeed;
          v[id] = (v[id] + accel) * damping;
        }
      }

      for (let i = 0; i < u.length; i++) {
        u[i] += v[i];
      }

      const cellW = width / cols;
      const cellH = height / rows;

      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const id = y * cols + x;
          const val = u[id];
          const alpha = Math.min(0.22, Math.abs(val) * 0.8);
          if (alpha < 0.02) continue;
          ctx.fillStyle = `rgba(25,25,25,${alpha})`;
          ctx.fillRect(x * cellW, y * cellH, cellW, cellH * 0.6);
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
  themes: 'helmholtz,wave,canopy',
  visualisation: 'Standing waves shimmer across a canopy grid',
  promptSuggestion: '1. Watch the canopy breathe with waves\n2. Sense resonant nodes settling\n3. Relax into the oscillatory hush'
};
(HelmholtzWaveCanopy as any).metadata = metadata;

export default HelmholtzWaveCanopy;

// Differs from others by: Integrates a discrete Helmholtz wave equation on a grid with reflective boundaries to create standing waves.

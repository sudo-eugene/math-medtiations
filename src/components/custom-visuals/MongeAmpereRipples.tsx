// Themes: optimal transport, gentle curvature, rippling balance
// Visualisation: Rippled height fields shift according to the Monge–Ampère equation, revealing curved ridges
// Unique mechanism: Iteratively approximates the Monge–Ampère equation on a grid to evolve a height field and render iso-curves
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const MongeAmpereRipples: React.FC<VisualProps> = ({ width, height }) => {
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
    const heightField = new Float32Array(cols * rows);
    const nextField = new Float32Array(cols * rows);

    const idx = (x: number, y: number) => {
      const xx = Math.min(Math.max(x, 1), cols - 2);
      const yy = Math.min(Math.max(y, 1), rows - 2);
      return yy * cols + xx;
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const id = y * cols + x;
          const u = heightField[id];
          const ux = (heightField[id + 1] - heightField[id - 1]) * 0.5;
          const uy = (heightField[id + cols] - heightField[id - cols]) * 0.5;
          const uxx = heightField[id + 1] - 2 * u + heightField[id - 1];
          const uyy = heightField[id + cols] - 2 * u + heightField[id - cols];
          const uxy = 0.25 * (
            heightField[id + cols + 1] -
            heightField[id + cols - 1] -
            heightField[id - cols + 1] +
            heightField[id - cols - 1]
          );
          const determinant = uxx * uyy - uxy * uxy;
          const source = Math.sin(x * 0.1 + y * 0.13 + t);
          nextField[id] = u + 0.02 * (determinant - source);
        }
      }

      for (let i = 0; i < heightField.length; i++) {
        heightField[i] = nextField[i];
      }

      const cellW = width / cols;
      const cellH = height / rows;
      ctx.lineWidth = 0.7;
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const value = heightField[idx(x, y)];
          const alpha = Math.min(0.22, Math.abs(value) * 0.4);
          if (alpha < 0.02) continue;
          ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(x * cellW, y * cellH);
          ctx.lineTo(x * cellW + cellW, y * cellH + cellH * 0.3);
          ctx.stroke();
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
  themes: 'monge-ampere,ripple,transport',
  visualisation: 'Monge–Ampère curvature creates breathing ripples',
  promptSuggestion: '1. Watch curvature balance the field\n2. Imagine optimal transport settling\n3. Let ripples comfort you'
};
(MongeAmpereRipples as any).metadata = metadata;

export default MongeAmpereRipples;

// Differs from others by: Iteratively approximates the Monge–Ampère equation on a grid to evolve a height field driving contour strokes.

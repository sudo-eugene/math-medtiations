// Themes: woven diffusion, directional calm, quiet gradients
// Visualisation: Linear threads emerge as an anisotropic diffusion pattern settles across the plane
// Unique mechanism: Evolves an anisotropic diffusion equation with directional coefficients on a coarse grid and renders iso-thread lines
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const AnisotropicDiffusionThreads: React.FC<VisualProps> = ({ width, height }) => {
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

    const cols = 120;
    const rows = 80;
    const values = new Float32Array(cols * rows);
    const nextValues = new Float32Array(cols * rows);

    const idx = (x: number, y: number) => {
      const xx = (x + cols) % cols;
      const yy = (y + rows) % rows;
      return yy * cols + xx;
    };

    const seed = () => {
      for (let i = 0; i < values.length; i++) {
        values[i] = Math.random() * 0.2;
      }
    };

    seed();

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      const diffX = 0.18 + 0.08 * Math.sin(t);
      const diffY = 0.03 + 0.02 * Math.cos(t * 1.3);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const center = values[idx(x, y)];
          const lapX = values[idx(x + 1, y)] + values[idx(x - 1, y)] - 2 * center;
          const lapY = values[idx(x, y + 1)] + values[idx(x, y - 1)] - 2 * center;
          nextValues[idx(x, y)] = center + lapX * diffX + lapY * diffY;
        }
      }

      for (let i = 0; i < values.length; i++) {
        values[i] = nextValues[i] * 0.995;
      }

      const cellW = width / cols;
      const cellH = height / rows;

      ctx.lineWidth = 0.8;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const val = values[idx(x, y)];
          const alpha = Math.min(0.22, Math.max(0, val * 2.2));
          if (alpha < 0.03) continue;
          const px = x * cellW;
          const py = y * cellH;
          ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + cellW, py + cellH * 0.2);
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
  themes: 'anisotropic,diffusion,threads',
  visualisation: 'Directional diffusion forms whispering threads',
  promptSuggestion: '1. Notice diffusion stretching more sideways\n2. Imagine the threads cooling into balance\n3. Follow each line until it fades'
};
(AnisotropicDiffusionThreads as any).metadata = metadata;

export default AnisotropicDiffusionThreads;

// Differs from others by: Evolves anisotropic diffusion with differing coefficients per axis to sculpt thread-like iso-lines.

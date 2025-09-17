// Themes: harmonic balance, Dirichlet calm, potential weave
// Visualisation: A potential field solves a Dirichlet boundary problem, and equal potential lines weave across the canvas
// Unique mechanism: Iteratively solves the Dirichlet Laplace equation with Gauss–Seidel relaxation and renders multiple isopotential lines
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const DirichletHarmonicWeave: React.FC<VisualProps> = ({ width, height }) => {
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
    const potential = new Float32Array(cols * rows);

    const boundary = (x: number, y: number) => {
      const nx = (x / cols - 0.5) * 2;
      const ny = (y / rows - 0.5) * 2;
      if (x === 0 || x === cols - 1 || y === 0 || y === rows - 1) {
        return Math.sin(nx * 3) * Math.cos(ny * 4);
      }
      return null;
    };

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const b = boundary(x, y);
        if (b !== null) {
          potential[y * cols + x] = b;
        }
      }
    }

    const relax = () => {
      for (let y = 1; y < rows - 1; y++) {
        for (let x = 1; x < cols - 1; x++) {
          const b = boundary(x, y);
          if (b !== null) continue;
          potential[y * cols + x] = 0.25 * (
            potential[y * cols + (x + 1)] +
            potential[y * cols + (x - 1)] +
            potential[(y + 1) * cols + x] +
            potential[(y - 1) * cols + x]
          );
        }
      }
    };

    const levels = [-0.6, -0.3, 0, 0.3, 0.6];
    const cellW = width / cols;
    const cellH = height / rows;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 8; i++) relax();

      ctx.lineWidth = 0.75;
      for (let levelIndex = 0; levelIndex < levels.length; levelIndex++) {
        const level = levels[levelIndex];
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + levelIndex * 0.03})`;
        ctx.beginPath();
        for (let y = 1; y < rows - 1; y++) {
          for (let x = 1; x < cols - 1; x++) {
            const value = potential[y * cols + x];
            const right = potential[y * cols + (x + 1)];
            const down = potential[(y + 1) * cols + x];
            if ((value - level) * (right - level) < 0) {
              const t = (level - value) / (right - value);
              const px = (x + t) * cellW;
              const py = y * cellH;
              ctx.lineTo(px, py);
            }
            if ((value - level) * (down - level) < 0) {
              const t = (level - value) / (down - value);
              const px = x * cellW;
              const py = (y + t) * cellH;
              ctx.lineTo(px, py);
            }
          }
        }
        ctx.stroke();
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
  themes: 'dirichlet,harmonic,weave',
  visualisation: 'Dirichlet potential lines weave harmonic patterns',
  promptSuggestion: '1. Observe boundary values guiding the field\n2. Follow isopotential lines weaving softly\n3. Let harmonic balance soothe you'
};
(DirichletHarmonicWeave as any).metadata = metadata;

export default DirichletHarmonicWeave;

// Differs from others by: Solves the Dirichlet Laplace equation via Gauss–Seidel relaxation and draws isopotential curves.

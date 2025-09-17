// Themes: polynomial breath, lattice rhythm, orthogonal calm
// Visualisation: Wavefronts shaped by Chebyshev polynomials ripple across a lattice
// Unique mechanism: Evaluates Chebyshev polynomials to modulate wave amplitudes on a grid and renders iso-lines as ink waves
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const ChebyshevWaveLattice: React.FC<VisualProps> = ({ width, height }) => {
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
    const cellW = width / cols;
    const cellH = height / rows;

    const chebyshevT = (n: number, x: number): number => {
      if (n === 0) return 1;
      if (n === 1) return x;
      let t0 = 1;
      let t1 = x;
      for (let k = 2; k <= n; k++) {
        const tk = 2 * x * t1 - t0;
        t0 = t1;
        t1 = tk;
      }
      return t1;
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0005;
      ctx.lineWidth = 0.75;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const nx = (c / cols - 0.5) * 2;
          const ny = (r / rows - 0.5) * 2;
          const wave =
            chebyshevT(3, nx + Math.sin(t)) * 0.4 +
            chebyshevT(4, ny - Math.cos(t * 1.3)) * 0.35;
          const alpha = Math.min(0.22, Math.abs(wave) * 0.3);
          if (alpha < 0.03) continue;
          const x = c * cellW;
          const y = r * cellH;
          ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(x, y + cellH * 0.2);
          ctx.lineTo(x + cellW, y + cellH * 0.8);
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
  themes: 'chebyshev,wave,lattice',
  visualisation: 'Chebyshev polynomials sculpt lattice waves',
  promptSuggestion: '1. Notice orthogonal polynomials breathing\n2. Watch waves align with their guidance\n3. Let lattice harmonics soothe you'
};
(ChebyshevWaveLattice as any).metadata = metadata;

export default ChebyshevWaveLattice;

// Differs from others by: Uses Chebyshev polynomials to modulate wave amplitudes across a lattice grid.

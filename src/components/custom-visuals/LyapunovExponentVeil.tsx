// Themes: sensitivity calm, exponent veil, logistic drift
// Visualisation: Lyapunov exponents of logistic sequences form a drifting veil of stability and chaos
// Unique mechanism: Computes Lyapunov exponents for alternating logistic parameters across the canvas and renders them as a tonal veil
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const LyapunovExponentVeil: React.FC<VisualProps> = ({ width, height }) => {
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

    const cols = 140;
    const rows = 90;
    const cellW = width / cols;
    const cellH = height / rows;

    const pattern = 'ABBA';

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const offset = Math.sin(time * 0.0003) * 0.2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const a = 3.4 + 0.4 * Math.sin(row * 0.04 + offset);
          const b = 3.5 + 0.4 * Math.cos(col * 0.03 - offset);
          let x = 0.5;
          let sum = 0;
          for (let i = 0; i < pattern.length * 12; i++) {
            const r = pattern[i % pattern.length] === 'A' ? a : b;
            x = r * x * (1 - x);
            const derivative = Math.abs(r * (1 - 2 * x));
            sum += Math.log(Math.max(derivative, 1e-6));
          }
          const exponent = sum / (pattern.length * 12);
          const alpha = 0.05 + Math.min(0.2, (exponent + 2) / 4);
          ctx.fillStyle = `rgba(25,25,25,${alpha})`;
          ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
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
  themes: 'lyapunov,logistic,veil',
  visualisation: 'Lyapunov exponents drift into a stability veil',
  promptSuggestion: '1. Watch sensitivity bloom across the grid\n2. Sense the rhythm of alternating parameters\n3. Let chaos and calm balance your focus'
};
(LyapunovExponentVeil as any).metadata = metadata;

export default LyapunovExponentVeil;

// Differs from others by: Computes Lyapunov exponents for alternating logistic parameters and renders them as a tonal veil.

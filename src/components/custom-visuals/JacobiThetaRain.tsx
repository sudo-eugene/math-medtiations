// Themes: theta cadence, gentle rain, modular calm
// Visualisation: Vertical strands flicker like rain, modulated by Jacobi theta functions
// Unique mechanism: Evaluates Jacobi theta functions to modulate column opacity and offsets, creating quasi-periodic rainfall
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const theta3 = (z: number, q: number) => {
  let sum = 1;
  let term = 1;
  for (let n = 1; n < 12; n++) {
    term = Math.pow(q, n * n);
    sum += 2 * term * Math.cos(2 * n * z);
  }
  return sum;
};

const JacobiThetaRain: React.FC<VisualProps> = ({ width, height }) => {
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

    const columns = 90;
    const strandLength = Math.min(height, 300);

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      ctx.lineWidth = 1.1;
      for (let c = 0; c < columns; c++) {
        const nx = c / columns;
        const z = nx * Math.PI + t;
        const q = 0.6 + 0.3 * Math.sin(t * 0.4 + c * 0.1);
        const amp = theta3(z, q);
        const alpha = 0.05 + Math.min(0.2, Math.abs(amp) * 0.04);
        const x = (c / (columns - 1)) * width;
        const offset = Math.sin(t * 0.8 + c * 0.3) * height * 0.08;
        const top = -strandLength + ((time * 0.12 + c * 40) % (height + strandLength));
        ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x, top + offset);
        ctx.lineTo(x, top + strandLength + offset);
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
  themes: 'jacobi,theta,rain',
  visualisation: 'Jacobi theta functions modulate gentle ink rain',
  promptSuggestion: '1. Watch theta harmonics become rain\n2. Follow columns breathing subtly\n3. Let modular rhythms slow you'
};
(JacobiThetaRain as any).metadata = metadata;

export default JacobiThetaRain;

// Differs from others by: Uses Jacobi theta evaluations to modulate column opacity and offsets for quasi-periodic rainfall.

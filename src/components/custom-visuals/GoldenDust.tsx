import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Phyllotaxis points drifting like golden dust breathing in/out
const GoldenDust: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    let raf: number | null = null;
    let t = 0;
    const N = 8500;
    const phi = (Math.sqrt(5) - 1) * Math.PI; // golden angle (in radians) approximation

    const render = () => {
      t += 0.008;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(60,60,60,0.52)';

      const cx = width / 2;
      const cy = height / 2;
      const base = 3.2 + 0.7 * Math.sin(t * 0.9);

      for (let n = 0; n < N; n++) {
        const a = n * phi + 0.25 * Math.sin(t + n * 0.0007);
        const r = base * Math.sqrt(n / N) * Math.min(width, height) * 0.42;
        const x = cx + r * Math.cos(a);
        const y = cy + r * Math.sin(a);
        const s = 0.3 + 0.25 * Math.sin(0.002 * n + t);
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.2, s), 0, Math.PI * 2);
        ctx.fill();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [width, height]);

  return (
    <div style={{ width, height, background: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default GoldenDust;


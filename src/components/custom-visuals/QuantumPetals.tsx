import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Petal-like standing wave contours from angular harmonics
const QuantumPetals: React.FC<VisualProps> = ({ width, height }) => {
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

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(60,60,60,0.42)';
      ctx.lineWidth = 1;

      const cx = width / 2; const cy = height / 2;
      const maxR = Math.min(width, height) * 0.45;
      const m = 5 + Math.floor(2 * (1 + Math.sin(t * 0.3)));
      const phase = 0.6 * Math.sin(t * 0.6);

      for (let k = 1; k <= 20; k++) {
        const level = k / 20;
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.001; a += 0.01) {
          const radial = 0.5 + 0.5 * Math.sin(m * a + phase);
          const r = level * maxR * (0.3 + 0.7 * radial);
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          if (a === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
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

export default QuantumPetals;


import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Radial mandala of rippled rings with segment symmetry and phase drift
const RippledMandala: React.FC<VisualProps> = ({ width, height }) => {
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

      const cx = width / 2; const cy = height / 2;
      const seg = 12;
      const maxR = Math.min(width, height) * 0.46;
      ctx.strokeStyle = 'rgba(60,60,60,0.42)';
      ctx.lineWidth = 0.9;

      for (let k = 1; k <= 24; k++) {
        const level = k / 24;
        for (let s = 0; s < seg; s++) {
          const a0 = (s / seg) * Math.PI * 2;
          const a1 = ((s + 1) / seg) * Math.PI * 2;
          ctx.beginPath();
          for (let a = a0; a <= a1 + 0.0001; a += 0.01) {
            const ripple = 1 + 0.1 * Math.sin(8 * a + t * 1.4 + k * 0.1);
            const r = level * maxR * ripple;
            const x = cx + r * Math.cos(a);
            const y = cy + r * Math.sin(a);
            if (a === a0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
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

export default RippledMandala;


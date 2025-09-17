import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Three whispering log-spiral families with dashed strokes and phasing
const WhisperingSpirals: React.FC<VisualProps> = ({ width, height }) => {
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

    const drawFamily = (ox: number, oy: number, a: number, turn: number, colorAlpha: number) => {
      ctx.save();
      ctx.translate(ox, oy);
      ctx.setLineDash([4, 3]);
      ctx.lineWidth = 1.0;
      ctx.strokeStyle = `rgba(60,60,60,${colorAlpha})`;
      for (let k = 0; k < 9; k++) {
        ctx.beginPath();
        const steps = 600;
        const rot = t * 0.3 + k * 0.3;
        for (let i = 0; i < steps; i++) {
          const p = i / (steps - 1);
          const theta = p * turn * Math.PI * 2 + rot;
          const r = 8 * Math.exp(a * theta);
          const x = r * Math.cos(theta);
          const y = r * Math.sin(theta);
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      ctx.restore();
    };

    const render = () => {
      t += 0.008;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      const cx = width / 2, cy = height / 2;
      drawFamily(cx, cy, 0.08 + 0.01 * Math.sin(t), 1.7, 0.42);
      drawFamily(cx, cy, 0.06 + 0.01 * Math.cos(t * 0.7), 2.1, 0.3);
      drawFamily(cx, cy, 0.1 + 0.008 * Math.sin(t * 0.9), 1.2, 0.22);
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

export default WhisperingSpirals;


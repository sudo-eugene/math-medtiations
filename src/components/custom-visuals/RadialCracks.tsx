import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Expanding radial cracks as branching lines, growing outward
const RadialCracks: React.FC<VisualProps> = ({ width, height }) => {
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

    type Crack = { x: number; y: number; a: number; life: number };
    const cracks: Crack[] = [];
    const cx = width / 2; const cy = height / 2;

    for (let i = 0; i < 36; i++) {
      cracks.push({ x: cx, y: cy, a: (i / 36) * Math.PI * 2, life: 0 });
    }

    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);
    ctx.strokeStyle = 'rgba(60,60,60,0.55)';
    ctx.lineWidth = 1.1;
    ctx.lineCap = 'round';

    const step = () => {
      t += 1;
      // Slight fade to show history
      ctx.fillStyle = 'rgba(240,238,230,0.1)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < cracks.length; i++) {
        const c = cracks[i];
        const len = 1.7 + Math.random() * 1.4;
        const nx = c.x + Math.cos(c.a) * len;
        const ny = c.y + Math.sin(c.a) * len;

        ctx.beginPath();
        ctx.moveTo(c.x, c.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        c.x = nx; c.y = ny; c.life += 1;
        // random jitter and branching
        c.a += (Math.random() - 0.5) * 0.08;
        if (Math.random() < 0.008 && cracks.length < 1200) {
          cracks.push({ x: c.x, y: c.y, a: c.a + (Math.random() - 0.5) * 0.8, life: 0 });
        }

        // bounce at bounds
        if (c.x < 2 || c.x > width - 2 || c.y < 2 || c.y > height - 2) {
          c.a += Math.PI * (0.8 + Math.random() * 0.4);
        }
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [width, height]);

  return (
    <div style={{ width, height, background: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default RadialCracks;


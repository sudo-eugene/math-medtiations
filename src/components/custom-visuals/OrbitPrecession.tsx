import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Nested ellipses with precessing orbits and trails
const OrbitPrecession: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;

    let raf: number | null = null; let t = 0;

    // particle states on different ellipses
    const bodies = Array.from({ length: 28 }, (_, i) => ({
      a: 30 + i * 8, b: 20 + i * 6, // semi-axes
      ang: Math.random() * Math.PI * 2,
      speed: 0.002 + i * 0.00008,
      precess: 0.0006 + 0.00002 * i,
    }));

    // initialize background
    ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);

    const step = () => {
      t += 1;
      // soft persistence
      ctx.fillStyle = 'rgba(240,238,230,0.15)'; ctx.fillRect(0,0,width,height);

      const cx = width/2, cy = height/2;
      ctx.strokeStyle = 'rgba(60,60,60,0.22)'; ctx.lineWidth = 0.8;

      for (const b of bodies) {
        const orient = t * b.precess;
        // position on oriented ellipse
        const x0 = b.a * Math.cos(b.ang);
        const y0 = b.b * Math.sin(b.ang);
        const x = cx + x0 * Math.cos(orient) - y0 * Math.sin(orient);
        const y = cy + x0 * Math.sin(orient) + y0 * Math.cos(orient);

        // draw a tiny arc trail segment
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.stroke();

        // advance
        b.ang += b.speed;
      }

      raf = requestAnimationFrame(step);
    };

    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [width,height]);

  return (
    <div style={{ width, height, background:'#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height}/>
    </div>
  );
};

export default OrbitPrecession;


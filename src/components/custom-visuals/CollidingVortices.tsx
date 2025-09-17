import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Tracer particles advected by two colliding vortices in 2D
const CollidingVortices: React.FC<VisualProps> = ({ width, height }) => {
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

    const N = 5000;
    const pts = new Float32Array(N * 2);
    for (let i = 0; i < N; i++) {
      pts[2 * i] = Math.random() * width;
      pts[2 * i + 1] = Math.random() * height;
    }

    const step = () => {
      t += 0.01;
      // fade
      ctx.fillStyle = 'rgba(240,238,230,0.2)';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(60,60,60,0.28)';
      ctx.lineWidth = 0.7;

      // vortex centers oscillate
      const c1x = width * 0.4 + 50 * Math.sin(t * 1.1);
      const c1y = height * 0.5 + 40 * Math.cos(t * 0.9);
      const c2x = width * 0.6 + 50 * Math.cos(t * 1.0 + 0.7);
      const c2y = height * 0.5 + 40 * Math.sin(t * 0.8 + 0.3);

      for (let i = 0; i < N; i++) {
        const ix = 2 * i;
        let x = pts[ix];
        let y = pts[ix + 1];

        // velocity field from two point vortices
        const vel = (cx: number, cy: number, sgn: number) => {
          const dx = x - cx; const dy = y - cy; const r2 = dx * dx + dy * dy + 60;
          const v = 2600 / r2; // circulation factor
          return { vx: -sgn * dy * v, vy: sgn * dx * v };
        };
        const v1 = vel(c1x, c1y, 1);
        const v2 = vel(c2x, c2y, -1);
        let vx = v1.vx + v2.vx;
        let vy = v1.vy + v2.vy;
        vx *= 0.04; vy *= 0.04;

        const nx = x + vx;
        const ny = y + vy;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        x = nx; y = ny;

        // wrap
        if (x < 0) x += width; if (x > width) x -= width;
        if (y < 0) y += height; if (y > height) y -= height;

        pts[ix] = x; pts[ix + 1] = y;
      }

      raf = requestAnimationFrame(step);
    };

    // initialize background
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);
    raf = requestAnimationFrame(step);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [width, height]);

  return (
    <div style={{ width, height, background: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default CollidingVortices;


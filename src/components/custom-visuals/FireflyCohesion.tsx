import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Soft-glow fireflies with gentle cohesion and separation
const FireflyCohesion: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    let raf: number | null = null;
    const N = 380;
    const pts = Array.from({ length: N }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6,
      phase: Math.random() * Math.PI * 2,
    }));

    const cohR = 90;
    const sepR = 18;
    const maxV = 1.1;

    const render = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      // update
      for (let i = 0; i < N; i++) {
        const p = pts[i];
        let cx = 0, cy = 0, ccount = 0;
        let sx = 0, sy = 0;
        for (let j = 0; j < N; j++) {
          if (i === j) continue;
          const q = pts[j];
          const dx = q.x - p.x;
          const dy = q.y - p.y;
          const d2 = dx * dx + dy * dy;
          if (d2 < cohR * cohR) {
            cx += q.x; cy += q.y; ccount++;
          }
          if (d2 < sepR * sepR) {
            sx -= dx; sy -= dy;
          }
        }
        if (ccount > 0) {
          cx /= ccount; cy /= ccount;
          p.vx += (cx - p.x) * 0.0009;
          p.vy += (cy - p.y) * 0.0009;
        }
        p.vx += sx * 0.0025;
        p.vy += sy * 0.0025;

        // damping and bounds
        const v = Math.hypot(p.vx, p.vy);
        if (v > maxV) { p.vx = (p.vx / v) * maxV; p.vy = (p.vy / v) * maxV; }
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0) p.x += width; if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height; if (p.y > height) p.y -= height;
        p.phase += 0.04 + (Math.random() - 0.5) * 0.01;
      }

      // draw
      for (const p of pts) {
        const glow = 0.35 + 0.35 * Math.sin(p.phase);
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 18);
        g.addColorStop(0, `rgba(60,60,60,${glow})`);
        g.addColorStop(1, 'rgba(60,60,60,0)');
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 18, 0, Math.PI * 2);
        ctx.fill();
        // core
        ctx.fillStyle = `rgba(60,60,60,${Math.min(0.8, glow + 0.1)})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 1.4, 0, Math.PI * 2);
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

export default FireflyCohesion;


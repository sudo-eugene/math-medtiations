// Themes: recursive circles, echo calm, reflective motion
// Visualisation: Points orbit within nested circles, leaving echoing trails like an Apollonian gasket
// Unique mechanism: Iteratively applies circle inversion against a trio of fixed circles to generate echoing orbit trails
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface OrbitPoint {
  x: number;
  y: number;
  trail: number[];
}

interface Circle {
  cx: number;
  cy: number;
  r: number;
}

const ApollonianEchoOrbits: React.FC<VisualProps> = ({ width, height }) => {
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

    const circles: Circle[] = [
      { cx: width * 0.5, cy: height * 0.35, r: Math.min(width, height) * 0.28 },
      { cx: width * 0.32, cy: height * 0.62, r: Math.min(width, height) * 0.18 },
      { cx: width * 0.65, cy: height * 0.65, r: Math.min(width, height) * 0.2 },
    ];

    const points: OrbitPoint[] = Array.from({ length: 48 }).map((_, i) => ({
      x: width * (0.4 + (i / 48) * 0.2),
      y: height * (0.3 + (i % 12) * 0.03),
      trail: [],
    }));
    const maxTrail = 80;

    const invert = (point: OrbitPoint, circle: Circle) => {
      const dx = point.x - circle.cx;
      const dy = point.y - circle.cy;
      const dist2 = dx * dx + dy * dy;
      if (dist2 < 1e-6) return;
      const factor = (circle.r * circle.r) / dist2;
      point.x = circle.cx + dx * factor;
      point.y = circle.cy + dy * factor;
    };

    const advance = (p: OrbitPoint, time: number) => {
      const t = time * 0.0002;
      p.x += Math.cos(t + p.x * 0.01) * 1.6;
      p.y += Math.sin(t + p.y * 0.01) * 1.6;

      for (let i = 0; i < circles.length; i++) {
        const c = circles[i];
        const dx = p.x - c.cx;
        const dy = p.y - c.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < c.r * (0.95 + 0.03 * Math.sin(time * 0.0003 + i))) {
          invert(p, c);
        }
      }
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.85;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        advance(p, time);

        p.trail.push(p.x, p.y);
        if (p.trail.length > maxTrail * 2) {
          p.trail.splice(0, p.trail.length - maxTrail * 2);
        }

        const alpha = 0.04 + (i / points.length) * 0.1;
        ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
        ctx.beginPath();
        const pts = p.trail;
        for (let j = 0; j < pts.length; j += 2) {
          const x = pts[j];
          const y = pts[j + 1];
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.12)';
      ctx.lineWidth = 1.2;
      circles.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.cx, c.cy, c.r, 0, Math.PI * 2);
        ctx.stroke();
      });

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
  themes: 'apollonian,inversion,echo',
  visualisation: 'Circle inversions create echoing orbit trails',
  promptSuggestion: '1. Watch points reflect through nested circles\n2. Hear the echoes of each inversion\n3. Let the orbiting echoes soothe you'
};
(ApollonianEchoOrbits as any).metadata = metadata;

export default ApollonianEchoOrbits;

// Differs from others by: Iteratively applies circle inversion against multiple fixed circles to generate echoing orbit trails.

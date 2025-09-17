// Themes: stochastic growth, fan calm, correlated drift
// Visualisation: Fan-shaped traces emerge from geometric Brownian motion of radial paths
// Unique mechanism: Integrates geometric Brownian motion for multiple radial emitters to draw expanding fan traces
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface FanPath {
  radius: number;
  angle: number;
  history: number[];
}

const GeometricBrownianFans: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x713bc64f);
    const fans = 28;
    const paths: FanPath[] = Array.from({ length: fans }).map((_, i) => ({
      radius: Math.min(width, height) * 0.05,
      angle: (i / fans) * Math.PI * 2,
      history: [],
    }));
    const maxHistory = 120;
    const mu = 0.06;
    const sigma = 0.18;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const dt = 0.016;

      ctx.lineWidth = 0.85;
      for (let i = 0; i < paths.length; i++) {
        const path = paths[i];
        const z = rng();
        const dr = path.radius * (mu * dt + sigma * Math.sqrt(dt) * (z * 2 - 1));
        path.radius = Math.max(Math.min(path.radius + dr, Math.min(width, height) * 0.45), 10);
        path.angle += (rng() - 0.5) * 0.03;
        const x = cx + Math.cos(path.angle) * path.radius;
        const y = cy + Math.sin(path.angle) * path.radius;
        path.history.push(x, y);
        if (path.history.length > maxHistory * 2) {
          path.history.splice(0, path.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.12 * (i / paths.length)})`;
        ctx.beginPath();
        const pts = path.history;
        for (let p = 0; p < pts.length; p += 2) {
          const px = pts[p];
          const py = pts[p + 1];
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.1)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(width, height) * 0.07, 0, Math.PI * 2);
      ctx.stroke();

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
  themes: 'geometric-brownian,fans,stochastic',
  visualisation: 'Geometric Brownian motion fans expand from center',
  promptSuggestion: '1. Watch stochastic fans breathe\n2. Imagine gentle growth with randomness\n3. Let smooth noise settle your focus'
};
(GeometricBrownianFans as any).metadata = metadata;

export default GeometricBrownianFans;

// Differs from others by: Evolves radial paths with geometric Brownian motion to form expanding fan traces.

// Themes: exponential unwind, spiral flow, analytic calm
// Visualisation: Spirals unwind according to the Lambert W function, creating evolving analytic curves
// Unique mechanism: Evaluates the Lambert W function numerically to steer spiral trajectories
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const lambertW = (z: number) => {
  let w = Math.log(z + 1e-6);
  for (let i = 0; i < 8; i++) {
    const e = Math.exp(w);
    const we = w * e;
    const diff = (we - z) / (e * (w + 1) - (w + 2) * (we - z) / (2 * w + 2));
    w -= diff;
  }
  return w;
};

interface Spiral {
  angle: number;
  radius: number;
  history: number[];
}

const LambertSpiralFlow: React.FC<VisualProps> = ({ width, height }) => {
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

    const spirals: Spiral[] = Array.from({ length: 60 }).map((_, i) => ({
      angle: (i / 60) * Math.PI * 2,
      radius: Math.min(width, height) * 0.05,
      history: [],
    }));
    const maxHistory = 160;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      const cx = width / 2;
      const cy = height / 2;

      ctx.lineWidth = 0.85;
      spirals.forEach((spiral, idx) => {
        const z = Math.abs(Math.sin(t + idx * 0.1)) * 3 + 0.1;
        const w = lambertW(z);
        spiral.radius = Math.min(width, height) * 0.15 * (1 + w);
        spiral.angle += 0.03 + 0.01 * w;
        const x = cx + Math.cos(spiral.angle) * spiral.radius;
        const y = cy + Math.sin(spiral.angle) * spiral.radius;
        spiral.history.push(x, y);
        if (spiral.history.length > maxHistory * 2) {
          spiral.history.splice(0, spiral.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.1 * (idx / spirals.length)})`;
        ctx.beginPath();
        const pts = spiral.history;
        for (let i = 0; i < pts.length; i += 2) {
          const px = pts[i];
          const py = pts[i + 1];
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      });

      ctx.strokeStyle = 'rgba(20,20,20,0.1)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(cx, cy, Math.min(width, height) * 0.18, 0, Math.PI * 2);
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
  themes: 'lambert-w,spiral,analytic',
  visualisation: 'Lambert W guided spirals unwind gently',
  promptSuggestion: '1. Watch analytic spirals unwrap\n2. Imagine Lambert W guiding the flow\n3. Let the unwinding steadiness calm you'
};
(LambertSpiralFlow as any).metadata = metadata;

export default LambertSpiralFlow;

// Differs from others by: Evaluates the Lambert W function numerically to steer spiral trajectories.

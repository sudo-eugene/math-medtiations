// Themes: differential spiral, analytic flow, gentle recursion
// Visualisation: Spirals traced by solving Riccati differential equations weave analytic loops
// Unique mechanism: Integrates multiple Riccati equations with varying coefficients to drive spiral trajectories
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Spiral {
  y: number;
  x: number;
  coeffs: { a: number; b: number; c: number };
  history: number[];
}

const RiccatiSpiralField: React.FC<VisualProps> = ({ width, height }) => {
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

    const spiralCount = 48;
    const spirals: Spiral[] = Array.from({ length: spiralCount }).map((_, i) => ({
      y: (i / spiralCount) * Math.PI * 2,
      x: 0,
      coeffs: {
        a: 0.3 + 0.2 * Math.sin(i * 0.4),
        b: -0.5 + 0.3 * Math.cos(i * 0.3),
        c: 0.6 + 0.1 * Math.sin(i * 0.6),
      },
      history: [],
    }));
    const maxHistory = 160;

    const dt = 0.016;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.18;

      for (let i = 0; i < spirals.length; i++) {
        const spiral = spirals[i];
        const { a, b, c } = spiral.coeffs;
        const dy = a + b * spiral.y + c * spiral.y * spiral.y;
        spiral.y += dy * dt;
        spiral.x += dt;
        const px = cx + Math.cos(spiral.y) * (scale + spiral.x * 14);
        const py = cy + Math.sin(spiral.y) * (scale + spiral.x * 14);
        spiral.history.push(px, py);
        if (spiral.history.length > maxHistory * 2) {
          spiral.history.splice(0, spiral.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.1 * (i / spirals.length)})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        const pts = spiral.history;
        for (let j = 0; j < pts.length; j += 2) {
          const x = pts[j];
          const y = pts[j + 1];
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();

        if (spiral.history.length >= maxHistory * 2) {
          spiral.history.splice(0, 2);
        }
        if (spiral.history.length === 0) {
          spiral.y = Math.random() * Math.PI * 2;
          spiral.x = 0;
        }
      }

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
  themes: 'riccati,spiral,analytic',
  visualisation: 'Riccati-driven spirals weave analytic loops',
  promptSuggestion: '1. Observe differential motion mapping loops\n2. Imagine equations guiding the spiral\n3. Let analytic flow relax you'
};
(RiccatiSpiralField as any).metadata = metadata;

export default RiccatiSpiralField;

// Differs from others by: Integrates Riccati differential equations with distinct coefficients to generate spiral trajectories.

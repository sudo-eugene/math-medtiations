// Themes: orthogonal bloom, smooth gradient, polynomial calm
// Visualisation: Gradient vectors derived from Hermite polynomials weave a garden of flow lines
// Unique mechanism: Computes a 2D vector field using Hermite polynomials and traces streamlines across the canvas
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const hermite = (n: number, x: number) => {
  if (n === 0) return 1;
  if (n === 1) return 2 * x;
  let Hnm2 = 1;
  let Hnm1 = 2 * x;
  for (let k = 2; k <= n; k++) {
    const Hn = 2 * x * Hnm1 - 2 * (k - 1) * Hnm2;
    Hnm2 = Hnm1;
    Hnm1 = Hn;
  }
  return Hnm1;
};

const HermiteGradientGarden: React.FC<VisualProps> = ({ width, height }) => {
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

    const streamCount = 240;
    const maxHistory = 60;
    const streams = Array.from({ length: streamCount }).map(() => ({
      x: width * Math.random(),
      y: height * Math.random(),
      history: [] as number[],
    }));

    const field = (x: number, y: number, t: number) => {
      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      const vx = hermite(3, nx + Math.sin(t)) + 0.6 * hermite(2, ny);
      const vy = hermite(2, ny + Math.cos(t * 0.8)) - 0.5 * hermite(1, nx);
      const norm = Math.hypot(vx, vy) || 1;
      return { vx: vx / norm, vy: vy / norm };
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0003;
      ctx.lineWidth = 0.75;
      for (let i = 0; i < streams.length; i++) {
        const stream = streams[i];
        const { vx, vy } = field(stream.x, stream.y, t);
        stream.x += vx * 14;
        stream.y += vy * 14;
        if (stream.x < width * 0.05 || stream.x > width * 0.95 || stream.y < height * 0.05 || stream.y > height * 0.95) {
          stream.x = width * Math.random();
          stream.y = height * Math.random();
          stream.history.length = 0;
        }
        stream.history.push(stream.x, stream.y);
        if (stream.history.length > maxHistory * 2) {
          stream.history.splice(0, stream.history.length - maxHistory * 2);
        }
        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.12 * (i / streams.length)})`;
        ctx.beginPath();
        const pts = stream.history;
        for (let j = 0; j < pts.length; j += 2) {
          const x = pts[j];
          const y = pts[j + 1];
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
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
  themes: 'hermite,gradient,garden',
  visualisation: 'Hermite polynomial gradients weave flowing streamlines',
  promptSuggestion: '1. Watch orthogonal polynomials guide flow\n2. Imagine analytic gradients breathing\n3. Let the garden of curves calm you'
};
(HermiteGradientGarden as any).metadata = metadata;

export default HermiteGradientGarden;

// Differs from others by: Constructs a vector field from Hermite polynomials and traces streamlines through it.

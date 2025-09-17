// Themes: phyllotaxis calm, spiral lattice, golden balance
// Visualisation: Points grow according to Fibonacci phyllotaxis, leaving trails that reveal golden spirals
// Unique mechanism: Evolves a phyllotaxis sequence with Fibonacci timing and trails each point along its growth path
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Seed {
  index: number;
  trail: number[];
}

const FibonacciPhylloField: React.FC<VisualProps> = ({ width, height }) => {
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

    const seeds: Seed[] = Array.from({ length: 320 }).map((_, i) => ({
      index: i,
      trail: [],
    }));
    const maxTrail = 80;
    const goldenAngle = Math.PI * (3 - Math.sqrt(5));

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      ctx.lineWidth = 0.8;

      for (let i = 0; i < seeds.length; i++) {
        const seed = seeds[i];
        const n = seed.index + t * 8;
        const angle = n * goldenAngle;
        const radius = Math.min(width, height) * 0.012 * Math.sqrt(n);
        const x = width / 2 + Math.cos(angle) * radius;
        const y = height / 2 + Math.sin(angle) * radius;
        seed.trail.push(x, y);
        if (seed.trail.length > maxTrail * 2) {
          seed.trail.splice(0, seed.trail.length - maxTrail * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.1 * (i / seeds.length)})`;
        ctx.beginPath();
        const pts = seed.trail;
        for (let p = 0; p < pts.length; p += 2) {
          const px = pts[p];
          const py = pts[p + 1];
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
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
  themes: 'fibonacci,phyllotaxis,spiral',
  visualisation: 'Fibonacci phyllotaxis points leave golden spiral trails',
  promptSuggestion: '1. Observe seeds unfolding as golden spirals\n2. Imagine growth timed by Fibonacci numbers\n3. Let natural arithmetic calm you'
};
(FibonacciPhylloField as any).metadata = metadata;

export default FibonacciPhylloField;

// Differs from others by: Evolves a Fibonacci phyllotaxis sequence with trailing paths to reveal golden spirals.

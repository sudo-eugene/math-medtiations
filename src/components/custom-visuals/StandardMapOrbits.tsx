// Themes: iterative harmony, torus calm, chaotic threads
// Visualisation: Standard map orbits trace threads on the torus, revealing gentle chaotic braids
// Unique mechanism: Iterates the Chirikov standard map for multiple seeds and renders their projected threads
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const TWO_PI = Math.PI * 2;

const StandardMapOrbits: React.FC<VisualProps> = ({ width, height }) => {
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

    const seeds = 48;
    const iterations = 420;
    const k = 0.65;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.75;
      for (let s = 0; s < seeds; s++) {
        let x = Math.random();
        let y = Math.random();
        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.1 * (s / seeds)})`;
        ctx.beginPath();
        for (let i = 0; i < iterations; i++) {
          y = (y + k * Math.sin(TWO_PI * x)) % 1;
          x = (x + y) % 1;
          if (x < 0) x += 1;
          if (y < 0) y += 1;
          const px = width * x;
          const py = height * y;
          if (i === 0) ctx.moveTo(px, py);
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
  themes: 'standard-map,orbits,braid',
  visualisation: 'Standard map iterates weave threads on the torus',
  promptSuggestion: '1. Watch iterative motion braid softly\n2. Imagine area-preserving flow whispering\n3. Let the torus threads calm you'
};
(StandardMapOrbits as any).metadata = metadata;

export default StandardMapOrbits;

// Differs from others by: Iterates the Chirikov standard map to generate orbit threads.

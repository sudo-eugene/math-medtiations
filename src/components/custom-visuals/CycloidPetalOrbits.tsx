// Themes: cycloid petals, looping breath, graceful rotation
// Visualisation: Cycloidal petals orbit the center, leaving layered cycloid trails
// Unique mechanism: Animates epitrochoid/cycloid parametric curves with varying rolling ratios to generate nested petals
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const CycloidPetalOrbits: React.FC<VisualProps> = ({ width, height }) => {
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

    const petals = 6;
    const samples = 360;
    const baseRadius = Math.min(width, height) * 0.18;
    const cx = width / 2;
    const cy = height / 2;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      ctx.lineWidth = 0.95;

      for (let p = 0; p < petals; p++) {
        const R = baseRadius * (1.4 + 0.1 * Math.sin(t + p));
        const r = baseRadius * (0.64 + 0.05 * Math.cos(t * 1.2 + p));
        const d = baseRadius * (0.8 + 0.1 * Math.sin(t * 0.7 + p * 1.3));
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + p * 0.06})`;
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
          const u = (i / samples) * Math.PI * 2;
          const x = (R + r) * Math.cos(u) - d * Math.cos(((R + r) / r) * u);
          const y = (R + r) * Math.sin(u) - d * Math.sin(((R + r) / r) * u);
          const px = cx + x;
          const py = cy + y;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(30,30,30,0.2)';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
      ctx.fill();

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
  themes: 'cycloid,petals,orbits',
  visualisation: 'Nested cycloid petals orbit with layered trails',
  promptSuggestion: '1. Watch cycloids write the petals\n2. Imagine gears rolling in air\n3. Let the looping motion quiet you'
};
(CycloidPetalOrbits as any).metadata = metadata;

export default CycloidPetalOrbits;

// Differs from others by: Uses epitrochoid/cycloid parametric equations with varying rolling ratios to form nested petals.

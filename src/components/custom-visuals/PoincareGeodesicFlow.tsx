// Themes: hyperbolic calm, geodesic arcs, reflective flow
// Visualisation: Arcs of geodesics in the Poincaré disk glide softly, weaving a meditative web
// Unique mechanism: Computes Poincaré disk geodesics between boundary points using Möbius transforms and animates their drift
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Geodesic {
  a: number;
  b: number;
  phase: number;
}

const PoincareGeodesicFlow: React.FC<VisualProps> = ({ width, height }) => {
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

    const geodesics: Geodesic[] = Array.from({ length: 36 }).map((_, i) => ({
      a: Math.random() * Math.PI * 2,
      b: Math.random() * Math.PI * 2,
      phase: i * 0.3,
    }));

    const cx = width / 2;
    const cy = height / 2;
    const radius = Math.min(width, height) * 0.42;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0003;
      ctx.lineWidth = 0.9;

      for (let i = 0; i < geodesics.length; i++) {
        const g = geodesics[i];
        const angleA = g.a + Math.sin(t + g.phase) * 0.3;
        const angleB = g.b + Math.cos(t * 1.2 + g.phase) * 0.3;
        const z1 = { x: Math.cos(angleA), y: Math.sin(angleA) };
        const z2 = { x: Math.cos(angleB), y: Math.sin(angleB) };

        if (Math.abs(z1.x * z2.y - z1.y * z2.x) < 1e-3) continue;

        const mid = {
          x: (z1.x + z2.x) / 2,
          y: (z1.y + z2.y) / 2,
        };
        const diff = {
          x: z2.x - z1.x,
          y: z2.y - z1.y,
        };
        const perp = { x: -diff.y, y: diff.x };
        const denom = 2 * (mid.x * perp.x + mid.y * perp.y);
        if (Math.abs(denom) < 1e-4) continue;
        const tCenter = (mid.x * mid.x + mid.y * mid.y - 1) / denom;
        const center = {
          x: mid.x + perp.x * tCenter,
          y: mid.y + perp.y * tCenter,
        };
        const r = Math.sqrt((center.x - z1.x) ** 2 + (center.y - z1.y) ** 2);

        const worldCenterX = cx + center.x * radius;
        const worldCenterY = cy + center.y * radius;
        const worldRadius = r * radius;

        const startAngle = Math.atan2(z1.y - center.y, z1.x - center.x);
        const endAngle = Math.atan2(z2.y - center.y, z2.x - center.x);

        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.12 * (i / geodesics.length)})`;
        ctx.beginPath();
        ctx.arc(worldCenterX, worldCenterY, worldRadius, startAngle, endAngle, false);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.12)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
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
  themes: 'poincare,geodesic,hyperbolic',
  visualisation: 'Poincaré disk geodesics drift softly',
  promptSuggestion: '1. Follow hyperbolic arcs meeting the boundary\n2. Imagine walking geodesics calmly\n3. Let the flowing disk steady you'
};
(PoincareGeodesicFlow as any).metadata = metadata;

export default PoincareGeodesicFlow;

// Differs from others by: Computes hyperbolic geodesics in the Poincaré disk using Möbius-derived circle centers and animates their drift.

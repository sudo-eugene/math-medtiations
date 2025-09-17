// Themes: divergence-free flow, curling breath, layered sheets
// Visualisation: Curl-derived vector fields drive translucent sheets that drift in parallel ribbons
// Unique mechanism: Advects ribbon trails along a divergence-free field generated from analytic curl noise
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Ribbon {
  points: number[];
  speed: number;
  shade: number;
  offset: number;
}

const CurlDriftSheets: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0xb028d3f1);
    const ribbons: Ribbon[] = Array.from({ length: 28 }).map(() => {
      const x = width * (0.2 + rng() * 0.6);
      const y = height * (0.2 + rng() * 0.6);
      return {
        points: [x, y],
        speed: 1.2 + rng() * 0.8,
        shade: 0.03 + rng() * 0.04,
        offset: rng() * Math.PI * 2,
      };
    });

    const maxPoints = 120;

    const fieldAt = (x: number, y: number, time: number) => {
      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      const phase1 = nx * 1.7 + ny * -1.2 + time * 0.0004;
      const phase2 = nx * -1.1 + ny * 1.9 + time * 0.0006;
      const psi1 = Math.sin(phase1);
      const psi2 = Math.cos(phase2);
      const dPsiDx = 1.7 * Math.cos(phase1) + 1.1 * Math.sin(phase2) * 0.6;
      const dPsiDy = -1.2 * Math.cos(phase1) - 1.9 * Math.sin(phase2) * 0.6;
      const vx = dPsiDy + psi2 * 0.4;
      const vy = -dPsiDx + psi1 * 0.4;
      return { vx, vy };
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < ribbons.length; i++) {
        const ribbon = ribbons[i];
        const lastIndex = ribbon.points.length - 2;
        let x = ribbon.points[lastIndex];
        let y = ribbon.points[lastIndex + 1];
        const flow = fieldAt(x, y, time + ribbon.offset * 1000);
        const mag = Math.hypot(flow.vx, flow.vy) + 1e-6;
        x += (flow.vx / mag) * ribbon.speed;
        y += (flow.vy / mag) * ribbon.speed;

        if (x < width * 0.05 || x > width * 0.95 || y < height * 0.05 || y > height * 0.95) {
          x = width * (0.1 + rng() * 0.8);
          y = height * (0.1 + rng() * 0.8);
          ribbon.points.length = 0;
        }

        ribbon.points.push(x, y);
        if (ribbon.points.length > maxPoints * 2) {
          ribbon.points.splice(0, ribbon.points.length - maxPoints * 2);
        }

        const pts = ribbon.points;
        ctx.strokeStyle = `rgba(30,30,30,${ribbon.shade})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let p = 2; p < pts.length; p += 2) {
          ctx.lineTo(pts[p], pts[p + 1]);
        }
        ctx.stroke();

        ctx.strokeStyle = 'rgba(20,20,20,0.06)';
        ctx.lineWidth = 2.8;
        ctx.beginPath();
        for (let p = 0; p < pts.length - 2; p += 6) {
          ctx.moveTo((pts[p] + pts[p + 2]) * 0.5, (pts[p + 1] + pts[p + 3]) * 0.5);
          ctx.lineTo(pts[p + 2], pts[p + 3]);
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
  themes: 'curl,flow,ribbons',
  visualisation: 'Ribbons drift along a divergence-free curl flow',
  promptSuggestion: '1. Follow the curl gently guiding sheets\n2. Sense a field with no beginning or end\n3. Imagine breath sliding along ribbons'
};
(CurlDriftSheets as any).metadata = metadata;

export default CurlDriftSheets;

// Differs from others by: Advection is driven by an analytic curl-derived vector field producing layered sheets.

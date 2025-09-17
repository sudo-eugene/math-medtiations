// Themes: radial warmth, concentric calm, gentle diffusion
// Visualisation: Concentric arcs glow as heat diffuses through a polar lattice
// Unique mechanism: Simulates heat diffusion on a polar grid with radial and angular coupling driving luminance
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const PolarHeatBloom: React.FC<VisualProps> = ({ width, height }) => {
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

    const rings = 64;
    const sectors = 48;
    const temperatures = new Float32Array(rings * sectors);
    const nextTemps = new Float32Array(rings * sectors);

    const idx = (r: number, s: number) => {
      const rr = Math.max(0, Math.min(rings - 1, r));
      const ss = (s + sectors) % sectors;
      return rr * sectors + ss;
    };

    const inject = (time: number) => {
      const phase = Math.floor(time / 1600) % sectors;
      for (let r = 0; r < rings; r++) {
        const offset = Math.floor(Math.sin(time * 0.0003 + r * 0.1) * 4);
        temperatures[idx(r, phase + offset)] += 0.9 * Math.exp(-r * 0.03);
      }
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      inject(time);

      for (let r = 0; r < rings; r++) {
        for (let s = 0; s < sectors; s++) {
          const current = temperatures[idx(r, s)];
          const radialIn = temperatures[idx(r - 1, s)];
          const radialOut = temperatures[idx(r + 1, s)];
          const angularL = temperatures[idx(r, s - 1)];
          const angularR = temperatures[idx(r, s + 1)];
          const lap = radialIn + radialOut + angularL + angularR - 4 * current;
          const diffusion = 0.18 + 0.06 * (r / rings);
          nextTemps[idx(r, s)] = current + lap * diffusion;
        }
      }

      for (let i = 0; i < temperatures.length; i++) {
        temperatures[i] = nextTemps[i] * 0.965;
      }

      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(width, height) * 0.45;
      const ringStep = maxRadius / rings;
      const angleStep = (Math.PI * 2) / sectors;

      for (let r = 0; r < rings; r++) {
        const inner = r * ringStep;
        const outer = inner + ringStep * 0.95;
        for (let s = 0; s < sectors; s++) {
          const t = temperatures[idx(r, s)];
          const alpha = Math.min(0.25, Math.abs(t) * 0.35);
          if (alpha < 0.01) continue;
          const start = s * angleStep;
          const end = start + angleStep * 0.92;
          ctx.beginPath();
          ctx.arc(cx, cy, outer, start, end, false);
          ctx.arc(cx, cy, inner, end, start, true);
          ctx.closePath();
          ctx.fillStyle = `rgba(30,30,30,${alpha})`;
          ctx.fill();
        }
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.08)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(cx, cy, maxRadius, 0, Math.PI * 2);
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
  themes: 'heat,diffusion,polar',
  visualisation: 'Heat diffuses across concentric polar bands',
  promptSuggestion: '1. Watch warmth settle through the rings\n2. Imagine each arc exhaling slowly\n3. Let your attention follow the gentle bloom'
};
(PolarHeatBloom as any).metadata = metadata;

export default PolarHeatBloom;

// Differs from others by: Simulates a heat equation directly on a polar grid with radial and angular coupling to drive luminance.

// Themes: orthogonal harmony, ribbon calm, polynomial drift
// Visualisation: Flow ribbons follow a field shaped by Legendre polynomials, weaving orthogonal patterns
// Unique mechanism: Evaluates Legendre polynomials to construct a vector field and advects ribbons along its streamlines
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const LegendreRibbonField: React.FC<VisualProps> = ({ width, height }) => {
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

    const ribbons = 32;
    const segments = 160;
    const points = new Float32Array(ribbons * segments * 2);

    const legendre = (n: number, x: number): number => {
      if (n === 0) return 1;
      if (n === 1) return x;
      let p0 = 1;
      let p1 = x;
      for (let k = 2; k <= n; k++) {
        const pk = ((2 * k - 1) * x * p1 - (k - 1) * p0) / k;
        p0 = p1;
        p1 = pk;
      }
      return p1;
    };

    const field = (x: number, y: number, t: number) => {
      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      const px = legendre(4, nx);
      const py = legendre(5, ny);
      const qx = legendre(3, ny);
      const qy = legendre(2, nx);
      const vx = px - qx + 0.4 * Math.sin(t + ny * 2.4);
      const vy = py + qy + 0.4 * Math.cos(t + nx * 2.1);
      return { vx, vy };
    };

    const initRibbon = (i: number) => {
      const offset = (i / (ribbons - 1)) * 2 - 1;
      for (let s = 0; s < segments; s++) {
        const idx = (i * segments + s) * 2;
        points[idx] = width * 0.5 + offset * width * 0.4;
        points[idx + 1] = height * (0.15 + s / segments * 0.7);
      }
    };

    for (let i = 0; i < ribbons; i++) {
      initRibbon(i);
    }

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      for (let i = 0; i < ribbons; i++) {
        for (let s = segments - 1; s > 0; s--) {
          const idx = (i * segments + s) * 2;
          const prevIdx = (i * segments + s - 1) * 2;
          points[idx] = points[prevIdx];
          points[idx + 1] = points[prevIdx + 1];
        }
        const headIdx = i * segments * 2;
        const x = points[headIdx];
        const y = points[headIdx + 1];
        const vel = field(x, y, t);
        points[headIdx] = x + vel.vx * 0.9;
        points[headIdx + 1] = y + vel.vy * 0.9;
      }

      ctx.lineWidth = 1;
      for (let i = 0; i < ribbons; i++) {
        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.12 * (i / ribbons)})`;
        ctx.beginPath();
        for (let s = 0; s < segments; s++) {
          const idx = (i * segments + s) * 2;
          const x = points[idx];
          const y = points[idx + 1];
          if (s === 0) ctx.moveTo(x, y);
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
  themes: 'legendre,ribbons,flow',
  visualisation: 'Legendre polynomial field guides flowing ribbons',
  promptSuggestion: '1. Follow polynomial currents folding\n2. Imagine orthogonal harmonies weaving\n3. Let the ribbons guide a slow breath'
};
(LegendreRibbonField as any).metadata = metadata;

export default LegendreRibbonField;

// Differs from others by: Generates a vector field from Legendre polynomials and advects ribbon streamlines through it.

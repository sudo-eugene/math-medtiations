// Themes: chaotic map, nebula, ink dust
// Visualisation: A drifting nebula from the Ikeda map orbit cloud
// Unique mechanism: Ikeda map iteration with slow parameterized angle producing swirling scatter

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Particle {
  x: number;
  y: number;
  phase: number;
  drift: number;
}

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const IkedaMapNebula: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x57c29b41);
    const cx = width * 0.25;
    const cy = height * 0.65;
    const scale = Math.min(width, height) * 0.34;

    const particleCount = 1800;
    const particles: Particle[] = Array.from({ length: particleCount }).map(() => ({
      x: (rng() * 2 - 1) * 0.2,
      y: (rng() * 2 - 1) * 0.2,
      phase: rng() * Math.PI * 2,
      drift: rng() * 6.2831
    }));

    const reseed = (p: Particle) => {
      p.x = (rng() * 2 - 1) * 0.25;
      p.y = (rng() * 2 - 1) * 0.25;
    };

    const iterateIkeda = (px: number, py: number, time: number, phase: number) => {
      const u = 0.88 + 0.05 * Math.sin(time * 0.25 + phase);
      const r2 = px * px + py * py;
      const T = 0.4 - 6.0 / (1.0 + r2);
      const sinT = Math.sin(T);
      const cosT = Math.cos(T);
      const xn = 1 + u * (px * cosT - py * sinT);
      const yn = u * (px * sinT + py * cosT);
      return { x: xn, y: yn };
    };

    const render = (t: number) => {
      const time = t * 0.001;

      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      particles.forEach((p, idx) => {
        let x = p.x;
        let y = p.y;

        for (let step = 0; step < 3; step++) {
          const next = iterateIkeda(x, y, time, p.phase + step * 0.2);
          x = next.x;
          y = next.y;
        }

        if (x * x + y * y > 9) {
          reseed(p);
          return;
        }

        p.x = x;
        p.y = y;

        const px = cx + x * scale;
        const py = cy + y * scale;
        if (px < -40 || px > width + 40 || py < -40 || py > height + 40) {
          reseed(p);
          return;
        }

        const dist = Math.sqrt(x * x + y * y);
        const breathing = Math.sin(time * 1.1 + p.drift) * 0.25 + 0.8;
        const radius = 1.3 + Math.max(0.35, 1.9 * (1 / (1 + dist * dist))) * breathing;
        const tone = 86 + Math.min(24, 22 / (1 + dist * 0.6));
        const alpha = 0.1 + 0.24 * (1 / (1 + dist * 0.5));

        const outer = ctx.createRadialGradient(px, py, 0, px, py, radius * 1.6);
        outer.addColorStop(0, `rgba(${tone}, ${tone}, ${tone}, ${alpha * 0.55})`);
        outer.addColorStop(1, `rgba(${tone}, ${tone}, ${tone}, 0)`);

        ctx.fillStyle = outer;
        ctx.beginPath();
        ctx.arc(px, py, radius * 1.6, 0, Math.PI * 2);
        ctx.fill();

        const core = ctx.createRadialGradient(px, py, 0, px, py, radius * 0.75);
        core.addColorStop(0, `rgba(${tone - 12}, ${tone - 12}, ${tone - 12}, ${alpha * 1.6})`);
        core.addColorStop(1, `rgba(${tone - 12}, ${tone - 12}, ${tone - 12}, 0)`);

        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      });

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
  themes: 'ikeda map, chaotic nebula, ink dust, gentle bloom',
  visualisation: 'Swirling nebula from Ikeda map scatter rendered as soft breathing glows',
  promptSuggestion: '1. Adjust iteration density\n2. Vary u modulation\n3. Tune glow softness'
};
(IkedaMapNebula as any).metadata = metadata;

export default IkedaMapNebula;

// Differs from others by: Projects Ikeda map dynamics into a breathing neutral-toned particle nebula


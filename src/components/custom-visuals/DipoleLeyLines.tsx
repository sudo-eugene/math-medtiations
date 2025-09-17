// Themes: geomantic currents, magnetic hush, patient exploration
// Visualisation: Flowing ink lines tracing magnetic field curves drifting across the parchment
// Unique mechanism: Field line integration around oscillating dipole sources with seeded streamlines
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Dipole {
  x: number;
  y: number;
  angle: number;
  strength: number;
  wobble: number;
}

interface StreamSeed {
  baseAngle: number;
  radius: number;
  speed: number;
  step: number;
  shade: number;
}

const DipoleLeyLines: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x15ab43dd);

    const dipoles: Dipole[] = Array.from({ length: 4 }).map((_, i) => ({
      x: width * (0.25 + 0.2 * i) + rng() * width * 0.1,
      y: height * (0.3 + 0.15 * i) + rng() * height * 0.1,
      angle: rng() * Math.PI * 2,
      strength: 0.6 + rng() * 0.8,
      wobble: 0.2 + rng() * 0.15,
    }));

    const seeds: StreamSeed[] = Array.from({ length: 170 }, () => ({
      baseAngle: rng() * Math.PI * 2,
      radius: Math.min(width, height) * (0.18 + rng() * 0.38),
      speed: 0.0002 + rng() * 0.0005,
      step: 2.8 + rng() * 1.2,
      shade: 0.04 + rng() * 0.04,
    }));

    const fieldAt = (x: number, y: number) => {
      let fx = 0;
      let fy = 0;
      for (const dipole of dipoles) {
        const dx = x - dipole.x;
        const dy = y - dipole.y;
        const r2 = dx * dx + dy * dy + 40;
        const invR4 = 1 / (r2 * r2);
        const mdx = Math.cos(dipole.angle);
        const mdy = Math.sin(dipole.angle);
        const dot = dx * mdx + dy * mdy;
        fx += dipole.strength * ((3 * dot * dx - r2 * mdx) * invR4);
        fy += dipole.strength * ((3 * dot * dy - r2 * mdy) * invR4);
      }
      return { x: fx, y: fy };
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      dipoles.forEach((dipole, idx) => {
        dipole.angle += 0.0006 + dipole.wobble * 0.0004 * Math.sin(time * 0.0001 + idx);
      });

      ctx.lineWidth = 0.8;

      for (let i = 0; i < seeds.length; i++) {
        const seed = seeds[i];
        const angle = seed.baseAngle + time * seed.speed;
        let px = width / 2 + Math.cos(angle) * seed.radius;
        let py = height / 2 + Math.sin(angle) * seed.radius;

        ctx.beginPath();
        ctx.moveTo(px, py);

        for (let step = 0; step < 90; step++) {
          const f = fieldAt(px, py);
          const mag = Math.hypot(f.x, f.y) + 1e-6;
          px += (f.x / mag) * seed.step;
          py += (f.y / mag) * seed.step;

          if (px < -50 || px > width + 50 || py < -50 || py > height + 50) {
            break;
          }
          if (step % 3 === 0) {
            ctx.lineTo(px, py);
          }
        }

        ctx.strokeStyle = `rgba(30,30,30,${seed.shade + 0.015 * Math.sin(i * 0.7 + time * 0.0004)})`;
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
  themes: 'geomancy,field-lines,magnetism',
  visualisation: 'Magnetic field streamlines breathing across parchment',
  promptSuggestion: '1. Contemplate energy currents becoming visible\n2. Envision dipoles tracing whispered ley lines\n3. Follow invisible magnetism with ink ribbons'
};
(DipoleLeyLines as any).metadata = metadata;

export default DipoleLeyLines;

// Differs from others by: Field line integration around oscillating dipoles drives every stroke so no other visual uses a magnetic streamline solver.

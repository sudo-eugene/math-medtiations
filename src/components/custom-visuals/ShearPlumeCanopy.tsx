// Themes: layered breeze, gentle ascent, meditative shear
// Visualisation: Ink plumes drift in layered shear flows, forming a soft canopy of parallel ribbons
// Unique mechanism: Particles advected by a two-layer shear velocity field with vertical buoyancy and adaptive respawn bands
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface PlumeParticle {
  x: number;
  y: number;
  layer: number;
  life: number;
}

const ShearPlumeCanopy: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x7d11cc09);
    const particleCount = 520;
    const particles: PlumeParticle[] = Array.from({ length: particleCount }).map(() => ({
      x: width * rng(),
      y: height * (0.1 + rng() * 0.3),
      layer: rng() < 0.5 ? 0 : 1,
      life: 0.5 + rng() * 0.5,
    }));

    const reset = (p: PlumeParticle) => {
      p.x = width * (0.1 + rng() * 0.8);
      p.y = height * (0.05 + rng() * 0.15);
      p.layer = rng() < 0.6 ? 0 : 1;
      p.life = 0.4 + rng() * 0.6;
    };

    const field = (x: number, y: number, layer: number, t: number) => {
      const normalizedY = y / height;
      const baseShear = layer === 0 ? 0.25 : -0.18;
      const shearWave = Math.sin(normalizedY * 6 + t * 0.0008) * (layer === 0 ? 0.35 : 0.25);
      const buoyancy = 0.12 + 0.15 * Math.sin(t * 0.0006 + normalizedY * 5.2);
      const mod = 0.4 * Math.sin(x * 0.01 + t * 0.0004);
      return {
        vx: (baseShear + shearWave + mod) * width * 0.0025,
        vy: -buoyancy * height * 0.0018
      };
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const vel = field(p.x, p.y, p.layer, time);
        const drift = (p.layer === 0 ? 1 : -1) * 0.3;
        const px = p.x;
        const py = p.y;
        p.x += vel.vx + drift;
        p.y += vel.vy;
        p.life -= 0.0018;

        ctx.strokeStyle = `rgba(25,25,25,${0.05 + (p.layer === 0 ? 0.05 : 0.03)})`;
        ctx.lineWidth = p.layer === 0 ? 1.1 : 0.8;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        if (p.y < -40 || p.x < -60 || p.x > width + 60 || p.life <= 0) {
          reset(p);
        }
      }

      // draw layer separators
      ctx.strokeStyle = 'rgba(30,30,30,0.1)';
      ctx.lineWidth = 1;
      for (let i = 1; i <= 3; i++) {
        const y = (i / 4) * height;
        ctx.beginPath();
        ctx.moveTo(0, y + Math.sin(time * 0.0007 + i) * 6);
        ctx.lineTo(width, y + Math.sin(time * 0.0007 + i) * 6);
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
  themes: 'shear,plumes,layers',
  visualisation: 'Layered shear flow produces drifting ink plumes',
  promptSuggestion: '1. Watch layers slide gently past each other\n2. Imagine slow breezes combing the canopy\n3. Follow each plume rising to stillness'
};
(ShearPlumeCanopy as any).metadata = metadata;

export default ShearPlumeCanopy;

// Differs from others by: Advects particles through a two-layer shear velocity field with vertical buoyancy to create layered plumes.

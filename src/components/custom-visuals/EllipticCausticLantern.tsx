// Themes: lantern caustics, reflective calm, orbital focus
// Visualisation: Trailing particles bounce within an ellipse, weaving luminous caustics toward the foci
// Unique mechanism: Simulates elastic billiard reflections inside an ellipse with analytic normal reflection for each particle
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface BilliardParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: number[];
}

const EllipticCausticLantern: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x3f19ab82);
    const particleCount = 32;
    const semiMajor = Math.min(width, height) * 0.4;
    const semiMinor = semiMajor * 0.62;
    const centerX = width / 2;
    const centerY = height / 2;

    const particles: BilliardParticle[] = Array.from({ length: particleCount }).map(() => {
      const theta = rng() * Math.PI * 2;
      const r = Math.sqrt(rng()) * 0.9;
      const x = centerX + Math.cos(theta) * semiMajor * r;
      const y = centerY + Math.sin(theta) * semiMinor * r;
      const angle = rng() * Math.PI * 2;
      const speed = 1.2 + rng() * 0.6;
      return {
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        trail: []
      };
    });

    const maxTrail = 50;

    const normalize = (x: number, y: number) => {
      const len = Math.hypot(x, y) || 1;
      return { x: x / len, y: y / len };
    };

    const reflectIfNeeded = (p: BilliardParticle) => {
      const localX = p.x - centerX;
      const localY = p.y - centerY;
      const value = (localX * localX) / (semiMajor * semiMajor) + (localY * localY) / (semiMinor * semiMinor);
      if (value <= 1) return;
      const nx = localX / (semiMajor * semiMajor);
      const ny = localY / (semiMinor * semiMinor);
      const n = normalize(nx, ny);
      const dot = p.vx * n.x + p.vy * n.y;
      p.vx -= 2 * dot * n.x;
      p.vy -= 2 * dot * n.y;
      const scale = 1 / Math.sqrt(value);
      p.x = centerX + localX * scale * 0.995;
      p.y = centerY + localY * scale * 0.995;
    };

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        reflectIfNeeded(p);
        p.trail.push(p.x, p.y);
        if (p.trail.length > maxTrail * 2) p.trail.splice(0, p.trail.length - maxTrail * 2);

        const alpha = 0.04 + (i / particles.length) * 0.1;
        ctx.strokeStyle = `rgba(30,30,30,${alpha})`;
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        const pts = p.trail;
        for (let j = 0; j < pts.length; j += 2) {
          const x = pts[j];
          const y = pts[j + 1];
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.lineWidth = 1.6;
      ctx.strokeStyle = 'rgba(20,20,20,0.4)';
      ctx.beginPath();
      ctx.ellipse(centerX, centerY, semiMajor, semiMinor, 0, 0, Math.PI * 2);
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
  themes: 'ellipse,caustic,billiard',
  visualisation: 'Elliptical billiard trails form luminous caustics',
  promptSuggestion: '1. Follow each path kissing the ellipse\n2. Picture light reflecting in a lantern\n3. Settle into the focus of their motion'
};
(EllipticCausticLantern as any).metadata = metadata;

export default EllipticCausticLantern;

// Differs from others by: Simulates elliptical billiard dynamics with analytic normal reflections to draw caustic trails.

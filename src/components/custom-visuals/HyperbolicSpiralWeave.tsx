// Themes: hyperbolic calm, spiral weave, expanding breath
// Visualisation: Trails weave along hyperbolic spiral fields, forming layered coils
// Unique mechanism: Drives particle motion using vector fields derived from hyperbolic sine/cosine spiral equations
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface CoilParticle {
  x: number;
  y: number;
  life: number;
  speed: number;
}

const HyperbolicSpiralWeave: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x4a1dc377);
    const particleCount = 360;
    const particles: CoilParticle[] = Array.from({ length: particleCount }).map(() => ({
      x: width * (0.2 + rng() * 0.6),
      y: height * (0.2 + rng() * 0.6),
      life: 0.5 + rng() * 0.8,
      speed: 0.6 + rng() * 0.5,
    }));

    const centerX = width / 2;
    const centerY = height / 2;

    const field = (x: number, y: number, t: number) => {
      const dx = (x - centerX) / Math.max(width, 1);
      const dy = (y - centerY) / Math.max(height, 1);
      const r = Math.hypot(dx, dy) + 1e-4;
      const angle = Math.atan2(dy, dx);
      const hyper = Math.sinh(r * 2 + Math.sin(t * 0.6)) * 0.6;
      const radial = Math.cosh(r * 1.4) * 0.3;
      const vx = -Math.sin(angle) * hyper + Math.cos(angle) * radial;
      const vy = Math.cos(angle) * hyper + Math.sin(angle) * radial;
      return { vx, vy };
    };

    const reset = (p: CoilParticle) => {
      const radius = Math.min(width, height) * (0.18 + rng() * 0.3);
      const angle = rng() * Math.PI * 2;
      p.x = centerX + Math.cos(angle) * radius;
      p.y = centerY + Math.sin(angle) * radius;
      p.life = 0.5 + rng() * 0.8;
      p.speed = 0.6 + rng() * 0.5;
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      ctx.lineWidth = 1.05;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const vel = field(p.x, p.y, t);
        const px = p.x;
        const py = p.y;
        p.x += vel.vx * p.speed * 16;
        p.y += vel.vy * p.speed * 16;
        p.life -= 0.002;

        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.12 * Math.min(1, p.speed)})`;
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();

        if (p.life <= 0 || p.x < -50 || p.x > width + 50 || p.y < -50 || p.y > height + 50) {
          reset(p);
        }
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.1)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, Math.min(width, height) * 0.28, 0, Math.PI * 2);
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
  themes: 'hyperbolic,spiral,weave',
  visualisation: 'Hyperbolic spiral fields weave flowing trails',
  promptSuggestion: '1. Imagine spirals made from hyperbolic cloth\n2. Watch the coils unfurl around center\n3. Let the weaving motion slow your thoughts'
};
(HyperbolicSpiralWeave as any).metadata = metadata;

export default HyperbolicSpiralWeave;

// Differs from others by: Uses hyperbolic sine/cosine-based vector fields to drive spiral particle trajectories.

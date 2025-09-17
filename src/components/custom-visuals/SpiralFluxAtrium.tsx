// Themes: spiral sanctuary, converging breath, quiet magnetism
// Visualisation: Delicate ink particles stream along inward spirals forming a breathing atrium pattern
// Unique mechanism: Integrates particle motion along a logarithmic spiral vector field with time-shifted scaling
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Particle {
  x: number;
  y: number;
  life: number;
  speed: number;
  phase: number;
}

const SpiralFluxAtrium: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x8c3adf12);
    const particleCount = 420;
    const particles: Particle[] = Array.from({ length: particleCount }).map(() => ({
      x: width * (0.3 + rng() * 0.4),
      y: height * (0.3 + rng() * 0.4),
      life: 0.3 + rng() * 0.7,
      speed: 0.8 + rng() * 0.7,
      phase: rng() * Math.PI * 2,
    }));

    const centerX = width / 2;
    const centerY = height / 2;

    const spiralField = (x: number, y: number, t: number) => {
      const dx = x - centerX;
      const dy = y - centerY;
      const r = Math.hypot(dx, dy) + 1e-3;
      const logFactor = Math.log(r + 1) * 0.4;
      const theta = Math.atan2(dy, dx);
      const angle = theta + 0.4 + 0.2 * Math.sin(t * 0.0003 + r * 0.004);
      const radiusPull = -0.18 * r;
      const vx = Math.cos(angle) * (0.4 + logFactor) + radiusPull * (dx / r);
      const vy = Math.sin(angle) * (0.4 + logFactor) + radiusPull * (dy / r);
      return { vx, vy };
    };

    const resetParticle = (p: Particle) => {
      const radius = Math.min(width, height) * (0.18 + rng() * 0.3);
      const angle = rng() * Math.PI * 2;
      p.x = centerX + Math.cos(angle) * radius;
      p.y = centerY + Math.sin(angle) * radius;
      p.life = 0.3 + rng() * 0.7;
      p.speed = 0.8 + rng() * 0.7;
      p.phase = rng() * Math.PI * 2;
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.9;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const field = spiralField(p.x, p.y, time);
        p.x += field.vx * p.speed;
        p.y += field.vy * p.speed;
        p.life -= 0.0025;

        const twirl = 0.6 + 0.4 * Math.sin(time * 0.0006 + p.phase);
        ctx.strokeStyle = `rgba(25,25,25,${0.08 + 0.12 * twirl})`;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - field.vx * 4, p.y - field.vy * 4);
        ctx.stroke();

        if (p.life <= 0 || p.x < -40 || p.x > width + 40 || p.y < -40 || p.y > height + 40) {
          resetParticle(p);
        }
      }

      ctx.strokeStyle = 'rgba(30,30,30,0.12)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      const petals = 8;
      const radius = Math.min(width, height) * 0.26 * (1 + 0.04 * Math.sin(time * 0.0004));
      for (let i = 0; i < petals; i++) {
        const angle = (i / petals) * Math.PI * 2 + time * 0.0001;
        const targetX = centerX + Math.cos(angle) * radius;
        const targetY = centerY + Math.sin(angle) * radius;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(targetX, targetY);
      }
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
  themes: 'spiral,flux,meditation',
  visualisation: 'Particles follow logarithmic spirals in a calm atrium',
  promptSuggestion: '1. Imagine descending a spiral sanctuary\n2. Watch currents converge softly at center\n3. Balance your breath with the rotating field'
};
(SpiralFluxAtrium as any).metadata = metadata;

export default SpiralFluxAtrium;

// Differs from others by: Uses a logarithmic spiral vector field with radial damping to advect particles inward.

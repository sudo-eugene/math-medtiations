// Themes: orbital dust, conserved calm, symplectic motion
// Visualisation: Dust loops orbit in conserved patterns using a symplectic integrator, leaving faint trails
// Unique mechanism: Evolves particles under a Hamiltonian system using a symplectic Euler integrator to conserve loop energy
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: number[];
}

const SymplecticLoopDust: React.FC<VisualProps> = ({ width, height }) => {
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

    const particleCount = 80;
    const particles: Particle[] = Array.from({ length: particleCount }).map((_, i) => {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = Math.min(width, height) * (0.18 + 0.12 * Math.sin(i));
      return {
        x: width / 2 + Math.cos(angle) * radius,
        y: height / 2 + Math.sin(angle) * radius,
        vx: -Math.sin(angle) * 0.6,
        vy: Math.cos(angle) * 0.6,
        trail: [],
      };
    });
    const maxTrail = 140;

    const potential = (x: number, y: number) => {
      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      return 0.5 * (nx * nx + ny * ny) + 0.3 * Math.sin(nx * 3) * Math.cos(ny * 4);
    };

    const gradient = (x: number, y: number) => {
      const h = 0.002 * Math.max(width, height);
      const px = (potential(x + h, y) - potential(x - h, y)) / (2 * h);
      const py = (potential(x, y + h) - potential(x, y - h)) / (2 * h);
      return { px, py };
    };

    const dt = 0.6;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const grad = gradient(p.x, p.y);
        p.vx -= grad.px * dt;
        p.vy -= grad.py * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;

        const dx = p.x - width / 2;
        const dy = p.y - height / 2;
        const rad = Math.hypot(dx, dy);
        if (rad > Math.min(width, height) * 0.45) {
          p.x = width / 2 + (dx / rad) * Math.min(width, height) * 0.45;
          p.y = height / 2 + (dy / rad) * Math.min(width, height) * 0.45;
          p.vx *= -0.8;
          p.vy *= -0.8;
        }

        p.trail.push(p.x, p.y);
        if (p.trail.length > maxTrail * 2) {
          p.trail.splice(0, p.trail.length - maxTrail * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.1 * (i / particles.length)})`;
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

      ctx.strokeStyle = 'rgba(20,20,20,0.1)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.45, 0, Math.PI * 2);
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
  themes: 'symplectic,loop,dust',
  visualisation: 'Symplectic integration keeps dust loops in tune',
  promptSuggestion: '1. Watch conserved orbits drift\n2. Imagine the dust staying in balance\n3. Let the precise motion reassure you'
};
(SymplecticLoopDust as any).metadata = metadata;

export default SymplecticLoopDust;

// Differs from others by: Evolves particles with a symplectic Euler integrator under a Hamiltonian potential to conserve loop energy.

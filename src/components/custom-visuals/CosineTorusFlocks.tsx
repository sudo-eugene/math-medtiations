// Themes: toroidal flock, harmonic drift, spatial resonance
// Visualisation: Particle flocks orbit a torus following cosine-modulated flows, creating layered torus bands
// Unique mechanism: Samples a torus surface and advects particles using cosine-modulated velocities while staying on the torus
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Particle {
  u: number;
  v: number;
  trail: number[];
}

const CosineTorusFlocks: React.FC<VisualProps> = ({ width, height }) => {
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

    const particleCount = 160;
    const particles: Particle[] = Array.from({ length: particleCount }).map(() => ({
      u: Math.random() * Math.PI * 2,
      v: Math.random() * Math.PI * 2,
      trail: [],
    }));
    const maxTrail = 80;

    const major = Math.min(width, height) * 0.25;
    const minor = major * 0.42;

    const project = (u: number, v: number) => {
      const x = (major + minor * Math.cos(v)) * Math.cos(u);
      const y = (major + minor * Math.cos(v)) * Math.sin(u);
      const z = minor * Math.sin(v);
      return {
        x: width / 2 + x,
        y: height / 2 + z * 0.8,
      };
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      ctx.lineWidth = 0.9;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const du = 0.6 * Math.cos(p.v + t) + 0.2 * Math.sin(t * 1.4 + i * 0.1);
        const dv = 0.4 * Math.sin(p.u - t * 1.2) + 0.3 * Math.sin(t * 0.9 + i * 0.2);
        p.u += du * 0.02;
        p.v += dv * 0.02;
        const point = project(p.u, p.v);
        p.trail.push(point.x, point.y);
        if (p.trail.length > maxTrail * 2) {
          p.trail.splice(0, p.trail.length - maxTrail * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.12 * (i / particles.length)})`;
        ctx.beginPath();
        const pts = p.trail;
        for (let k = 0; k < pts.length; k += 2) {
          const x = pts[k];
          const y = pts[k + 1];
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.1)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, major + minor, minor * 0.8, 0, 0, Math.PI * 2);
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
  themes: 'torus,flock,cosine',
  visualisation: 'Cosine-modulated flocks orbit along a torus projection',
  promptSuggestion: '1. Watch torus bands whisper past each other\n2. Imagine flocks drifting around a ring\n3. Let their shared rhythm calm you'
};
(CosineTorusFlocks as any).metadata = metadata;

export default CosineTorusFlocks;

// Differs from others by: Keeps particles constrained to a torus and advects them with cosine-modulated velocities creating layered bands.

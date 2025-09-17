// Themes: vortex calm, alternating flow, fluid resonance
// Visualisation: Particles advect along an analytic von Kármán vortex street, leaving alternating swirls
// Unique mechanism: Uses a simplified von Kármán vortex street velocity field to advect particles through alternating vortices
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Particle {
  x: number;
  y: number;
  history: number[];
}

const VonKarmanVortexStreet: React.FC<VisualProps> = ({ width, height }) => {
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

    const particles: Particle[] = Array.from({ length: 220 }).map(() => ({
      x: Math.random() * width,
      y: height * (0.3 + Math.random() * 0.4),
      history: []
    }));
    const maxHistory = 100;

    const vortices = Array.from({ length: 14 }).map((_, i) => ({
      x: width * 0.15 + i * width * 0.07,
      y: height * (i % 2 === 0 ? 0.42 : 0.58),
      strength: (i % 2 === 0 ? 1 : -1) * 2400,
    }));

    const velocity = (x: number, y: number) => {
      let vx = 80;
      let vy = 0;
      for (let i = 0; i < vortices.length; i++) {
        const v = vortices[i];
        const dx = x - v.x;
        const dy = y - v.y;
        const r2 = dx * dx + dy * dy + 200;
        vx += (-v.strength * dy) / r2;
        vy += (v.strength * dx) / r2;
      }
      return { vx, vy };
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const dt = 0.016;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const { vx, vy } = velocity(p.x, p.y);
        p.x += vx * dt;
        p.y += vy * dt;
        if (p.x > width + 40) p.x = -40;
        if (p.y < height * 0.1) p.y = height * 0.1;
        if (p.y > height * 0.9) p.y = height * 0.9;
        p.history.push(p.x, p.y);
        if (p.history.length > maxHistory * 2) {
          p.history.splice(0, p.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.1 * (i / particles.length)})`;
        ctx.beginPath();
        const pts = p.history;
        for (let j = 0; j < pts.length; j += 2) {
          const x = pts[j];
          const y = pts[j + 1];
          if (j === 0) ctx.moveTo(x, y);
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
  themes: 'vortex,street,fluid',
  visualisation: 'Alternating vortices advect ink into a street',
  promptSuggestion: '1. Watch vortices shed in sequence\n2. Imagine fluid weaving alternating swirls\n3. Let the gentle street settle you'
};
(VonKarmanVortexStreet as any).metadata = metadata;

export default VonKarmanVortexStreet;

// Differs from others by: Uses an analytic von Kármán vortex street velocity field to advect particles.

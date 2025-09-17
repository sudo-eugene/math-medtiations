// Themes: dynamical calm, limit cycles, analytical garden
// Visualisation: Multiple trajectories trace Van der Pol-like orbits forming a phase portrait garden
// Unique mechanism: Second-order Runge–Kutta integration of varied Van der Pol systems for many seeded trajectories
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Orbit {
  x: number;
  y: number;
  mu: number;
  history: number[];
  tint: number;
}

const PhasePortraitGarden: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x5b81acde);
    const orbitCount = 42;
    const orbits: Orbit[] = Array.from({ length: orbitCount }).map((_, i) => ({
      x: (rng() - 0.5) * 2,
      y: (rng() - 0.5) * 2,
      mu: 0.9 + rng() * 0.6 + i * 0.005,
      history: [],
      tint: 0.04 + rng() * 0.04,
    }));

    const scale = Math.min(width, height) * 0.28;
    const dt = 0.015;
    const maxHistory = 180;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const tShift = Math.sin(time * 0.0002);
      for (let i = 0; i < orbits.length; i++) {
        const orbit = orbits[i];
        const mu = orbit.mu;
        const k1x = orbit.y;
        const k1y = mu * (1 - orbit.x * orbit.x) * orbit.y - orbit.x;
        const midX = orbit.x + k1x * dt * 0.5;
        const midY = orbit.y + k1y * dt * 0.5;
        const k2x = midY;
        const k2y = mu * (1 - midX * midX) * midY - midX;
        orbit.x += (k1x + k2x) * 0.5 * dt;
        orbit.y += (k1y + k2y) * 0.5 * dt;

        const px = width / 2 + orbit.x * scale + Math.sin(i * 0.3 + tShift) * 20;
        const py = height / 2 + orbit.y * scale + Math.cos(i * 0.27 - tShift) * 18;
        orbit.history.push(px, py);
        if (orbit.history.length > maxHistory * 2) {
          orbit.history.splice(0, orbit.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${orbit.tint})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const pts = orbit.history;
        ctx.moveTo(pts[0], pts[1]);
        for (let p = 2; p < pts.length; p += 2) {
          ctx.lineTo(pts[p], pts[p + 1]);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(30,30,30,0.1)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.ellipse(width / 2, height / 2, scale * 0.8, scale * 0.6, 0, 0, Math.PI * 2);
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
  themes: 'phase-portrait,dynamics,garden',
  visualisation: 'Van der Pol trajectories weave a calm portrait',
  promptSuggestion: '1. Observe each orbit settling into balance\n2. Let analytic dynamics become floral\n3. Follow the interplay of x and y breathing'
};
(PhasePortraitGarden as any).metadata = metadata;

export default PhasePortraitGarden;

// Differs from others by: Integrates multiple Van der Pol systems via RK2 to render phase portraits.

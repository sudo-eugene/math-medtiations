// Themes: predator-prey calm, orbiting loops, dynamic balance
// Visualisation: Lotka–Volterra trajectories bloom in phase space, leaving looping orbits
// Unique mechanism: Integrates Lotka–Volterra equations for multiple initial conditions to draw orbit loops
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Trajectory {
  x: number;
  y: number;
  history: number[];
}

const VolterraOrbitGarden: React.FC<VisualProps> = ({ width, height }) => {
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

    const trajectories: Trajectory[] = Array.from({ length: 36 }).map((_, i) => ({
      x: 1 + Math.random() * 1.2,
      y: 1 + Math.random() * 1.2,
      history: [],
    }));
    const maxHistory = 220;

    const a = 1.1;
    const b = 0.9;
    const c = 1.0;
    const d = 0.7;
    const dt = 0.01;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.9;
      trajectories.forEach((traj, idx) => {
        for (let step = 0; step < 4; step++) {
          const dx = a * traj.x - b * traj.x * traj.y;
          const dy = -c * traj.y + d * traj.x * traj.y;
          traj.x += dx * dt;
          traj.y += dy * dt;
        }
        traj.history.push(traj.x, traj.y);
        if (traj.history.length > maxHistory * 2) {
          traj.history.splice(0, traj.history.length - maxHistory * 2);
        }

        const pts = traj.history;
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.12 * (idx / trajectories.length)})`;
        ctx.beginPath();
        for (let i = 0; i < pts.length; i += 2) {
          const x = pts[i];
          const y = pts[i + 1];
          const px = width * 0.15 + (x / 3) * width * 0.7;
          const py = height * 0.85 - (y / 3) * height * 0.7;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
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
  themes: 'lotka-volterra,orbit,garden',
  visualisation: 'Lotka–Volterra trajectories bloom as ink loops',
  promptSuggestion: '1. Observe predator and prey tracing harmony\n2. Imagine balance between two populations\n3. Let the phase space loops calm you'
};
(VolterraOrbitGarden as any).metadata = metadata;

export default VolterraOrbitGarden;

// Differs from others by: Integrates multiple Lotka–Volterra systems to draw phase-space orbit loops.

// Themes: nonlinear resonance, phase calm, analytic loops
// Visualisation: Duffing oscillator trajectories braid across the phase plane in layered loops
// Unique mechanism: Integrates the Duffing oscillator with RK4 for multiple initial conditions to trace phase portraits
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Trajectory {
  x: number;
  v: number;
  history: number[];
  hue: number;
}

const DuffingPhaseWeave: React.FC<VisualProps> = ({ width, height }) => {
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

    const trajectories: Trajectory[] = Array.from({ length: 24 }).map((_, i) => ({
      x: -1.2 + (i / 23) * 2.4,
      v: 0.6 * Math.sin(i),
      history: [],
      hue: i / 24,
    }));

    const dt = 0.012;
    const delta = 0.25;
    const alpha = -1;
    const beta = 1;
    const gamma = 0.3;
    const omega = 1.2;

    const rk4Step = (traj: Trajectory, t: number) => {
      const f = (x: number, v: number, time: number) => (
        gamma * Math.cos(omega * time) - delta * v - alpha * x - beta * x * x * x
      );

      const x1 = traj.v;
      const v1 = f(traj.x, traj.v, t);

      const x2 = traj.v + 0.5 * v1 * dt;
      const v2 = f(traj.x + 0.5 * x1 * dt, traj.v + 0.5 * v1 * dt, t + 0.5 * dt);

      const x3 = traj.v + 0.5 * v2 * dt;
      const v3 = f(traj.x + 0.5 * x2 * dt, traj.v + 0.5 * v2 * dt, t + 0.5 * dt);

      const x4 = traj.v + v3 * dt;
      const v4 = f(traj.x + x3 * dt, traj.v + v3 * dt, t + dt);

      traj.x += (dt / 6) * (x1 + 2 * x2 + 2 * x3 + x4);
      traj.v += (dt / 6) * (v1 + 2 * v2 + 2 * v3 + v4);
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.001;
      ctx.lineWidth = 0.9;
      trajectories.forEach((traj) => {
        rk4Step(traj, t);
        traj.history.push(traj.x, traj.v);
        if (traj.history.length > 240) {
          traj.history.splice(0, traj.history.length - 240);
        }
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.15 * traj.hue})`;
        ctx.beginPath();
        const scaleX = width * 0.3;
        const scaleY = height * 0.3;
        const offsetX = width / 2;
        const offsetY = height / 2;
        for (let i = 0; i < traj.history.length; i += 2) {
          const px = offsetX + traj.history[i] * scaleX * 0.4;
          const py = offsetY + traj.history[i + 1] * scaleY * 0.4;
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
  themes: 'duffing,phase,braid',
  visualisation: 'Duffing oscillator trajectories braid in the phase plane',
  promptSuggestion: '1. Follow nonlinear oscillations tracing loops\n2. Imagine resonance balancing damping\n3. Let analytic braids calm your focus'
};
(DuffingPhaseWeave as any).metadata = metadata;

export default DuffingPhaseWeave;

// Differs from others by: Integrates the Duffing oscillator with RK4 for multiple initial conditions to produce braiding phase portraits.

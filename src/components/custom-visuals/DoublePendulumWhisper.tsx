// Themes: coupled motion, whispering chaos, pendular calm
// Visualisation: Multiple double pendulums swing softly, their bob paths tracing whispering loops
// Unique mechanism: Numerically integrates double pendulum equations for many seeds and renders their bob trajectories
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Pendulum {
  theta1: number;
  theta2: number;
  omega1: number;
  omega2: number;
  trail: number[];
}

const g = 9.81;
const m1 = 1;
const m2 = 1;
const l1 = 1;
const l2 = 1;

const DoublePendulumWhisper: React.FC<VisualProps> = ({ width, height }) => {
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

    const pendulums: Pendulum[] = Array.from({ length: 18 }).map((_, i) => ({
      theta1: Math.PI / 2 + (i / 18) * 0.3,
      theta2: Math.PI / 2 + (i / 18) * 0.1,
      omega1: 0,
      omega2: 0,
      trail: [],
    }));
    const maxTrail = 140;
    const dt = 0.016;

    const integrate = (p: Pendulum) => {
      const { theta1, theta2, omega1, omega2 } = p;
      const delta = theta2 - theta1;
      const denom1 = (m1 + m2) * l1 - m2 * l1 * Math.cos(delta) * Math.cos(delta);
      const denom2 = (l2 / l1) * denom1;

      const domega1 = (m2 * l1 * omega1 * omega1 * Math.sin(delta) * Math.cos(delta) + m2 * g * Math.sin(theta2) * Math.cos(delta) + m2 * l2 * omega2 * omega2 * Math.sin(delta) - (m1 + m2) * g * Math.sin(theta1)) / denom1;
      const domega2 = (-m2 * l2 * omega2 * omega2 * Math.sin(delta) * Math.cos(delta) + (m1 + m2) * g * Math.sin(theta1) * Math.cos(delta) - (m1 + m2) * l1 * omega1 * omega1 * Math.sin(delta) - (m1 + m2) * g * Math.sin(theta2)) / denom2;

      p.omega1 += domega1 * dt;
      p.omega2 += domega2 * dt;
      p.theta1 += p.omega1 * dt;
      p.theta2 += p.omega2 * dt;
    };

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const scale = Math.min(width, height) * 0.25;
      const cx = width / 2;
      const cy = height * 0.25;

      for (let i = 0; i < pendulums.length; i++) {
        const p = pendulums[i];
        integrate(p);
        const x1 = cx + l1 * Math.sin(p.theta1) * scale;
        const y1 = cy + l1 * Math.cos(p.theta1) * scale;
        const x2 = x1 + l2 * Math.sin(p.theta2) * scale;
        const y2 = y1 + l2 * Math.cos(p.theta2) * scale;
        p.trail.push(x2, y2);
        if (p.trail.length > maxTrail * 2) {
          p.trail.splice(0, p.trail.length - maxTrail * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.1 * (i / pendulums.length)})`;
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
  themes: 'double-pendulum,chaos,whisper',
  visualisation: 'Double pendulum bobs write whispering loops',
  promptSuggestion: '1. Follow coupled swings breathing together\n2. Imagine chaos slowing into calm\n3. Let each looping whisper settle you'
};
(DoublePendulumWhisper as any).metadata = metadata;

export default DoublePendulumWhisper;

// Differs from others by: Integrates double pendulum equations for multiple seeds and renders bob trajectories.

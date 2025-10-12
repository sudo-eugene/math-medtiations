// Themes: contour listening, mountain calm, flowing survey
// Visualisation: Streamlines glide along synthetic topographic contours across the page
// Unique mechanism: Agents follow the perpendicular of a time-varying analytic heightmap gradient to reveal contour flow
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Feature {
  ax: number;
  ay: number;
  freq: number;
  phase: number;
  drift: number;
}

interface StreamAgent {
  x: number;
  y: number;
  history: number[];
  speed: number;
  shade: number;
}

const TopographicStreamMap: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x239c77b4);
    const featureCount = 6;
    const features: Feature[] = Array.from({ length: featureCount }).map(() => ({
      ax: (rng() - 0.5) * 0.8,
      ay: (rng() - 0.5) * 0.8,
      freq: 0.6 + rng() * 1.2,
      phase: rng() * Math.PI * 2,
      drift: 0.0002 + rng() * 0.0003,
    }));

    const agentCount = 360;
    const agents: StreamAgent[] = Array.from({ length: agentCount }).map(() => ({
      x: width * rng(),
      y: height * rng(),
      history: [],
      speed: 0.6 + rng() * 0.4,
      shade: 0.035 + rng() * 0.04,
    }));
    const maxHistory = 60;

    const gradientAt = (x: number, y: number, time: number) => {
      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      let gx = 0;
      let gy = 0;
      for (let i = 0; i < features.length; i++) {
        const f = features[i];
        const omega = f.freq;
        const phase = f.phase + time * f.drift * 60;
        const arg = nx * f.ax + ny * f.ay + omega * phase;
        const s = Math.sin(arg);
        const c = Math.cos(arg);
        gx += c * f.ax;
        gy += c * f.ay;
        gx += s * 0.3 * omega;
        gy -= s * 0.3 * omega;
      }
      return { gx, gy };
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        const grad = gradientAt(agent.x, agent.y, time * 0.001);
        // follow contour direction (perpendicular to gradient)
        let vx = -grad.gy;
        let vy = grad.gx;
        const mag = Math.hypot(vx, vy) + 1e-6;
        vx /= mag;
        vy /= mag;
        agent.x += vx * agent.speed;
        agent.y += vy * agent.speed;

        if (agent.x < 0 || agent.x > width || agent.y < 0 || agent.y > height) {
          agent.x = width * rng();
          agent.y = height * rng();
          agent.history.length = 0;
        }

        agent.history.push(agent.x, agent.y);
        if (agent.history.length > maxHistory * 2) {
          agent.history.splice(0, agent.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${agent.shade})`;
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        const pts = agent.history;
        ctx.moveTo(pts[0], pts[1]);
        for (let p = 2; p < pts.length; p += 2) {
          ctx.lineTo(pts[p], pts[p + 1]);
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
  themes: 'contours,survey,flow',
  visualisation: 'Streamlines trace synthetic topographic contours',
  promptSuggestion: '1. Walk the ridgelines with your gaze\n2. Sense valleys and peaks breathing\n3. Let the contour flow steady your mind'
};
(TopographicStreamMap as any).metadata = metadata;

export default TopographicStreamMap;

// Differs from others by: Agents follow contours defined by analytical gradients of a drifting heightmap.

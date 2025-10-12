// Themes: potential flow, gentle curl, meditative field
// Visualisation: Flow lines trace the perpendicular gradients of a scalar field, forming quiet swirls
// Unique mechanism: Computes a scalar potential and advects tracers using its perpendicular gradient (2D curl) to reveal equipotential flow
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Tracer {
  x: number;
  y: number;
  history: number[];
}

const GradientCurlGarden: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x2fc3e9b1);
    const tracerCount = 120;
    const tracers: Tracer[] = Array.from({ length: tracerCount }).map(() => ({
      x: width * (0.2 + rng() * 0.6),
      y: height * (0.2 + rng() * 0.6),
      history: []
    }));
    const maxHistory = 90;

    const potential = (x: number, y: number, t: number) => {
      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      const term1 = Math.sin(nx * 2.4 + t * 0.7) * Math.cos(ny * 1.8 - t * 0.5);
      const term2 = 0.6 * Math.sin(nx * ny * 3.1 + t * 0.4);
      const term3 = 0.4 * Math.cos((nx * nx - ny * ny) * 2.7 + t * 0.9);
      return term1 + term2 + term3;
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.001;
      ctx.lineWidth = 0.9;

      for (let i = 0; i < tracers.length; i++) {
        const tracer = tracers[i];
        const h = 2.5;
        const fx = (potential(tracer.x + h, tracer.y, t) - potential(tracer.x - h, tracer.y, t)) / (2 * h);
        const fy = (potential(tracer.x, tracer.y + h, t) - potential(tracer.x, tracer.y - h, t)) / (2 * h);
        const vx = fy;
        const vy = -fx;
        tracer.x += vx * 12;
        tracer.y += vy * 12;

        if (tracer.x < width * 0.08 || tracer.x > width * 0.92 || tracer.y < height * 0.08 || tracer.y > height * 0.92) {
          tracer.x = width * (0.2 + rng() * 0.6);
          tracer.y = height * (0.2 + rng() * 0.6);
          tracer.history.length = 0;
        }

        tracer.history.push(tracer.x, tracer.y);
        if (tracer.history.length > maxHistory * 2) {
          tracer.history.splice(0, tracer.history.length - maxHistory * 2);
        }

        const alpha = 0.05 + (i / tracerCount) * 0.12;
        ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
        ctx.beginPath();
        const pts = tracer.history;
        for (let p = 0; p < pts.length; p += 2) {
          const x = pts[p];
          const y = pts[p + 1];
          if (p === 0) ctx.moveTo(x, y);
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
  themes: 'curl,gradient,flow',
  visualisation: 'Perpendicular gradients form curling flow lines',
  promptSuggestion: '1. Feel the field spinning calmly\n2. Watch equipotential threads glide\n3. Let curl motion steady your senses'
};
(GradientCurlGarden as any).metadata = metadata;

export default GradientCurlGarden;

// Differs from others by: Uses perpendicular gradients of a scalar potential to advect tracers, revealing curl-based flow.

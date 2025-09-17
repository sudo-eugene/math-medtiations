// Themes: contour drift, stream calm, field mapping
// Visualisation: Streamlines descend a scalar field, forming a net of calming ink flows
// Unique mechanism: Performs gradient descent on a composite scalar field to trace streamlines that settle into basins
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Stream {
  x: number;
  y: number;
  history: number[];
}

const ScalarFieldStreamnet: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x5dd39fd2);
    const streamCount = 150;
    const streams: Stream[] = Array.from({ length: streamCount }).map(() => ({
      x: width * rng(),
      y: height * rng(),
      history: [],
    }));
    const maxHistory = 120;

    const scalar = (x: number, y: number, t: number) => {
      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      const bump = Math.exp(-4 * (nx * nx + ny * ny));
      const ripple = Math.sin(nx * 3 + t * 0.6) * Math.cos(ny * 4 - t * 0.4);
      const swirl = Math.sin((nx * ny) * 5 + t * 0.3);
      return bump + 0.4 * ripple + 0.3 * swirl;
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.001;
      ctx.lineWidth = 0.8;
      for (let i = 0; i < streams.length; i++) {
        const s = streams[i];
        const h = 3.0;
        const fx = (scalar(s.x + h, s.y, t) - scalar(s.x - h, s.y, t)) / (2 * h);
        const fy = (scalar(s.x, s.y + h, t) - scalar(s.x, s.y - h, t)) / (2 * h);
        const step = 18;
        s.x -= fx * step;
        s.y -= fy * step;

        s.history.push(s.x, s.y);
        if (s.history.length > maxHistory * 2) {
          s.history.splice(0, s.history.length - maxHistory * 2);
        }

        if (s.x < width * 0.06 || s.x > width * 0.94 || s.y < height * 0.06 || s.y > height * 0.94) {
          s.x = width * rng();
          s.y = height * rng();
          s.history.length = 0;
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.12 * (i / streams.length)})`;
        ctx.beginPath();
        const pts = s.history;
        for (let p = 0; p < pts.length; p += 2) {
          const x = pts[p];
          const y = pts[p + 1];
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.08, height * 0.08, width * 0.84, height * 0.84);

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
  themes: 'scalar,stream,field',
  visualisation: 'Gradient descent streamlines knit a quiet net',
  promptSuggestion: '1. Watch currents slide into basins\n2. Imagine the field gently lowering\n3. Let the net of flows calm you'
};
(ScalarFieldStreamnet as any).metadata = metadata;

export default ScalarFieldStreamnet;

// Differs from others by: Uses gradient descent on a composite scalar field to trace streamlines that settle into basins.

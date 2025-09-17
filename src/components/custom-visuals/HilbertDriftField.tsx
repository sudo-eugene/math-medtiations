// Themes: space-filling calm, Hilbert drift, gentle mapping
// Visualisation: Particles drift along successive segments of a Hilbert curve, revealing a calm space-filling motion
// Unique mechanism: Generates a Hilbert curve path and advects agents along it with drift resets to cover the canvas evenly
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const generateHilbert = (order: number, size: number) => {
  const points: Array<{ x: number; y: number }> = [];
  const hilbert = (x: number, y: number, xi: number, xj: number, yi: number, yj: number, n: number) => {
    if (n <= 0) {
      const px = x + (xi + yi) / 2;
      const py = y + (xj + yj) / 2;
      points.push({ x: px, y: py });
    } else {
      hilbert(x, y, yi / 2, yj / 2, xi / 2, xj / 2, n - 1);
      hilbert(x + xi / 2, y + xj / 2, xi / 2, xj / 2, yi / 2, yj / 2, n - 1);
      hilbert(x + xi / 2 + yi / 2, y + xj / 2 + yj / 2, xi / 2, xj / 2, yi / 2, yj / 2, n - 1);
      hilbert(x + xi / 2 + yi, y + xj / 2 + yj, -yi / 2, -yj / 2, -xi / 2, -xj / 2, n - 1);
    }
  };
  hilbert(0, 0, size, 0, 0, size, order);
  return points;
};

interface Agent {
  index: number;
}

const HilbertDriftField: React.FC<VisualProps> = ({ width, height }) => {
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

    const order = 6;
    const points = generateHilbert(order, Math.min(width, height) * 0.9);
    const offsetX = (width - Math.min(width, height) * 0.9) / 2;
    const offsetY = (height - Math.min(width, height) * 0.9) / 2;

    const agents: Agent[] = Array.from({ length: 40 }).map((_, i) => ({
      index: Math.floor((i / 40) * points.length)
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 1;
      agents.forEach((agent, idx) => {
        agent.index = (agent.index + 4) % points.length;
        const prevIndex = (agent.index + points.length - 20) % points.length;
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.1 * (idx / agents.length)})`;
        ctx.beginPath();
        const start = points[prevIndex];
        ctx.moveTo(offsetX + start.x, offsetY + start.y);
        for (let i = 1; i <= 20; i++) {
          const p = points[(prevIndex + i) % points.length];
          ctx.lineTo(offsetX + p.x, offsetY + p.y);
        }
        ctx.stroke();
      });

      ctx.strokeStyle = 'rgba(20,20,20,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(offsetX, offsetY, Math.min(width, height) * 0.9, Math.min(width, height) * 0.9);

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
  themes: 'hilbert,space-filling,drift',
  visualisation: 'Agents drift along a Hilbert curve covering the plane',
  promptSuggestion: '1. Follow the space-filling path sweeping quietly\n2. Imagine every point receiving attention\n3. Let the gentle drift calm your mind'
};
(HilbertDriftField as any).metadata = metadata;

export default HilbertDriftField;

// Differs from others by: Generates a discrete Hilbert curve and advects agents along it to cover the canvas.

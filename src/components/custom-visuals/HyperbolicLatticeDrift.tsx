// Themes: hyperbolic lattice, gentle drift, geometric calm
// Visualisation: Nodes glide along geodesics of a hyperbolic lattice, drawing subtle connections
// Unique mechanism: Embeds the Poincaré disk model and advances lattice nodes via Möbius transformations approximating geodesic drift
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const HyperbolicLatticeDrift: React.FC<VisualProps> = ({ width, height }) => {
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

    const nodes = [] as Array<{ x: number; y: number; angle: number }>;
    const layers = 4;
    for (let r = 1; r <= layers; r++) {
      const count = r * 12;
      for (let i = 0; i < count; i++) {
        const angle = (i / count) * Math.PI * 2;
        const radius = Math.tanh(r * 0.35);
        nodes.push({ x: Math.cos(angle) * radius, y: Math.sin(angle) * radius, angle });
      }
    }

    const toCanvas = (x: number, y: number) => {
      const scale = Math.min(width, height) * 0.45;
      return {
        x: width / 2 + x * scale,
        y: height / 2 + y * scale,
      };
    };

    const mobius = (z: { x: number; y: number }, angle: number, epsilon: number) => {
      const a = { x: Math.cos(angle), y: Math.sin(angle) };
      const alpha = { x: epsilon * a.x, y: epsilon * a.y };
      const numerator = {
        x: z.x + alpha.x,
        y: z.y + alpha.y,
      };
      const denom = 1 + alpha.x * z.x + alpha.y * z.y;
      return {
        x: numerator.x / denom,
        y: numerator.y / denom,
      };
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);
      const t = time * 0.0004;

      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(20,20,20,0.08)';
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, Math.min(width, height) * 0.45, 0, Math.PI * 2);
      ctx.stroke();

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        const drift = mobius({ x: node.x, y: node.y }, node.angle + Math.sin(t + i) * 0.2, 0.008);
        node.x = drift.x;
        node.y = drift.y;
        const { x, y } = toCanvas(node.x, node.y);
        ctx.fillStyle = 'rgba(25,25,25,0.2)';
        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(25,25,25,0.04)';
      ctx.lineWidth = 0.7;
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.hypot(dx, dy);
          if (dist < 0.35) {
            const start = toCanvas(node.x, node.y);
            const end = toCanvas(other.x, other.y);
            ctx.beginPath();
            ctx.moveTo(start.x, start.y);
            ctx.lineTo(end.x, end.y);
            ctx.stroke();
          }
        }
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
  themes: 'hyperbolic,geodesic,lattice',
  visualisation: 'Hyperbolic lattice nodes drift along geodesics',
  promptSuggestion: '1. Imagine traveling through curved space\n2. Follow nodes as they whisper around\n3. Let the hyperbolic calm settle you'
};
(HyperbolicLatticeDrift as any).metadata = metadata;

export default HyperbolicLatticeDrift;

// Differs from others by: Uses Möbius transformations in the Poincaré disk to drift lattice nodes along hyperbolic geodesics.

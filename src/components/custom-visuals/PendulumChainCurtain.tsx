// Themes: harmonic swaying, shared balance, restful cadence
// Visualisation: A curtain of pendulum links swaying in synchrony with faint echoing strands
// Unique mechanism: Coupled mass-spring integration for a hanging chain reacting to gentle driving motion
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const PendulumChainCurtain: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x4f19ac33);
    const nodeCount = 46;
    const nodes: Node[] = Array.from({ length: nodeCount }).map((_, i) => ({
      x: width / 2 + (rng() - 0.5) * 20,
      y: height * 0.15 + (i / (nodeCount - 1)) * height * 0.6,
      vx: 0,
      vy: 0,
    }));
    const restLength = (height * 0.6) / (nodeCount - 1);

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const anchorX = width * 0.5 + Math.sin(time * 0.0004) * width * 0.1;
      const anchorY = height * 0.18 + Math.cos(time * 0.00027) * height * 0.02;

      // Integrate nodes
      for (let i = 1; i < nodeCount; i++) {
        const node = nodes[i];
        node.vy += 0.06; // gravity
        node.vx *= 0.995;
        node.vy *= 0.995;
        node.x += node.vx;
        node.y += node.vy;
      }

      // Constrain chain via iterative relaxation
      for (let iter = 0; iter < 5; iter++) {
        nodes[0].x = anchorX;
        nodes[0].y = anchorY;
        nodes[0].vx = nodes[0].vy = 0;
        for (let i = 0; i < nodeCount - 1; i++) {
          const a = nodes[i];
          const b = nodes[i + 1];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const dist = Math.hypot(dx, dy) || 1;
          const diff = (dist - restLength) / dist;
          const offsetX = dx * 0.5 * diff;
          const offsetY = dy * 0.5 * diff;
          if (i > 0) {
            a.x += offsetX;
            a.y += offsetY;
          }
          b.x -= offsetX;
          b.y -= offsetY;
        }
      }

      ctx.strokeStyle = 'rgba(40,40,40,0.28)';
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x, nodes[0].y);
      for (let i = 1; i < nodeCount; i++) {
        ctx.lineTo(nodes[i].x, nodes[i].y);
      }
      ctx.stroke();

      // Echo strands offset in depth
      ctx.strokeStyle = 'rgba(30,30,30,0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x * 0.98, nodes[0].y * 0.98 + 6);
      for (let i = 1; i < nodeCount; i++) {
        const node = nodes[i];
        ctx.lineTo(node.x * 0.98, node.y * 0.98 + 6);
      }
      ctx.stroke();

      ctx.strokeStyle = 'rgba(20,20,20,0.1)';
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      ctx.moveTo(nodes[0].x * 1.02, nodes[0].y * 1.02 - 5);
      for (let i = 1; i < nodeCount; i++) {
        const node = nodes[i];
        ctx.lineTo(node.x * 1.02, node.y * 1.02 - 5);
      }
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
  themes: 'pendulum,synchrony,soothing',
  visualisation: 'Suspended chain breathing with harmonic sway',
  promptSuggestion: '1. Watch gravity settle into rhythm\n2. Follow each bead’s delay between motions\n3. Feel your breath entrain with the gentle curtain'
};
(PendulumChainCurtain as any).metadata = metadata;

export default PendulumChainCurtain;

// Differs from others by: Uses an explicit coupled mass-spring pendulum chain integration to drive the motion.

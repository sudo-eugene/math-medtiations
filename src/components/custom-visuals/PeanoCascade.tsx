// Themes: space-filling calm, cascading paths, measured progression
// Visualisation: A Peano space-filling curve cascades across the canvas in layered strokes
// Unique mechanism: Generates a Peano curve via recursive subdivision and advances agents along successive segments
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const generatePeano = (order: number, size: number, offsetX: number, offsetY: number) => {
  const points: Array<{ x: number; y: number }> = [];
  const recurse = (x: number, y: number, step: number, level: number, pattern: number[][]) => {
    if (level === 0) {
      points.push({ x, y });
    } else {
      const newStep = step / 3;
      for (let i = 0; i < pattern.length; i++) {
        const p = pattern[i];
        recurse(x + p[0] * newStep, y + p[1] * newStep, newStep, level - 1, pattern);
      }
    }
  };
  const pattern = [
    [0, 0], [0, 1], [0, 2],
    [1, 2], [1, 1], [1, 0],
    [2, 0], [2, 1], [2, 2]
  ];
  recurse(offsetX, offsetY, size, order, pattern);
  return points;
};

interface Agent {
  index: number;
}

const PeanoCascade: React.FC<VisualProps> = ({ width, height }) => {
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

    const size = Math.min(width, height) * 0.8;
    const offsetX = (width - size) / 2;
    const offsetY = (height - size) / 2;
    const points = generatePeano(3, size, offsetX, offsetY);

    const agentCount = 48;
    const agents: Agent[] = Array.from({ length: agentCount }).map((_, i) => ({
      index: Math.floor((i / agentCount) * points.length)
    }));

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.85;
      for (let i = 0; i < agents.length; i++) {
        const agent = agents[i];
        agent.index = (agent.index + 6) % points.length;
        const prevIndex = (agent.index + points.length - 60) % points.length;
        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.1 * (i / agents.length)})`;
        ctx.beginPath();
        ctx.moveTo(points[prevIndex].x, points[prevIndex].y);
        for (let step = 1; step <= 60; step++) {
          const p = points[(prevIndex + step) % points.length];
          ctx.lineTo(p.x, p.y);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(offsetX, offsetY, size, size);

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
  themes: 'peano,space-filling,cascade',
  visualisation: 'Peano curve segments cascade across the plane',
  promptSuggestion: '1. Watch the path visit every cell\n2. Follow the gentle cascade of space filling\n3. Let the measured progression calm you'
};
(PeanoCascade as any).metadata = metadata;

export default PeanoCascade;

// Differs from others by: Generates a Peano space-filling curve via recursive subdivision and advances agents along its segments.

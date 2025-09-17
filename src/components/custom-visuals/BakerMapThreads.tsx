// Themes: stretching calm, baker threads, iterative balance
// Visualisation: Threads follow the baker's map stretching and folding, leaving layered trails
// Unique mechanism: Iterates the baker transformation for multiple initial conditions, recording thread trajectories
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const BakerMapThreads: React.FC<VisualProps> = ({ width, height }) => {
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

    const seeds = 36;
    const iterations = 260;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);
      ctx.lineWidth = 0.85;
      for (let s = 0; s < seeds; s++) {
        let x = (s + 1) / (seeds + 1);
        let y = (s * 29 % seeds) / seeds;
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.1 * (s / seeds)})`;
        ctx.beginPath();
        ctx.moveTo(width * x, height * y);
        for (let i = 0; i < iterations; i++) {
          let xn, yn;
          if (x < 0.5) {
            xn = 2 * x;
            yn = y / 2;
          } else {
            xn = 2 * x - 1;
            yn = (y + 1) / 2;
          }
          x = xn;
          y = yn;
          ctx.lineTo(width * x, height * y);
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
  themes: 'baker-map,threads,stretching',
  visualisation: 'Baker map threads stretch and fold across the plane',
  promptSuggestion: '1. Watch pieces stretch then fold\n2. Imagine dough weaving into threads\n3. Let the iterative balance calm you'
};
(BakerMapThreads as any).metadata = metadata;

export default BakerMapThreads;

// Differs from others by: Iterates the baker map to stretch and fold threads across the canvas.

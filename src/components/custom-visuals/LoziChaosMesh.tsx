// Themes: planar chaos, delicate mesh, iterative calm
// Visualisation: Lozi map iterates weave chaotic meshes that shimmer softly
// Unique mechanism: Iterates the Lozi map for many seeds and connects successive points to create a chaotic mesh
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const LoziChaosMesh: React.FC<VisualProps> = ({ width, height }) => {
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

    const a = 1.7;
    const b = 0.5;
    const seeds = 60;
    const iterations = 320;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.7;
      for (let s = 0; s < seeds; s++) {
        let x = -1 + (s / seeds) * 2;
        let y = 0.2 * Math.sin(s);
        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.1 * (s / seeds)})`;
        ctx.beginPath();
        for (let i = 0; i < iterations; i++) {
          const xn = 1 - a * Math.abs(x) + b * y;
          const yn = x;
          x = xn;
          y = yn;
          const px = width * (0.5 + x * 0.24);
          const py = height * (0.5 + y * 0.24);
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
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
  themes: 'lozi,map,mesh',
  visualisation: 'Lozi map traces form a chaotic mesh',
  promptSuggestion: '1. Observe the planar chaos weaving nets\n2. Imagine each iteration breathing softly\n3. Let the mesh steady your gaze'
};
(LoziChaosMesh as any).metadata = metadata;

export default LoziChaosMesh;

// Differs from others by: Iterates the Lozi map for many seeds and connects successive points to create a chaotic mesh.

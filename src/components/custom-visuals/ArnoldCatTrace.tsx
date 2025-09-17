// Themes: discrete mapping, lattice memory, chaotic calm
// Visualisation: Iterated Arnold cat map traces form lattice-like braids fading over time
// Unique mechanism: Applies the Arnold cat map to a lattice of sample points and renders their trajectories as ink traces
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const ArnoldCatTrace: React.FC<VisualProps> = ({ width, height }) => {
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

    const gridSize = 32;
    const points = [] as Array<{ x: number; y: number; trail: number[] }>;
    for (let y = 0; y < gridSize; y++) {
      for (let x = 0; x < gridSize; x++) {
        points.push({
          x: x / gridSize,
          y: y / gridSize,
          trail: [],
        });
      }
    }

    const applyCatMap = (x: number, y: number) => {
      const nx = (x + y) % 1;
      const ny = (x + 2 * y) % 1;
      return { x: nx, y: ny };
    };

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.06)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.7;
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const mapped = applyCatMap(p.x, p.y);
        p.x = mapped.x;
        p.y = mapped.y;
        const px = p.x * width;
        const py = p.y * height;
        p.trail.push(px, py);
        if (p.trail.length > 40) {
          p.trail.splice(0, 2);
        }
        if (p.trail.length >= 4) {
          ctx.strokeStyle = 'rgba(25,25,25,0.05)';
          ctx.beginPath();
          ctx.moveTo(p.trail[0], p.trail[1]);
          for (let t = 2; t < p.trail.length; t += 2) {
            ctx.lineTo(p.trail[t], p.trail[t + 1]);
          }
          ctx.stroke();
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
  themes: 'arnold-cat,map,chaos',
  visualisation: 'Arnold cat map iterates leaving woven traces',
  promptSuggestion: '1. Notice the lattice folding softly\n2. Imagine order emerging from chaos\n3. Let the discrete rhythm steady your gaze'
};
(ArnoldCatTrace as any).metadata = metadata;

export default ArnoldCatTrace;

// Differs from others by: Iteratively applies the Arnold cat map to a lattice of points and draws their trajectories.

// Themes: nested harmony, unfolding geometry, gentle recursion
// Visualisation: Concentric polygons rotate at varied tempos, weaving recursive filigree
// Unique mechanism: Recursively generated polygon rings with time-dependent interpolation between successive layers
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const RecursivePolygonBloom: React.FC<VisualProps> = ({ width, height }) => {
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

    const segments = 9;
    const levels = 6;
    const baseRadius = Math.min(width, height) * 0.38;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const baseAngles = Array.from({ length: segments }, (_, i) => (i / segments) * Math.PI * 2);
      let previousPoints: Array<[number, number]> | null = null;

      for (let level = 0; level < levels; level++) {
        const levelRatio = 1 - level / (levels + 0.5);
        const spin = time * 0.0002 * (level + 1);
        const radius = baseRadius * levelRatio * (0.9 + 0.08 * Math.sin(time * 0.0004 + level));
        const points: Array<[number, number]> = baseAngles.map((angle, idx) => {
          const jitter = 0.05 * Math.sin(time * 0.0006 + idx * 1.3 + level);
          const x = cx + Math.cos(angle + spin) * radius * (1 + jitter);
          const y = cy + Math.sin(angle + spin) * radius * (1 - jitter);
          return [x, y];
        });

        if (previousPoints) {
          for (let i = 0; i < segments; i++) {
            const prev = previousPoints[i];
            const current = points[i];
            const blend = 0.5 + 0.5 * Math.sin(time * 0.0003 + level * 0.7 + i);
            const x = prev[0] * (1 - blend) + current[0] * blend;
            const y = prev[1] * (1 - blend) + current[1] * blend;
            points[i] = [x, y];
          }
        }

        ctx.strokeStyle = `rgba(30,30,30,${0.18 - level * 0.02})`;
        ctx.lineWidth = 1 + (levels - level) * 0.15;
        ctx.beginPath();
        ctx.moveTo(points[0][0], points[0][1]);
        for (let i = 1; i < points.length; i++) {
          ctx.lineTo(points[i][0], points[i][1]);
        }
        ctx.closePath();
        ctx.stroke();

        ctx.strokeStyle = 'rgba(30,30,30,0.06)';
        ctx.lineWidth = 0.8;
        ctx.beginPath();
        for (let i = 0; i < segments; i++) {
          const nextIndex = (i + 2) % segments;
          ctx.moveTo(points[i][0], points[i][1]);
          ctx.lineTo(points[nextIndex][0], points[nextIndex][1]);
        }
        ctx.stroke();

        previousPoints = points;
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
  themes: 'recursion,polygon,bloom',
  visualisation: 'Recursive polygons rotating in layered harmony',
  promptSuggestion: '1. Notice each layer borrowing from the last\n2. Sense the polygonal bloom breathing\n3. Imagine nested mandalas synchronising'
};
(RecursivePolygonBloom as any).metadata = metadata;

export default RecursivePolygonBloom;

// Differs from others by: Builds polygons recursively by blending each layer with its predecessor in real time.

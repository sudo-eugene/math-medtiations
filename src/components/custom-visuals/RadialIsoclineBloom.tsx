// Themes: differential bloom, radial calm, gentle guidance
// Visualisation: Isoclines of a differential system bloom radially, revealing guiding curves
// Unique mechanism: Integrates isoclines of a planar differential equation using dy/dx = f(x,y) to reveal radial guidance curves
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Curve {
  x: number;
  y: number;
  history: number[];
}

const RadialIsoclineBloom: React.FC<VisualProps> = ({ width, height }) => {
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

    const cx = width / 2;
    const cy = height / 2;
    const curveCount = 80;
    const curves: Curve[] = Array.from({ length: curveCount }).map((_, i) => ({
      x: cx + Math.cos((i / curveCount) * Math.PI * 2) * Math.min(width, height) * 0.45,
      y: cy + Math.sin((i / curveCount) * Math.PI * 2) * Math.min(width, height) * 0.45,
      history: [],
    }));
    const maxHistory = 180;

    const slope = (x: number, y: number, t: number) => {
      const nx = (x - cx) / Math.max(width, 1);
      const ny = (y - cy) / Math.max(height, 1);
      const spiral = Math.sin(nx * 6 + t) * 0.6 + Math.cos(ny * 5 - t) * 0.6;
      const radial = Math.atan2(ny, nx);
      return spiral + 0.5 * radial;
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      const step = 12;

      ctx.lineWidth = 0.8;
      for (let i = 0; i < curves.length; i++) {
        const curve = curves[i];
        const dy_dx = slope(curve.x, curve.y, t);
        const dir = 1 / Math.sqrt(1 + dy_dx * dy_dx);
        const dx = dir * step * (i % 2 === 0 ? -1 : 1);
        const dy = dy_dx * dir * step * (i % 2 === 0 ? -1 : 1);
        curve.x += dx;
        curve.y += dy;

        if (curve.x < width * 0.1 || curve.x > width * 0.9 || curve.y < height * 0.1 || curve.y > height * 0.9) {
          const angle = (i / curveCount) * Math.PI * 2;
          curve.x = cx + Math.cos(angle) * Math.min(width, height) * 0.45;
          curve.y = cy + Math.sin(angle) * Math.min(width, height) * 0.45;
          curve.history.length = 0;
        }

        curve.history.push(curve.x, curve.y);
        if (curve.history.length > maxHistory * 2) {
          curve.history.splice(0, curve.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.12 * (i / curves.length)})`;
        ctx.beginPath();
        const pts = curve.history;
        for (let p = 0; p < pts.length; p += 2) {
          const x = pts[p];
          const y = pts[p + 1];
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(30,30,30,0.18)';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
      ctx.fill();

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
  themes: 'isocline,differential,bloom',
  visualisation: 'Isoclines bloom radially from a differential field',
  promptSuggestion: '1. Follow each curve guided by slope\n2. Sense a field whispering directions\n3. Let the bloom gather you toward center'
};
(RadialIsoclineBloom as any).metadata = metadata;

export default RadialIsoclineBloom;

// Differs from others by: Integrates isoclines from a planar differential equation dy/dx = f(x,y) to reveal radial guidance curves.

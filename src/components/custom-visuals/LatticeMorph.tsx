import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Morph between square and hexagonal lattices by interpolating neighbor links
const LatticeMorph: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    let raf: number | null = null;
    let t = 0;

    const cols = 18;
    const rows = 18;
    const pad = 28;
    const gw = width - pad * 2;
    const gh = height - pad * 2;
    const dx = gw / (cols - 1);
    const dy = gh / (rows - 1);

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      const alpha = 0.5 + 0.5 * Math.sin(t * 0.5); // 0..1

      // draw points and interpolate neighbor positions
      ctx.strokeStyle = 'rgba(60,60,60,0.35)';
      ctx.lineWidth = 1.0;
      for (let j = 0; j < rows; j++) {
        for (let i = 0; i < cols; i++) {
          const px = pad + i * dx;
          const py = pad + j * dy;

          // square neighbors: right, down
          const nbrsSq: [number, number][] = [
            [i + 1, j],
            [i, j + 1],
          ];
          // hex neighbors approximation (offset every other row)
          const off = j % 2 === 0 ? -1 : 0;
          const nbrsHex: [number, number][] = [
            [i + 1, j],
            [i + off, j + 1],
          ];
          for (let k = 0; k < 2; k++) {
            const [sqx, sqy] = nbrsSq[k];
            const [hx, hy] = nbrsHex[k];
            if (sqx < cols && sqy < rows && hx >= 0 && hx < cols && hy < rows) {
              const sx = pad + sqx * dx;
              const sy = pad + sqy * dy;
              const hxpx = pad + hx * dx + (j % 2 ? dx * 0.5 : -dx * 0.5);
              const hxpy = pad + hy * dy;
              const ex = sx * (1 - alpha) + hxpx * alpha;
              const ey = sy * (1 - alpha) + hxpy * alpha;
              ctx.beginPath();
              ctx.moveTo(px, py);
              ctx.lineTo(ex, ey);
              ctx.stroke();
            }
          }
        }
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [width, height]);

  return (
    <div style={{ width, height, background: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default LatticeMorph;


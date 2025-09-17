import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Shimmering light caustics from interfering circular waves
const CausticLattice: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    let raf: number | null = null;
    let time = 0;

    const sources = [
      { x: width * 0.3, y: height * 0.4, k: 0.16 },
      { x: width * 0.65, y: height * 0.55, k: 0.15 },
      { x: width * 0.45, y: height * 0.33, k: 0.17 },
    ];

    const render = () => {
      time += 0.03;
      const img = ctx.createImageData(width, height);
      const d = img.data;
      let idx = 0;
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          let amp = 0;
          for (const s of sources) {
            const dx = x - s.x;
            const dy = y - s.y;
            const dist = Math.hypot(dx, dy) + 1e-6;
            amp += Math.sin(s.k * dist - time) / (1 + 0.002 * dist);
          }
          let shade = 200 - Math.floor(90 * amp);
          shade = Math.max(30, Math.min(240, shade));
          d[idx++] = shade;
          d[idx++] = shade;
          d[idx++] = shade;
          d[idx++] = 255;
        }
      }
      ctx.putImageData(img, 0, 0);

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

export default CausticLattice;


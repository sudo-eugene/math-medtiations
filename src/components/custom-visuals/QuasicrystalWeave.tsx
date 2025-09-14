import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Quasicrystal-like interference from multiple plane waves
const QuasicrystalWeave: React.FC<VisualProps> = ({ width, height }) => {
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

    // Directions for plane waves (use irrational/angular spacing)
    const dirs = Array.from({ length: 8 }, (_, i) => {
      const phi = (i * Math.PI) / 4 + (i % 2) * 0.1234;
      return { x: Math.cos(phi), y: Math.sin(phi), w: 0.9 + 0.15 * i };
    });

    const render = () => {
      time += 0.015;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const s = 2; // sampling step for performance
      const img = ctx.createImageData(width, height);
      const d = img.data;
      let idx = 0;

      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          // continuous 2D coordinate centered
          const u = (x - width / 2) / Math.min(width, height);
          const v = (y - height / 2) / Math.min(width, height);

          let val = 0;
          for (const dir of dirs) {
            val += Math.cos(12.0 * (u * dir.x + v * dir.y) + time * dir.w);
          }
          val /= dirs.length;
          // contrast & mask to create woven look
          let shade = 160 + Math.floor(80 * val);
          shade = Math.max(40, Math.min(240, shade));
          d[idx++] = shade;
          d[idx++] = shade;
          d[idx++] = shade;
          d[idx++] = 255;
        }
      }

      ctx.putImageData(img, 0, 0);

      // Subtle rotating mesh overlay
      ctx.save();
      ctx.translate(width / 2, height / 2);
      ctx.rotate(time * 0.02);
      ctx.strokeStyle = 'rgba(50,50,50,0.12)';
      for (let r = 40; r < Math.min(width, height) * 0.6; r += 40) {
        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      for (let i = 0; i < 16; i++) {
        const a = (i / 16) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(a) * width, Math.sin(a) * width);
        ctx.stroke();
      }
      ctx.restore();

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [width, height]);

  return (
    <div style={{ width, height, background: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default QuasicrystalWeave;


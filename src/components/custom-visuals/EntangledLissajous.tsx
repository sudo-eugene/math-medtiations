import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Multiple interwoven Lissajous curves gently phase-shifting
const EntangledLissajous: React.FC<VisualProps> = ({ width, height }) => {
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

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.9;
      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.36;

      for (let k = 0; k < 9; k++) {
        const a = 2 + ((k % 3) + 1);
        const b = 3 + (Math.floor(k / 3) + 1);
        const delta = t * 0.4 + k * 0.35;
        ctx.beginPath();
        for (let i = 0; i <= 1200; i++) {
          const p = (i / 1200) * Math.PI * 2;
          const x = cx + scale * Math.sin(a * p + 0.4 * Math.sin(delta));
          const y = cy + scale * Math.sin(b * p + 0.4 * Math.cos(delta));
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(60,60,60,${0.55 - k * 0.05})`;
        ctx.stroke();
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

export default EntangledLissajous;


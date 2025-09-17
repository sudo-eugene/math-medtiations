import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// A softly undulating membrane rendered by distorting a grid with smooth pseudo-noise
const SilkenMembrane: React.FC<VisualProps> = ({ width, height }) => {
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

    const noise = (x: number, y: number, t: number) => {
      // smooth pseudo-noise via layered sin/cos
      return (
        Math.sin(x * 1.3 + t * 0.7) * 0.5 +
        Math.cos(y * 1.7 - t * 0.6) * 0.5 +
        Math.sin((x + y) * 0.7 + t * 0.4) * 0.4
      ) * 0.5;
    };

    const render = () => {
      time += 0.01;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      ctx.strokeStyle = 'rgba(60,60,60,0.35)';
      ctx.lineWidth = 0.8;

      const cols = 34;
      const rows = 34;
      const pad = 20;
      const gw = width - pad * 2;
      const gh = height - pad * 2;
      const dx = gw / (cols - 1);
      const dy = gh / (rows - 1);
      const scale = 0.8;

      // vertical lines
      for (let i = 0; i < cols; i++) {
        ctx.beginPath();
        for (let j = 0; j < rows; j++) {
          const x0 = pad + i * dx;
          const y0 = pad + j * dy;
          const u = (i / (cols - 1) - 0.5) * scale * 2.6;
          const v = (j / (rows - 1) - 0.5) * scale * 2.6;
          const nx = noise(u, v, time);
          const ny = noise(v + 10, u + 10, time);
          const x = x0 + nx * 14;
          const y = y0 + ny * 14;
          if (j === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // horizontal lines
      for (let j = 0; j < rows; j++) {
        ctx.beginPath();
        for (let i = 0; i < cols; i++) {
          const x0 = pad + i * dx;
          const y0 = pad + j * dy;
          const u = (i / (cols - 1) - 0.5) * scale * 2.6;
          const v = (j / (rows - 1) - 0.5) * scale * 2.6;
          const nx = noise(u + 5, v - 3, time);
          const ny = noise(v + 12, u - 6, time);
          const x = x0 + nx * 14;
          const y = y0 + ny * 14;
          if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      // Soft vignette
      const g = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.min(width,height)*0.7);
      g.addColorStop(0, 'rgba(240,238,230,0)');
      g.addColorStop(1, 'rgba(240,238,230,0.6)');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,width,height);

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

export default SilkenMembrane;


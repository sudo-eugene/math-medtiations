import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Concentric ripples scattering around stones like a zen garden
const ZenSandRipples: React.FC<VisualProps> = ({ width, height }) => {
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

    const stones = [
      { x: width * 0.35, y: height * 0.45, r: 18 },
      { x: width * 0.62, y: height * 0.58, r: 24 },
      { x: width * 0.52, y: height * 0.34, r: 14 },
    ];

    const render = () => {
      t += 0.014;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      // Draw ripples as iso-lines of phase field
      ctx.strokeStyle = 'rgba(60,60,60,0.24)';
      ctx.lineWidth = 1.0;
      const spacing = 12;
      for (let r = spacing; r < Math.max(width, height); r += spacing) {
        ctx.beginPath();
        for (let a = 0; a <= Math.PI * 2 + 0.001; a += 0.01) {
          const x = width / 2 + r * Math.cos(a);
          const y = height / 2 + r * Math.sin(a);
          // phase shifted by stones (distance-based)
          let phase = r * 0.14 - t * 12;
          for (const s of stones) {
            const dx = x - s.x;
            const dy = y - s.y;
            phase += 0.9 * Math.sin(0.13 * Math.sqrt(dx * dx + dy * dy) - t * 5.0);
          }
          const off = Math.sin(phase) * 2.0;
          const xx = x + Math.cos(a) * off;
          const yy = y + Math.sin(a) * off;
          if (a === 0) ctx.moveTo(xx, yy); else ctx.lineTo(xx, yy);
        }
        ctx.stroke();
      }

      // Stones
      for (const s of stones) {
        ctx.fillStyle = 'rgba(60,60,60,0.4)';
        ctx.beginPath();
        ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
        ctx.fill();
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

export default ZenSandRipples;


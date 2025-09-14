import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Evolving vesica piscis field with concentric arcs and soft interference
const VesicaField: React.FC<VisualProps> = ({ width, height }) => {
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

    const drawCircle = (x: number, y: number, r: number, a: number) => {
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(60,60,60,${a})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
    };

    const render = () => {
      t += 0.008;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const R = Math.min(width, height) * 0.28;
      const d = R * (0.9 + 0.2 * Math.sin(t * 0.7));

      // Left and right circle centers
      const L = { x: cx - d, y: cy };
      const Rc = { x: cx + d, y: cy };

      // Concentric arcs for both circles
      for (let i = 0; i < 18; i++) {
        const rr = ((i + 1) / 18) * R * (1.2 + 0.05 * Math.sin(t + i));
        const a = 0.26 - i * 0.01;
        drawCircle(L.x, L.y, rr, Math.max(0.04, a));
        drawCircle(Rc.x, Rc.y, rr, Math.max(0.04, a));
      }

      // Soft intersection glow
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 1.6);
      grad.addColorStop(0, 'rgba(60,60,60,0.12)');
      grad.addColorStop(1, 'rgba(60,60,60,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, R * 1.6, 0, Math.PI * 2);
      ctx.fill();

      // Axial guides
      ctx.strokeStyle = 'rgba(60,60,60,0.08)';
      ctx.beginPath();
      ctx.moveTo(cx, cy - R * 2);
      ctx.lineTo(cx, cy + R * 2);
      ctx.moveTo(cx - R * 2, cy);
      ctx.lineTo(cx + R * 2, cy);
      ctx.stroke();

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

export default VesicaField;


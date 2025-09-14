import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: spiral trees swaying in breeze
const HelicalGrove: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    let time = 0;

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      const trees = 6;
      for (let t = 0; t < trees; t++) {
        const baseX = (t + 1) * width / (trees + 1);
        const sway = Math.sin(time * 0.5 + t) * 10;
        ctx.beginPath();
        for (let y = height; y > height * 0.2; y -= 5) {
          const progress = (height - y) / height;
          const radius = 10 * progress;
          const ang = progress * 6 + time + t;
          const x = baseX + Math.cos(ang) * radius + sway;
          if (y === height) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(50,50,50,0.4)';
        ctx.stroke();
        // canopy
        ctx.beginPath();
        for (let a = 0; a < Math.PI * 2; a += Math.PI / 12) {
          const r = 20 + 5 * Math.sin(time + a * 3);
          const cx = baseX + Math.cos(a + time * 0.2) * r;
          const cy = height * 0.2 + Math.sin(a + time * 0.2) * r;
          ctx.lineTo(cx, cy);
        }
        ctx.closePath();
        ctx.strokeStyle = 'rgba(50,50,50,0.2)';
        ctx.stroke();
      }
      time += 0.02;
      animationId = requestAnimationFrame(animate);
    };

    let animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [width, height]);

  return (
    <div
      className="flex justify-center items-center shadow-lg rounded-lg"
      style={{ width: `${width}px`, height: `${height}px`, backgroundColor: '#F0EEE6' }}
    >
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
    </div>
  );
};

export default HelicalGrove;

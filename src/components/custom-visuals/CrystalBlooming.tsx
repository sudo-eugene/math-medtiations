import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: growing crystalline shards dissolving into stardust
const CrystalBlooming: React.FC<VisualProps> = ({ width, height }) => {
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
      const cx = width / 2;
      const cy = height / 2;
      const spikes = 24;
      const phase = time % 8;
      const grow = phase < 4 ? phase / 4 : 1 - (phase - 4) / 4;
      const maxR = Math.min(cx, cy) * grow;
      for (let i = 0; i < spikes; i++) {
        const ang = (i / spikes) * Math.PI * 2 + time * 0.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(cx + maxR * Math.cos(ang), cy + maxR * Math.sin(ang));
        const alpha = 0.3 + 0.2 * Math.sin(time + i);
        ctx.strokeStyle = `rgba(50,50,50,${alpha})`;
        ctx.stroke();
        if (phase > 4) {
          const pR = (phase - 4) / 4 * maxR;
          const px = cx + pR * Math.cos(ang);
          const py = cy + pR * Math.sin(ang);
          ctx.fillStyle = 'rgba(50,50,50,0.2)';
          ctx.fillRect(px, py, 2, 2);
        }
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

export default CrystalBlooming;

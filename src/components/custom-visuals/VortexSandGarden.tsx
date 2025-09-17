import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: swirling particles settling into raked zen patterns
const VortexSandGarden: React.FC<VisualProps> = ({ width, height }) => {
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
      const phase = (time % 6);
      const cx = width / 2;
      const cy = height / 2;
      if (phase < 3) {
        const particles = 300;
        for (let i = 0; i < particles; i++) {
          const ang = time * 0.5 + i;
          const r = (phase / 3) * Math.min(cx, cy) + (i / particles) * Math.min(cx, cy);
          const x = cx + r * Math.cos(ang);
          const y = cy + r * Math.sin(ang) + phase * 10;
          ctx.fillStyle = 'rgba(50,50,50,0.4)';
          ctx.fillRect(x, y, 1, 1);
        }
      } else {
        const maxR = Math.min(cx, cy);
        for (let r = 10; r < maxR; r += 10) {
          ctx.beginPath();
          ctx.arc(cx, cy + 20, r, 0, Math.PI * 2);
          ctx.strokeStyle = 'rgba(50,50,50,0.3)';
          ctx.stroke();
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

export default VortexSandGarden;

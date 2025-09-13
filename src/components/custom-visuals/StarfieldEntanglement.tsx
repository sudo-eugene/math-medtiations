import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: mirrored cosmos, instantaneous connection
const StarfieldEntanglement: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    let time = 0;

    const stars = Array.from({ length: 120 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      speed: 0.2 + Math.random() * 0.4
    }));

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      stars.forEach((s, idx) => {
        const px = (s.x + time * s.speed) % width;
        const py = (s.y + time * s.speed * 0.5) % height;
        const mx = width - px;
        const my = height - py;
        const alpha = 0.3 + 0.7 * Math.abs(Math.sin(time * 0.1 + idx));
        ctx.fillStyle = `rgba(50,50,50,${alpha})`;
        ctx.fillRect(px, py, 2, 2);
        ctx.fillRect(mx, my, 2, 2);
      });
      time += 0.5;
      animationId = requestAnimationFrame(animate);
    };

    let animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [width, height]);

  return (
    <div className="flex justify-center items-center shadow-lg rounded-lg" style={{ width: `${width}px`, height: `${height}px`, backgroundColor: '#F0EEE6' }}>
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
    </div>
  );
};

export default StarfieldEntanglement;

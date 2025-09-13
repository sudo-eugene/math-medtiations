import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: natural order, blooming spirals
const FibonacciSpiralGarden: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    let count = 0;
    let time = 0;

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const golden = Math.PI * (3 - Math.sqrt(5));
      const max = 800;
      count = (count + 2) % max;

      for (let i = 0; i < count; i++) {
        const angle = i * golden;
        const r = Math.sqrt(i) * 6;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        const alpha = i / max;
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(50,50,50,${alpha})`;
        ctx.fill();
      }
      time += 0.02;
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

export default FibonacciSpiralGarden;

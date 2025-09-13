import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: infinite depth, recursive flow, gentle cascade
const FractalWaterfall: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    let time = 0;

    const drawFall = (x: number, y: number, w: number, h: number, depth: number) => {
      if (depth <= 0) return;
      const segments = 20;
      ctx.beginPath();
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const nx = x + w * (t - 0.5) + Math.sin(time + t * 10 + depth) * 10 / depth;
        const ny = y + h * t;
        if (i === 0) ctx.moveTo(nx, ny); else ctx.lineTo(nx, ny);
      }
      ctx.strokeStyle = `rgba(50,50,50,${0.2 + 0.6 / depth})`;
      ctx.stroke();
      drawFall(x - w * 0.15, y + h * 0.5, w * 0.7, h * 0.6, depth - 1);
      drawFall(x + w * 0.15, y + h * 0.5, w * 0.7, h * 0.6, depth - 1);
    };

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      drawFall(width / 2, 0, width * 0.4, height, 4);
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

export default FractalWaterfall;

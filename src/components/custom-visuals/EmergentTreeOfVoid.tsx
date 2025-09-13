import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: creation and dissolution
const EmergentTreeOfVoid: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    let time = 0;

    const grow = (x: number, y: number, len: number, angle: number, depth: number) => {
      if (depth <= 0 || len < 2) return;
      const nx = x + Math.cos(angle) * len;
      const ny = y + Math.sin(angle) * len;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(nx, ny);
      ctx.strokeStyle = `rgba(50,50,50,${0.1 + 0.2 * depth})`;
      ctx.stroke();
      const sway = Math.sin(time + depth) * 0.2;
      grow(nx, ny, len * 0.7, angle + 0.5 + sway, depth - 1);
      grow(nx, ny, len * 0.7, angle - 0.5 + sway, depth - 1);
    };

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      ctx.lineWidth = 1;
      grow(width / 2, height, height * 0.25, -Math.PI / 2, 6);
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

export default EmergentTreeOfVoid;

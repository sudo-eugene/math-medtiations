import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: recursive triangles, blooming & decay, subtle rotation
const SierpinskiBloom: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    let time = 0;

    const drawTri = (x: number, y: number, size: number, depth: number) => {
      ctx.beginPath();
      ctx.moveTo(x, y - size / 2);
      ctx.lineTo(x + size / 2, y + size / 2);
      ctx.lineTo(x - size / 2, y + size / 2);
      ctx.closePath();
      ctx.fillStyle = depth % 2 === 0 ? 'rgba(50,50,50,0.5)' : 'rgba(50,50,50,0.2)';
      ctx.fill();
      if (depth > 0) {
        const n = size / 2;
        drawTri(x, y - n / 2, n, depth - 1);
        drawTri(x - n / 2, y + n / 2, n, depth - 1);
        drawTri(x + n / 2, y + n / 2, n, depth - 1);
      }
    };

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      ctx.save();
      ctx.translate(width / 2, height / 2 + 20);
      const scale = 0.8 + 0.2 * Math.sin(time * 0.5);
      ctx.scale(scale, scale);
      ctx.rotate(time * 0.1);
      const size = Math.min(width, height) * 0.8;
      drawTri(0, -size / 3, size, 4);
      ctx.restore();
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

export default SierpinskiBloom;

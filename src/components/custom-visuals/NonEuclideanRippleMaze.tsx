import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: warped paths, shifting geometry
const NonEuclideanRippleMaze: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    let time = 0;

    const grid = 20;
    const gaps = new Set<string>();
    for (let i = 0; i < grid * grid; i++) {
      if (Math.random() < 0.3) {
        const x = i % grid;
        const y = Math.floor(i / grid);
        gaps.add(`${x},${y}`);
      }
    }

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      const cellW = width / grid;
      const cellH = height / grid;

      for (let i = 0; i < grid; i++) {
        for (let j = 0; j < grid; j++) {
          if (gaps.has(`${i},${j}`)) continue;
          const x = i * cellW;
          const y = j * cellH;
          const warp = Math.sin((x + y) * 0.02 + time) * 5;
          ctx.strokeStyle = 'rgba(50,50,50,0.3)';
          ctx.strokeRect(x + warp, y - warp, cellW, cellH);
        }
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

export default NonEuclideanRippleMaze;

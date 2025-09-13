import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: flow through recursion, layers of depth, movement in stillness
// Visualization: A cascading fractal waterfall where each level feeds a smaller fall beneath it

const FractalWaterfall: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const time = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const drawWaterfall = (
      x: number,
      y: number,
      w: number,
      h: number,
      level: number
    ) => {
      if (level <= 0) return;

      const lines = Math.max(8, 18 - level * 2);
      const opacity = 0.25 / level;

      for (let i = 0; i < lines; i++) {
        const p = i / (lines - 1);
        const sway = Math.sin(time.current + p * 6 + level) * (2 + level);
        const lineX = x + p * w + sway;

        ctx.beginPath();
        ctx.moveTo(lineX, y);
        ctx.lineTo(lineX, y + h);
        ctx.strokeStyle = `rgba(120, 160, 255, ${opacity})`;
        ctx.lineWidth = 1 + level * 0.2;
        ctx.stroke();
      }

      // Recursively draw the next tier of the waterfall
      const nextW = w * 0.7;
      const nextH = h * 0.55;
      const nextX = x + w * 0.15;
      const nextY = y + h * 0.75;
      drawWaterfall(nextX, nextY, nextW, nextH, level - 1);
    };

    const render = () => {
      if (!canvasRef.current) return;
      const ctx = canvasRef.current.getContext('2d');
      if (!ctx) return;

      time.current += 0.02;

      ctx.fillStyle = '#0a0a0a';
      ctx.fillRect(0, 0, width, height);

      drawWaterfall(0, 0, width, height, 5);

      animationRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px` }} className="bg-black">
      <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />
    </div>
  );
};

export default FractalWaterfall;

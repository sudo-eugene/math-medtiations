import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// A fractal tree that gently appears and recedes,
// mirroring balanced inhalation and exhalation.
const FractalBreathTree: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let time = 0;
    const maxDepth = 8;

    // Recursively draw branches; length and angle follow a sine wave
    const drawBranch = (
      x: number,
      y: number,
      length: number,
      angle: number,
      depth: number
    ) => {
      if (depth > maxDepth) return;

      const breath = 0.5 + 0.5 * Math.sin(time); // balanced inhalation and exhalation
      const sway = Math.sin(time + depth) * 0.3;

      const endX = x + Math.cos(angle + sway) * length;
      const endY = y + Math.sin(angle + sway) * length;

      ctx.strokeStyle = `rgba(34,139,34,${(1 - depth / maxDepth) * breath})`;
      ctx.lineWidth = Math.max(1, (maxDepth - depth) / 2);
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.stroke();

      const newLength = length * 0.7 * (0.7 + 0.3 * breath);
      drawBranch(endX, endY, newLength, angle - Math.PI / 6, depth + 1);
      drawBranch(endX, endY, newLength, angle + Math.PI / 6, depth + 1);
    };

    let frameId: number;
    const render = () => {
      ctx.clearRect(0, 0, width, height);
      drawBranch(width / 2, height, height / 4, -Math.PI / 2, 0);
      time += 0.02;
      frameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(frameId);
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default FractalBreathTree;

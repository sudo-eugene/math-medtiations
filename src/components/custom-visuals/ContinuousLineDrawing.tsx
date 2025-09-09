import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: perfection in imperfection, wisdom in simplicity, natural authenticity
// Visualization: A single continuous line that appears unrefined yet creates perfect harmony through its natural movement

const ContinuousLineDrawing: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  const animationRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let time = 0;
    const numPoints = 500;
    const points = [];

    for (let i = 0; i < numPoints; i++) {
      points.push({ x: width / 2, y: height / 2 });
    }

    const draw = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);

      for (let i = 1; i < numPoints; i++) {
        const angle = Math.sin(i * 0.1 + time) * Math.PI * 2;
        const distance = Math.cos(i * 0.05 - time) * 5;

        points[i].x = points[i - 1].x + Math.cos(angle) * distance;
        points[i].y = points[i - 1].y + Math.sin(angle) * distance;

        // Keep points within bounds
        if (points[i].x < 0 || points[i].x > width) points[i].x = points[i - 1].x;
        if (points[i].y < 0 || points[i].y > height) points[i].y = points[i - 1].y;

        ctx.lineTo(points[i].x, points[i].y);
      }

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      time += 0.01;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default ContinuousLineDrawing;

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: surrender to the moment, readiness for change, natural completion
// Visualization: A flowing grid that yields to invisible forces, showing how structure can remain while embracing constant change

const FlowingRibbons: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  const ctxRef = useRef(null);
  const pointsCacheRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let time = 0;
    const gridSize = 20;
    const noiseScale = 0.05;

    const getPoints = () => {
      if (pointsCacheRef.current) return pointsCacheRef.current;

      const points = [];
      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const u = x / (gridSize - 1);
          const v = y / (gridSize - 1);
          points.push({ u, v });
        }
      }
      pointsCacheRef.current = points;
      return points;
    };

    const points = getPoints();

    const draw = () => {
      const ctx = ctxRef.current;
      if (!ctx) return;

      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < points.length; i++) {
        const { u, v } = points[i];
        const x = u * width;
        const y = v * height;

        const angle = Math.sin(x * noiseScale + time) + Math.cos(y * noiseScale + time);
        const length = 20;

        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.stroke();
      }

      time += 0.01;
      requestAnimationFrame(draw);
    };

    draw();

  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default FlowingRibbons;

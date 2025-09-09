import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: unseen forces, underlying structure, harmony in flow
// Visualization: A vector field that shows the unseen forces guiding particles, revealing the underlying structure of space

const VectorFieldLines: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let time = 0;
    const gridSize = 20;
    const noiseScale = 0.02;

    let animationFrameId: number;
    const draw = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const u = x / (gridSize - 1);
          const v = y / (gridSize - 1);
          const px = u * width;
          const py = v * height;

          const angle = (Math.sin(px * noiseScale + time) + Math.cos(py * noiseScale + time)) * Math.PI;
          const length = 20;

          ctx.beginPath();
          ctx.moveTo(px, py);
          ctx.lineTo(px + Math.cos(angle) * length, py + Math.sin(angle) * length);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.stroke();
        }
      }

      time += 0.01;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };

  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default VectorFieldLines;

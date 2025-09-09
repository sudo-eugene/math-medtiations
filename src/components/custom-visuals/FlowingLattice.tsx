import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: underlying structure, harmony in flow, interconnectedness
// Visualization: A lattice of points that flows and shifts, revealing the interconnectedness of all things

const FlowingLattice: React.FC<VisualProps> = ({ width, height }) => {
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

    const draw = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      for (let x = 0; x < gridSize; x++) {
        for (let y = 0; y < gridSize; y++) {
          const u = x / (gridSize - 1);
          const v = y / (gridSize - 1);
          const px = u * width;
          const py = v * height;

          const offsetX = Math.sin(v * 10 + time) * 10;
          const offsetY = Math.cos(u * 10 + time) * 10;

          ctx.beginPath();
          ctx.arc(px + offsetX, py + offsetY, 2, 0, 2 * Math.PI);
          ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
          ctx.fill();
        }
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

export default FlowingLattice;

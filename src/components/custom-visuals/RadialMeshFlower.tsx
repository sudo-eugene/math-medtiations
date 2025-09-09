import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: effortless action, natural development, finding strength in yielding
// Visualization: A radial mesh that unfolds like a flower, demonstrating how natural development occurs without force

const RadialMeshFlower: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let time = 0;

    const draw = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const numPetals = 12;
      const maxRadius = Math.min(width, height) * 0.4;

      for (let i = 0; i < numPetals; i++) {
        const angle = (i / numPetals) * 2 * Math.PI;
        const radius = maxRadius * (Math.sin(time + angle) * 0.2 + 0.8);

        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.2)';
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

export default RadialMeshFlower;

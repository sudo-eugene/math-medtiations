import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: yielding to overcome, softness over hardness, finding strength in adaptability
// Visualization: A canyon landscape with stratified layers that undulate softly, showing how yielding to pressure creates new forms

const CanyonStratifiedUndulations: React.FC<VisualProps> = ({ width, height }) => {
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

      const layers = 50;
      for (let i = 0; i < layers; i++) {
        const y = (i / layers) * height;
        ctx.beginPath();
        ctx.moveTo(0, y);

        for (let x = 0; x < width; x++) {
          const angle = Math.sin(x * 0.01 + time + i * 0.1) * 10;
          ctx.lineTo(x, y + angle);
        }

        ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 + (i / layers) * 0.2})`;
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

export default CanyonStratifiedUndulations;

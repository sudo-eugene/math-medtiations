import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: emptiness as potential, stillness in motion, unity of form
// Visualization: A rhombus that breathes and expands from a central point, showing how form arises from emptiness and returns to it

const BreathingRhombus: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const draw = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const size = Math.min(width, height) * 0.4 * (Math.sin(time) * 0.2 + 1);

      ctx.beginPath();
      ctx.moveTo(centerX, centerY - size);
      ctx.lineTo(centerX + size, centerY);
      ctx.lineTo(centerX, centerY + size);
      ctx.lineTo(centerX - size, centerY);
      ctx.closePath();

      ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();

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

export default BreathingRhombus;

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: potential in emptiness, form from formlessness, subtle influence
// Visualization: An implicit surface that shifts and changes, revealing the potential for form within what appears to be empty space

const ImplicitDreams: React.FC<VisualProps> = ({ width, height }) => {
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

      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const u = (x / width - 0.5) * 2;
          const v = (y / height - 0.5) * 2;
          const value = Math.sin(u * 10 + time) + Math.cos(v * 10 + time) - (u * u + v * v);

          if (Math.abs(value) < 0.1) {
            const index = (y * width + x) * 4;
            data[index] = 0;
            data[index + 1] = 0;
            data[index + 2] = 0;
            data[index + 3] = 255;
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      time += 0.02;
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

export default ImplicitDreams;

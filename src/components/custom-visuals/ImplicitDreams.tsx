import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: potential in emptiness, form from formlessness, subtle influence
// Visualization: An implicit surface that shifts and changes, revealing the potential for form within what appears to be empty space

const ImplicitDreams: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ctxRef = useRef<CanvasRenderingContext2D | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctxRef.current = ctx;

    let time = 0;

    const draw = () => {
      const context = ctxRef.current;
      if (!context) {
        return;
      }

      const imageData = context.createImageData(width, height);
      const data = imageData.data;

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          const u = (x / width - 0.5) * 2;
          const v = (y / height - 0.5) * 2;
          const value = Math.sin(u * 10 + time) + Math.cos(v * 10 + time) - (u * u + v * v);

          const index = (y * width + x) * 4;

          if (Math.abs(value) < 0.1) {
            data[index] = 0;
            data[index + 1] = 0;
            data[index + 2] = 0;
            data[index + 3] = 255;
          } else {
            // Leave pixel transparent, we'll paint background beneath afterwards.
            data[index + 3] = 0;
          }
        }
      }

      context.putImageData(imageData, 0, 0);

      // Paint background underneath the implicit lines so printable override can swap colors.
      context.save();
      context.globalCompositeOperation = 'destination-over';
      context.fillStyle = '#F0EEE6';
      context.fillRect(0, 0, width, height);
      context.restore();

      time += 0.02;
      animationFrameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };

  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default ImplicitDreams;

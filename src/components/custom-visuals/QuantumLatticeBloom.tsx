import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: hidden order, quantum fluctuations, discrete expansion
const QuantumLatticeBloom: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    let time = 0;

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const cols = 24;
      const rows = 24;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const cx = (i + 0.5) * width / cols;
          const cy = (j + 0.5) * height / rows;
          const phase = Math.sin(time + i * 0.3 + j * 0.3);
          const r = 2 + phase * 2;
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(50,50,50,${0.4 + 0.4 * phase})`;
          ctx.fill();
        }
      }
      time += 0.04;
      animationId = requestAnimationFrame(animate);
    };
    let animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [width, height]);

  return (
    <div
      className="flex justify-center items-center shadow-lg rounded-lg"
      style={{ width: `${width}px`, height: `${height}px`, backgroundColor: '#F0EEE6' }}
    >
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
    </div>
  );
};

export default QuantumLatticeBloom;

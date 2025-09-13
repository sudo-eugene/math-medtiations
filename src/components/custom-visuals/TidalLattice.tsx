import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: breathing oceanic grid with rogue waves
const TidalLattice: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    let time = 0;
    let rogueColumn = Math.floor(Math.random() * 20);
    let rogueTimer = 0;

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      const cols = 20;
      const rows = 20;
      const cellW = width / cols;
      const cellH = height / rows;

      if (rogueTimer++ > 300) {
        rogueColumn = Math.floor(Math.random() * cols);
        rogueTimer = 0;
      }

      for (let i = 0; i < cols; i++) {
        ctx.beginPath();
        for (let j = 0; j < rows; j++) {
          let offset = Math.sin(time + i * 0.3) * 5;
          if (Math.abs(i - rogueColumn) < 2) {
            offset += Math.sin(time * 3) * 10 * (1 - Math.abs(i - rogueColumn) / 2);
          }
          const x = i * cellW;
          const y = j * cellH + offset;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(50,50,50,0.3)';
        ctx.stroke();
      }

      for (let j = 0; j < rows; j++) {
        ctx.beginPath();
        for (let i = 0; i < cols; i++) {
          let offset = Math.sin(time + i * 0.3) * 5;
          if (Math.abs(i - rogueColumn) < 2) {
            offset += Math.sin(time * 3) * 10 * (1 - Math.abs(i - rogueColumn) / 2);
          }
          const x = i * cellW;
          const y = j * cellH + offset;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = 'rgba(50,50,50,0.2)';
        ctx.stroke();
      }

      time += 0.02;
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

export default TidalLattice;

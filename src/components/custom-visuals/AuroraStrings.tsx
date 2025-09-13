import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: auroral strands, gentle drift, shimmering glow
const AuroraStrings: React.FC<VisualProps> = ({ width, height }) => {
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
      const strings = 6;
      for (let s = 0; s < strings; s++) {
        const phase = (s / strings) * Math.PI * 2;
        ctx.beginPath();
        for (let x = 0; x < width; x += 4) {
          const y = height / 2 + Math.sin(x * 0.02 + time + phase) * (20 + s * 5);
          const drift = Math.sin(time * 0.1 + phase) * 20;
          if (x === 0) ctx.moveTo(x, y + drift);
          else ctx.lineTo(x, y + drift);
        }
        const alpha = 0.2 + 0.1 * Math.sin(time + phase * 2);
        ctx.strokeStyle = `rgba(50,50,50,${alpha})`;
        ctx.lineWidth = 1 + (Math.random() < 0.02 ? 1 : 0);
        ctx.stroke();
      }
      time += 0.03;
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

export default AuroraStrings;

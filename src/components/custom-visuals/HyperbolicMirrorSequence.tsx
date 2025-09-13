import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: infinite reflections, curved space
const HyperbolicMirrorSequence: React.FC<VisualProps> = ({ width, height }) => {
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
      const cx = width / 2;
      const cy = height * 0.9;
      const mirrors = 20;
      for (let i = 0; i < mirrors; i++) {
        const t = i / mirrors;
        const r = (Math.exp(t * 3) - 1) / (Math.exp(3) - 1) * width;
        ctx.beginPath();
        ctx.arc(cx, cy, r, Math.PI, Math.PI * 2);
        ctx.strokeStyle = `rgba(50,50,50,${0.4 - t * 0.4})`;
        ctx.stroke();
      }
      time += 0.01;
      animationId = requestAnimationFrame(animate);
    };

    let animationId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationId);
  }, [width, height]);

  return (
    <div className="flex justify-center items-center shadow-lg rounded-lg" style={{ width: `${width}px`, height: `${height}px`, backgroundColor: '#F0EEE6' }}>
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
    </div>
  );
};

export default HyperbolicMirrorSequence;

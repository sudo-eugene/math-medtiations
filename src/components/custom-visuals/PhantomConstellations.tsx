import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: flickering constellations revealing hidden patterns
const PhantomConstellations: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    const stars = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
    }));
    const pairs = Array.from({ length: 40 }, (_, i) => [i, Math.floor(Math.random() * 80)]);
    let time = 0;

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      stars.forEach(s => {
        const twinkle = 0.3 + 0.3 * Math.sin(time * 5 + s.x);
        ctx.fillStyle = `rgba(50,50,50,${twinkle})`;
        ctx.fillRect(s.x, s.y, 2, 2);
      });
      const mode = Math.floor(time / 5) % 2;
      ctx.strokeStyle = 'rgba(50,50,50,0.3)';
      pairs.forEach(([a, b]) => {
        if (mode === 0 && b % 5 !== 0) return;
        const s1 = stars[a];
        const s2 = stars[b];
        ctx.beginPath();
        ctx.moveTo(s1.x, s1.y);
        ctx.lineTo(s2.x, s2.y);
        ctx.stroke();
      });
      time += 0.01;
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

export default PhantomConstellations;

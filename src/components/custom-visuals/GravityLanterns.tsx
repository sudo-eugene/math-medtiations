import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: lanterns rising, orbital pairings, drifting upward
const GravityLanterns: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    const lanterns = Array.from({ length: 30 }, () => ({
      x: Math.random() * width,
      y: height + Math.random() * 40,
      vx: 0,
      vy: -1 - Math.random(),
      phase: Math.random() * Math.PI * 2,
    }));
    let time = 0;

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      lanterns.forEach((l, i) => {
        l.x += Math.sin(time * 0.5 + l.phase) * 0.5;
        l.y += l.vy;
        if (i % 2 === 0) {
          const partner = lanterns[i + 1];
          if (partner) {
            const midX = (l.x + partner.x) / 2;
            const midY = (l.y + partner.y) / 2;
            const ang = time + l.phase;
            const radius = 10;
            l.x = midX + Math.cos(ang) * radius;
            l.y = midY + Math.sin(ang) * radius;
            partner.x = midX + Math.cos(ang + Math.PI) * radius;
            partner.y = midY + Math.sin(ang + Math.PI) * radius;
          }
        }
        if (l.y < -10) {
          l.x = Math.random() * width;
          l.y = height + Math.random() * 40;
        }
        ctx.fillStyle = 'rgba(50,50,50,0.4)';
        ctx.fillRect(l.x, l.y, 3, 3);
      });
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

export default GravityLanterns;

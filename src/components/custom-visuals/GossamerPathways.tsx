import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: transient webs, random walk threads, wind sway
const GossamerPathways: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    const particles = Array.from({ length: 40 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: 0,
      vy: 0,
    }));
    let time = 0;

    const animate = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.1)';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(50,50,50,0.3)';
      ctx.lineWidth = 1;
      particles.forEach(p => {
        const angle = Math.random() * Math.PI * 2;
        p.vx += Math.cos(angle) * 0.1 + Math.sin(time * 0.2) * 0.05;
        p.vy += Math.sin(angle) * 0.1 + Math.cos(time * 0.2) * 0.05;
        const nx = p.x + p.vx;
        const ny = p.y + p.vy;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        p.x = (nx + width) % width;
        p.y = (ny + height) % height;
        p.vx *= 0.9;
        p.vy *= 0.9;
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

export default GossamerPathways;

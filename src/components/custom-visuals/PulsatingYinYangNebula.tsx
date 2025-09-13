import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: duality, harmony, cosmic breath
const PulsatingYinYangNebula: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    let time = 0;

    const particles = Array.from({ length: 800 }, (_, i) => ({ angle: (i / 800) * Math.PI * 2 }));

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      const cx = width / 2;
      const cy = height / 2;
      const baseR = Math.min(width, height) * 0.35;
      const breathe = baseR * 0.15 * Math.sin(time * 0.5);

      particles.forEach((p, idx) => {
        const dir = idx % 2 === 0 ? 1 : -1;
        const r = baseR + breathe * dir;
        const angle = p.angle + dir * time * 0.2;
        const x = cx + Math.cos(angle) * r;
        const y = cy + Math.sin(angle) * r;
        ctx.beginPath();
        ctx.arc(x, y, 2, 0, Math.PI * 2);
        ctx.fillStyle = idx % 2 === 0 ? 'rgba(50,50,50,0.5)' : 'rgba(120,120,120,0.5)';
        ctx.fill();
      });
      time += 0.02;
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

export default PulsatingYinYangNebula;

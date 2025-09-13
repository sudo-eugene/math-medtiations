import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: one-sided journey, endless loop
const MobiusFlowTunnel: React.FC<VisualProps> = ({ width, height }) => {
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
      const cy = height / 2;
      const rings = 30;
      for (let i = 0; i < rings; i++) {
        const t = i / rings;
        const r = t * Math.min(width, height) * 0.5;
        const twist = Math.sin(time + t * Math.PI) * 30;
        ctx.beginPath();
        ctx.ellipse(cx, cy, r, r * 0.4, time + t * Math.PI, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(50,50,50,${0.5 - t * 0.5})`;
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(cx - r, cy);
        ctx.lineTo(cx + r, cy + twist);
        ctx.strokeStyle = `rgba(80,80,80,${0.3 - t * 0.3})`;
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

export default MobiusFlowTunnel;

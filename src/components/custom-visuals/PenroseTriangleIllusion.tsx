import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: paradox, shifting perspective
const PenroseTriangleIllusion: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    let time = 0;

    const drawBeam = (angle: number) => {
      const cx = width / 2;
      const cy = height / 2;
      const r = Math.min(width, height) * 0.3;
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(angle);
      ctx.beginPath();
      ctx.moveTo(-r, -r * 0.2);
      ctx.lineTo(r, -r * 0.2);
      ctx.lineTo(r, r * 0.2);
      ctx.lineTo(-r, r * 0.2);
      ctx.closePath();
      ctx.fillStyle = 'rgba(50,50,50,0.4)';
      ctx.fill();
      ctx.restore();
    };

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      const rot = time * 0.2;
      drawBeam(rot);
      drawBeam(rot + (2 * Math.PI) / 3);
      drawBeam(rot + (4 * Math.PI) / 3);
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

export default PenroseTriangleIllusion;

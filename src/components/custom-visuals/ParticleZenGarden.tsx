import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// action through non-action leaves harmonious traces

const ParticleZenGarden: React.FC<VisualProps & { count?: number }> = ({ width, height, count = 800 }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number>();
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number }[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // initialize particles at random positions
    particlesRef.current = Array.from({ length: count }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.1,
      vy: (Math.random() - 0.5) * 0.1,
    }));

    const rakePeriod = 8000; // ms
    const rakeDuration = 2000; // ms

    const render = (time: number) => {
      // fade trails
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const phase = time % rakePeriod;
      const isRaking = phase < rakeDuration;
      const rakePhase = phase / rakeDuration;

      for (const p of particlesRef.current) {
        if (isRaking) {
          const force = Math.sin((p.x / width) * Math.PI * 4 + rakePhase * Math.PI) * 0.5;
          p.vy += force;
        } else {
          p.vx *= 0.98;
          p.vy *= 0.98;
        }

        p.x += p.vx;
        p.y += p.vy;

        if (p.x < 0) p.x += width;
        if (p.x > width) p.x -= width;
        if (p.y < 0) p.y += height;
        if (p.y > height) p.y -= height;

        ctx.fillStyle = 'rgba(60,60,60,0.4)';
        ctx.fillRect(p.x, p.y, 1, 1);
      }

      animationRef.current = requestAnimationFrame(render);
    };

    // initial background
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    animationRef.current = requestAnimationFrame(render);

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [width, height, count]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px` }} className="bg-[#F0EEE6]">
      <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />
    </div>
  );
};

export default ParticleZenGarden;


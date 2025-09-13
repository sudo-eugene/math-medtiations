import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Philosophical musing: within the Poincaré disk we glimpse the limitless within limits—infinite paths housed in a finite circle.

const HyperbolicSunburst: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const frameRef = useRef<number>();
  const timeRef = useRef(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const cx = width / 2;
    const cy = height / 2;
    const diskRadius = Math.min(width, height) * 0.48;

    const draw = () => {
      timeRef.current += 0.01;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const rays = 60;
      const rotation = timeRef.current * 0.1; // slow rotation
      const curvature = 1 + 0.2 * Math.sin(timeRef.current * 0.3); // animate curvature

      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2 + rotation;
        ctx.beginPath();
        ctx.moveTo(cx, cy);

        const steps = 100;
        for (let s = 1; s <= steps; s++) {
          const t = s / steps;
          const rho = t * 3; // hyperbolic distance
          let r = Math.tanh(rho / 2);
          r = Math.pow(r, curvature);
          const x = cx + r * diskRadius * Math.cos(angle);
          const y = cy + r * diskRadius * Math.sin(angle);
          ctx.lineTo(x, y);
        }

        const hue = (i * 360 / rays + timeRef.current * 40) % 360;
        ctx.strokeStyle = `hsl(${hue}, 70%, 50%)`;
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // boundary circle
      ctx.beginPath();
      ctx.arc(cx, cy, diskRadius, 0, Math.PI * 2);
      ctx.strokeStyle = '#444';
      ctx.lineWidth = 2;
      ctx.stroke();

      frameRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (frameRef.current) cancelAnimationFrame(frameRef.current);
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, backgroundColor: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ display: 'block' }} />
    </div>
  );
};

export default HyperbolicSunburst;

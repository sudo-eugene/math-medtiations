import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Hand-drawn-feel torus parameter lines breathing/rotating (2D canvas projection)
const TorusBreathLines: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    let raf: number | null = null;
    let t = 0;

    const project = (x: number, y: number, z: number) => {
      const f = 260 / (z + 400);
      return [x * f + width / 2, y * f + height / 2];
    };

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const R = 120 + 10 * Math.sin(t * 0.7);
      const r = 46 + 6 * Math.sin(t * 0.9 + 0.6);

      // rotating torus
      const rotX = t * 0.3;
      const rotY = t * 0.22 + 0.8;

      const rot = (x: number, y: number, z: number) => {
        // rotate around X then Y
        let yy = y * Math.cos(rotX) - z * Math.sin(rotX);
        let zz = y * Math.sin(rotX) + z * Math.cos(rotX);
        let xx = x * Math.cos(rotY) + zz * Math.sin(rotY);
        zz = -x * Math.sin(rotY) + zz * Math.cos(rotY);
        return [xx, yy, zz];
      };

      ctx.strokeStyle = 'rgba(60,60,60,0.35)';
      ctx.lineWidth = 0.8;

      // u-lines (major direction)
      for (let i = 0; i < 48; i++) {
        const v = (i / 48) * Math.PI * 2;
        ctx.beginPath();
        const steps = 220;
        for (let j = 0; j <= steps; j++) {
          const u = (j / steps) * Math.PI * 2;
          const x = (R + r * Math.cos(v)) * Math.cos(u);
          const y = (R + r * Math.cos(v)) * Math.sin(u);
          const z = r * Math.sin(v);
          const [xx, yy, zz] = rot(x, y, z);
          const [sx, sy] = project(xx, yy, zz);
          if (j === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }

      // v-lines (minor direction)
      ctx.strokeStyle = 'rgba(60,60,60,0.22)';
      for (let j = 0; j < 48; j++) {
        const u = (j / 48) * Math.PI * 2;
        ctx.beginPath();
        const steps = 140;
        for (let i = 0; i <= steps; i++) {
          const v = (i / steps) * Math.PI * 2;
          const x = (R + r * Math.cos(v)) * Math.cos(u);
          const y = (R + r * Math.cos(v)) * Math.sin(u);
          const z = r * Math.sin(v);
          const [xx, yy, zz] = rot(x, y, z);
          const [sx, sy] = project(xx, yy, zz);
          if (i === 0) ctx.moveTo(sx, sy); else ctx.lineTo(sx, sy);
        }
        ctx.stroke();
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [width, height]);

  return (
    <div style={{ width, height, background: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default TorusBreathLines;


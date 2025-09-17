import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Delicate multi-layer logarithmic spirals drifting like translucent veils
const SacredSpiralVeil: React.FC<VisualProps> = ({ width, height }) => {
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

    const drawSpiral = (
      cx: number,
      cy: number,
      baseR: number,
      turns: number,
      rot: number,
      fade: number
    ) => {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rot);
      ctx.beginPath();
      const steps = 1200;
      for (let i = 0; i < steps; i++) {
        const p = i / (steps - 1);
        // logarithmic spiral: r = baseR * e^(a * theta)
        const theta = p * turns * Math.PI * 2;
        const a = 0.12 + 0.02 * Math.sin(t * 0.3 + fade);
        const r = baseR * Math.exp(a * theta);
        const x = r * Math.cos(theta);
        const y = r * Math.sin(theta);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = `rgba(60,60,60,${fade})`;
      ctx.lineWidth = 0.8;
      ctx.stroke();
      ctx.restore();
    };

    const render = () => {
      t += 0.006;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      // Layers of drifting spirals
      const layers = 6;
      for (let i = 0; i < layers; i++) {
        const angle = t * (0.1 + i * 0.02) + i * 0.8;
        const baseR = 2 + i * 4 + 6 * Math.sin(t * 0.2 + i);
        const turns = 2.2 + 0.6 * Math.sin(t * 0.3 + i * 0.5);
        const alpha = 0.55 - i * 0.07;
        drawSpiral(cx, cy, baseR, turns, angle, Math.max(0.06, alpha));
      }

      // Soft radial veil
      const grad = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(cx, cy));
      grad.addColorStop(0, 'rgba(240,238,230,0)');
      grad.addColorStop(1, 'rgba(240,238,230,0.5)');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => {
      if (raf) cancelAnimationFrame(raf);
    };
  }, [width, height]);

  return (
    <div style={{ width, height, background: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default SacredSpiralVeil;


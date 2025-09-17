import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Vertical aurora-like veils drifting with sinuous distortion
const AuroraVeil: React.FC<VisualProps> = ({ width, height }) => {
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

    const render = () => {
      t += 0.007;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const bands = 24;
      for (let i = 0; i < bands; i++) {
        const x = (i / bands) * width;
        const w = (0.6 + 0.6 * Math.sin(t + i * 0.3)) * (width / bands) * 0.8;
        const sway = 40 * Math.sin(t * 1.2 + i * 0.4);

        const grad = ctx.createLinearGradient(x + sway, 0, x + sway, height);
        const a = 0.18 + 0.12 * Math.sin(t * 0.8 + i);
        grad.addColorStop(0, `rgba(60,60,60,${a})`);
        grad.addColorStop(1, 'rgba(60,60,60,0)');
        ctx.fillStyle = grad;
        ctx.fillRect(x + sway - w / 2, 0, w, height);
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

export default AuroraVeil;


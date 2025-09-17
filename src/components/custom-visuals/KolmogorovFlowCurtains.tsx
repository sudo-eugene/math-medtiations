// Themes: sinusoidal shear, layered flow, tranquil curtains
// Visualisation: Flowing curtains follow a Kolmogorov velocity field, sliding gently in layers
// Unique mechanism: Advects tracer ribbons through the analytic Kolmogorov flow u=sin(y), v=sin(x) to produce layered curtains
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Ribbon {
  x: number;
  y: number;
  history: number[];
  shade: number;
}

const KolmogorovFlowCurtains: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    const ribbonCount = 240;
    const ribbons: Ribbon[] = Array.from({ length: ribbonCount }).map(() => ({
      x: Math.random() * width,
      y: height * (0.15 + Math.random() * 0.7),
      history: [],
      shade: 0.04 + Math.random() * 0.12,
    }));
    const maxHistory = 90;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const scaleX = Math.PI * 2 / width;
      const scaleY = Math.PI * 2 / height;
      const dt = 0.8;

      ctx.lineWidth = 0.85;
      for (let i = 0; i < ribbons.length; i++) {
        const ribbon = ribbons[i];
        const u = Math.sin(ribbon.y * scaleY + 0.3 * Math.sin(time * 0.0004));
        const v = Math.sin(ribbon.x * scaleX + 0.2 * Math.cos(time * 0.0005));
        ribbon.x += u * dt * 18;
        ribbon.y += v * dt * 12;
        if (ribbon.x < width * 0.05 || ribbon.x > width * 0.95 || ribbon.y < height * 0.1 || ribbon.y > height * 0.9) {
          ribbon.x = Math.random() * width;
          ribbon.y = height * (0.15 + Math.random() * 0.7);
          ribbon.history.length = 0;
        }
        ribbon.history.push(ribbon.x, ribbon.y);
        if (ribbon.history.length > maxHistory * 2) {
          ribbon.history.splice(0, ribbon.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${ribbon.shade})`;
        ctx.beginPath();
        const pts = ribbon.history;
        for (let p = 0; p < pts.length; p += 2) {
          const x = pts[p];
          const y = pts[p + 1];
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6', overflow: 'hidden' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

const metadata = {
  themes: 'kolmogorov,flow,curtains',
  visualisation: 'Kolmogorov flow carries ink curtains across the page',
  promptSuggestion: '1. Follow the sinusoidal shear guiding ribbons\n2. Imagine gentle flow balancing itself\n3. Let the curtains drift you into calm'
};
(KolmogorovFlowCurtains as any).metadata = metadata;

export default KolmogorovFlowCurtains;

// Differs from others by: Advects tracer ribbons through the analytic Kolmogorov flow u=sin(y), v=sin(x).

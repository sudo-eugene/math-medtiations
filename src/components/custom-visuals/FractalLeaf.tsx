import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Barnsley fern-like IFS leaf with slowly morphing coefficients
const FractalLeaf: React.FC<VisualProps> = ({ width, height }) => {
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
      t += 0.01;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      ctx.fillStyle = 'rgba(60,60,60,0.7)';

      // morph slight variations around Barnsley fern parameters
      const f1 = { a: 0, b: 0, c: 0, d: 0.16 + 0.02 * Math.sin(t * 0.7), e: 0, f: 0, p: 0.01 };
      const f2 = { a: 0.85 + 0.02 * Math.sin(t * 0.3), b: 0.04, c: -0.04, d: 0.85 - 0.02 * Math.sin(t * 0.3), e: 0, f: 1.6, p: 0.85 };
      const f3 = { a: 0.2, b: -0.26, c: 0.23, d: 0.22, e: 0, f: 1.6, p: 0.07 };
      const f4 = { a: -0.15, b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, p: 0.07 };
      const maps = [f1, f2, f3, f4];
      const cum = maps.reduce<number[]>((acc, m, i) => { acc[i] = (acc[i-1] || 0) + m.p; return acc; }, [] as number[]);

      let x = 0, y = 0;
      const steps = 60000;
      for (let i = 0; i < steps; i++) {
        const r = Math.random();
        const idx = r < cum[0] ? 0 : r < cum[1] ? 1 : r < cum[2] ? 2 : 3;
        const m = maps[idx];
        const xn = m.a * x + m.b * y + m.e;
        const yn = m.c * x + m.d * y + m.f;
        x = xn; y = yn;
        if (i > 20) {
          const sx = width * 0.5 + x * 40;
          const sy = height * 0.98 - y * 40;
          if (sx >= 0 && sx < width && sy >= 0 && sy < height) ctx.fillRect(sx, sy, 1, 1);
        }
      }

      // soft vignette
      const g = ctx.createRadialGradient(width/2, height/2, 0, width/2, height/2, Math.min(width,height)*0.7);
      g.addColorStop(0, 'rgba(240,238,230,0)');
      g.addColorStop(1, 'rgba(240,238,230,0.6)');
      ctx.fillStyle = g;
      ctx.fillRect(0,0,width,height);

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

export default FractalLeaf;


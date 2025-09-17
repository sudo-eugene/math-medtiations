// Themes: fractal softness, ribbon arithmetic, gentle irregularity
// Visualisation: Ribbons undulate following the velocity of a Weierstrass function field
// Unique mechanism: Samples a Weierstrass function to construct a fractal velocity field driving ribbon traces
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const WeierstrassRibbonField: React.FC<VisualProps> = ({ width, height }) => {
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

    const ribbons = 24;
    const segments = 160;
    const points = new Float32Array(ribbons * segments * 2);

    const weierstrass = (x: number, y: number, t: number) => {
      const a = 0.5;
      const b = 3;
      let sumX = 0;
      let sumY = 0;
      for (let n = 0; n < 6; n++) {
        const phase = b ** n;
        sumX += (a ** n) * Math.cos(phase * x + t * 0.6);
        sumY += (a ** n) * Math.sin(phase * y - t * 0.7);
      }
      return { sumX, sumY };
    };

    const initialize = () => {
      for (let r = 0; r < ribbons; r++) {
        const angle = (r / ribbons) * Math.PI * 2;
        const startX = width / 2 + Math.cos(angle) * Math.min(width, height) * 0.25;
        const startY = height / 2 + Math.sin(angle) * Math.min(width, height) * 0.25;
        for (let s = 0; s < segments; s++) {
          const idx = (r * segments + s) * 2;
          points[idx] = startX;
          points[idx + 1] = startY;
        }
      }
    };

    initialize();

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      for (let r = 0; r < ribbons; r++) {
        for (let s = segments - 1; s > 0; s--) {
          const idx = (r * segments + s) * 2;
          const prevIdx = (r * segments + s - 1) * 2;
          points[idx] = points[prevIdx];
          points[idx + 1] = points[prevIdx + 1];
        }
        const headIdx = (r * segments) * 2;
        const nx = (points[headIdx] / width - 0.5) * 2;
        const ny = (points[headIdx + 1] / height - 0.5) * 2;
        const field = weierstrass(nx, ny, t);
        points[headIdx] += field.sumX * 12;
        points[headIdx + 1] += field.sumY * 12;

        if (points[headIdx] < width * 0.06 || points[headIdx] > width * 0.94 || points[headIdx + 1] < height * 0.06 || points[headIdx + 1] > height * 0.94) {
          const angle = Math.random() * Math.PI * 2;
          points[headIdx] = width / 2 + Math.cos(angle) * Math.min(width, height) * 0.25;
          points[headIdx + 1] = height / 2 + Math.sin(angle) * Math.min(width, height) * 0.25;
        }
      }

      ctx.lineWidth = 0.9;
      for (let r = 0; r < ribbons; r++) {
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.08 * (r / ribbons)})`;
        ctx.beginPath();
        for (let s = 0; s < segments; s++) {
          const idx = (r * segments + s) * 2;
          const x = points[idx];
          const y = points[idx + 1];
          if (s === 0) ctx.moveTo(x, y);
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
  themes: 'weierstrass,ribbon,fractals',
  visualisation: 'Fractal velocity fields guide ribbons across the page',
  promptSuggestion: '1. Feel softness in fractal irregularity\n2. Let ribbons entrain your attention\n3. Imagine arithmetic wind moving gently'
};
(WeierstrassRibbonField as any).metadata = metadata;

export default WeierstrassRibbonField;

// Differs from others by: Uses Weierstrass function samples to generate a fractal velocity field that advects ribbon traces.

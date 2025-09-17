// Themes: complex growth, logarithmic calm, analytic spirals
// Visualisation: Complex log spirals unfurl from the center, drifting with gentle analytic motion
// Unique mechanism: Evolves complex points via z' = log(z) and renders their trails, producing analytic spirals
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Spiral {
  x: number;
  y: number;
  history: number[];
  hue: number;
}

const ComplexLogSpiralGarden: React.FC<VisualProps> = ({ width, height }) => {
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

    const spiralCount = 60;
    const spirals: Spiral[] = Array.from({ length: spiralCount }).map((_, i) => ({
      x: 0.4 * Math.cos((i / spiralCount) * Math.PI * 2),
      y: 0.4 * Math.sin((i / spiralCount) * Math.PI * 2),
      history: [],
      hue: i / spiralCount,
    }));
    const dt = 0.015;
    const maxHistory = 140;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const scale = Math.min(width, height) * 0.28;

      ctx.lineWidth = 0.85;
      for (let i = 0; i < spirals.length; i++) {
        const s = spirals[i];
        const r = Math.hypot(s.x, s.y);
        const theta = Math.atan2(s.y, s.x);
        const logMod = Math.log(Math.max(r, 1e-3));
        const logArg = theta;
        const dx = (logMod) - logArg * s.y;
        const dy = logArg + logMod * s.x;
        s.x += dx * dt * 0.4;
        s.y += dy * dt * 0.4;
        if (Math.hypot(s.x, s.y) > 2) {
          s.x = 0.3 * Math.cos(Math.random() * Math.PI * 2);
          s.y = 0.3 * Math.sin(Math.random() * Math.PI * 2);
          s.history.length = 0;
        }
        const px = cx + s.x * scale;
        const py = cy + s.y * scale;
        s.history.push(px, py);
        if (s.history.length > maxHistory * 2) {
          s.history.splice(0, s.history.length - maxHistory * 2);
        }
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + s.hue * 0.1})`;
        ctx.beginPath();
        const pts = s.history;
        for (let j = 0; j < pts.length; j += 2) {
          const x = pts[j];
          const y = pts[j + 1];
          if (j === 0) ctx.moveTo(x, y);
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
  themes: 'complex-log,spiral,garden',
  visualisation: 'Analytic log spirals weave a calm garden',
  promptSuggestion: '1. Watch complex logs guide growth\n2. Imagine analytic curves unfurling\n3. Let the spiral garden relax you'
};
(ComplexLogSpiralGarden as any).metadata = metadata;

export default ComplexLogSpiralGarden;

// Differs from others by: Evolves complex points via the logarithmic vector field z' = log(z) to generate spirals.

// Themes: flowing script, mandala calm, looping breath
// Visualisation: Bézier loops orbit and breathe, drawing layered mandala petals
// Unique mechanism: Animates multiple cubic Bézier curves whose control points rotate at independent rates to form drifting loops
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const BezierFlowMandala: React.FC<VisualProps> = ({ width, height }) => {
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

    const petals = 12;
    const layers = 3;
    const maxRadius = Math.min(width, height) * 0.38;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.001;
      const cx = width / 2;
      const cy = height / 2;

      for (let layer = 0; layer < layers; layer++) {
        const radius = maxRadius * (0.4 + layer * 0.24 + 0.05 * Math.sin(t * (layer + 1)));
        ctx.strokeStyle = `rgba(25,25,25,${0.04 + layer * 0.05})`;
        ctx.lineWidth = 1;
        for (let p = 0; p < petals; p++) {
          const baseAngle = (p / petals) * Math.PI * 2;
          const phase = baseAngle + t * 0.3 + layer * 0.4;
          const angleOffset = Math.sin(t * 0.5 + p) * 0.4;
          const startAngle = phase;
          const endAngle = phase + Math.PI / petals;

          const x0 = cx + Math.cos(startAngle) * radius;
          const y0 = cy + Math.sin(startAngle) * radius;
          const x3 = cx + Math.cos(endAngle) * radius;
          const y3 = cy + Math.sin(endAngle) * radius;

          const controlRadius = radius * (1.1 + 0.1 * Math.cos(t * 0.8 + layer));
          const c1Angle = baseAngle + angleOffset;
          const c2Angle = baseAngle + angleOffset + Math.PI / petals;
          const x1 = cx + Math.cos(c1Angle) * controlRadius;
          const y1 = cy + Math.sin(c1Angle) * controlRadius;
          const x2 = cx + Math.cos(c2Angle) * controlRadius;
          const y2 = cy + Math.sin(c2Angle) * controlRadius;

          ctx.beginPath();
          ctx.moveTo(x0, y0);
          ctx.bezierCurveTo(x1, y1, x2, y2, x3, y3);
          ctx.stroke();
        }
      }

      ctx.fillStyle = 'rgba(30,30,30,0.2)';
      ctx.beginPath();
      ctx.arc(cx, cy, 4 + 1.5 * Math.sin(t * 0.7), 0, Math.PI * 2);
      ctx.fill();

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
  themes: 'bezier,mandala,flow',
  visualisation: 'Orbiting Bézier loops weave a mandala',
  promptSuggestion: '1. Watch each loop write a quiet mantra\n2. Sense how control points breathe in orbit\n3. Sync your breath with the flowing calligraphy'
};
(BezierFlowMandala as any).metadata = metadata;

export default BezierFlowMandala;

// Differs from others by: Animates cubic Bézier curves with independently rotating control points to draw looping mandala petals.

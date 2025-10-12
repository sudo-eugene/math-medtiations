// Themes: spiral discipline, ribbon dance, patient geometry
// Visualisation: Ribbons trace involutes of circles, dancing outward with gentle oscillation
// Unique mechanism: Uses involute-of-circle parametric equations with time-varying radii to animate ribbon paths
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const InvoluteRibbonDance: React.FC<VisualProps> = ({ width, height }) => {
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

    const ribbons = 6;
    const samples = 220;
    const cx = width / 2;
    const cy = height / 2;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0005;
      ctx.lineWidth = 1;

      for (let r = 0; r < ribbons; r++) {
        const baseRadius = Math.min(width, height) * (0.1 + r * 0.06);
        ctx.strokeStyle = `rgba(25,25,25,${0.06 + 0.05 * r})`;
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
          const theta = (i / samples) * (Math.PI * 2);
          const radius = baseRadius * (1 + 0.1 * Math.sin(t * 1.2 + r + i * 0.05));
          const x = cx + (radius * (Math.cos(theta) + theta * Math.sin(theta)));
          const y = cy + (radius * (Math.sin(theta) - theta * Math.cos(theta)));
          const scale = 0.15;
          const px = cx + (x - cx) * scale;
          const py = cy + (y - cy) * scale;
          if (i === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(30,30,30,0.2)';
      ctx.beginPath();
      ctx.arc(cx, cy, 4, 0, Math.PI * 2);
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
  themes: 'involute,ribbon,dance',
  visualisation: 'Involute ribbons dance outward from the center',
  promptSuggestion: '1. Watch ribbons unwrap from invisible circles\n2. Feel the discipline of an involute\n3. Dance your breath with the spirals'
};
(InvoluteRibbonDance as any).metadata = metadata;

export default InvoluteRibbonDance;

// Differs from others by: Animates involute-of-circle parametric ribbons with time-varying radii.

// Themes: radial bloom, Laguerre calm, analytic petals
// Visualisation: Radial rays pulse according to Laguerre polynomials, forming soft analytic flares
// Unique mechanism: Evaluates Laguerre polynomials on normalized radius to modulate ray lengths and opacity
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const laguerre = (n: number, alpha: number, x: number) => {
  if (n === 0) return 1;
  if (n === 1) return 1 + alpha - x;
  let Lnm2 = 1;
  let Lnm1 = 1 + alpha - x;
  for (let k = 2; k <= n; k++) {
    const Ln = ((2 * k - 1 + alpha - x) * Lnm1 - (k - 1 + alpha) * Lnm2) / k;
    Lnm2 = Lnm1;
    Lnm1 = Ln;
  }
  return Lnm1;
};

const LaguerreRadialFlare: React.FC<VisualProps> = ({ width, height }) => {
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

    const rays = 160;
    const maxRadius = Math.min(width, height) * 0.46;
    const cx = width / 2;
    const cy = height / 2;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0005;
      ctx.lineWidth = 1;
      for (let i = 0; i < rays; i++) {
        const angle = (i / rays) * Math.PI * 2;
        const normRadius = (0.6 + 0.4 * Math.sin(t + i * 0.3));
        const poly = laguerre(3, 0.5, normRadius * 4);
        const length = maxRadius * (0.3 + 0.4 * normRadius + 0.1 * poly);
        const x = cx + Math.cos(angle) * length;
        const y = cy + Math.sin(angle) * length;
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.15 * Math.abs(poly)})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(30,30,30,0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, 6 + 2 * Math.sin(t * 1.2), 0, Math.PI * 2);
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
  themes: 'laguerre,radial,bloom',
  visualisation: 'Laguerre-modulated rays pulse outward',
  promptSuggestion: '1. Watch analytic petals bloom\n2. Sense Laguerre polynomials guiding length\n3. Let radial flares soften your gaze'
};
(LaguerreRadialFlare as any).metadata = metadata;

export default LaguerreRadialFlare;

// Differs from others by: Uses Laguerre polynomial evaluations on normalized radius to modulate ray lengths and opacity.

// Themes: solitary wave, KdV calm, traveling pulse
// Visualisation: Korteweg–de Vries solitons travel across the canvas, forming layered pulses
// Unique mechanism: Uses analytic KdV soliton solutions (sech^2 pulses) to modulate band intensities
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const sech = (x: number) => 1 / Math.cosh(x);

const KdVSolitonField: React.FC<VisualProps> = ({ width, height }) => {
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

    const bands = 90;
    const bandHeight = height / bands;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0005;
      ctx.fillStyle = '#1f1f1f';
      for (let i = 0; i < bands; i++) {
        const c = 0.6 + 0.3 * Math.sin(i * 0.1 + t);
        const xi = (i / bands) * width;
        const soliton1 = c * sech((xi - width * 0.5 - t * 120) * 0.01) ** 2;
        const soliton2 = (c * 0.7) * sech((xi - width * 0.2 - t * 60) * 0.015) ** 2;
        const alpha = Math.min(0.22, (soliton1 + soliton2) * 0.4);
        ctx.fillStyle = `rgba(25,25,25,${alpha})`;
        ctx.fillRect(0, i * bandHeight, width, bandHeight * 0.92);
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
  themes: 'kdv,soliton,travel',
  visualisation: 'KdV solitons travel as layered pulses',
  promptSuggestion: '1. Picture solitary waves gliding\n2. Imagine sech^2 pulses breathing\n3. Let the traveling field soothe you'
};
(KdVSolitonField as any).metadata = metadata;

export default KdVSolitonField;

// Differs from others by: Uses analytic KdV soliton solutions (sech^2 pulses) to animate traveling intensity bands.

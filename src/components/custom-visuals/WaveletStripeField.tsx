// Themes: wavelet calm, striped harmony, multiscale texture
// Visualisation: Stripes flicker with multiscale patterns generated from Haar wavelets
// Unique mechanism: Synthesizes a field using Haar wavelet basis coefficients and visualises it as varying stripe opacity
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const WaveletStripeField: React.FC<VisualProps> = ({ width, height }) => {
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

    const levels = 5;
    const coeffs = Array.from({ length: levels }).map(() => ({
      a: Math.random() * 0.6 + 0.4,
      b: Math.random() * 0.6 + 0.4,
    }));

    const haar = (x: number) => {
      if (x < 0) return 0;
      if (x < 0.5) return 1;
      if (x < 1) return -1;
      return 0;
    };

    const evaluate = (x: number, y: number, t: number) => {
      let value = 0;
      for (let l = 0; l < levels; l++) {
        const scale = 2 ** l;
        const hx = haar((x * scale + Math.sin(t * 0.3 + l)) % 1);
        const hy = haar((y * scale + Math.cos(t * 0.4 + l * 0.7)) % 1);
        value += coeffs[l].a * hx + coeffs[l].b * hy;
      }
      return value / levels;
    };

    const stripes = 140;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.001;
      const stripeHeight = height / stripes;

      for (let i = 0; i < stripes; i++) {
        const y = i * stripeHeight;
        const ny = i / stripes;
        const value = evaluate(0.2, ny, t);
        const alpha = 0.04 + Math.abs(value) * 0.18;
        ctx.fillStyle = `rgba(30,30,30,${alpha})`;
        ctx.fillRect(0, y, width, stripeHeight * 0.9);
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
  themes: 'wavelet,stripes,haar',
  visualisation: 'Haar wavelets drive shimmering stripes',
  promptSuggestion: '1. Notice multiscale stripes humming softly\n2. Imagine wavelets balancing coarse and fine\n3. Let the texture quiet your mind'
};
(WaveletStripeField as any).metadata = metadata;

export default WaveletStripeField;

// Differs from others by: Uses Haar wavelet basis coefficients to modulate stripe opacity across the canvas.

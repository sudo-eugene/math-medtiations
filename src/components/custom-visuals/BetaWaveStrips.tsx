// Themes: probabilistic stripes, beta calm, harmonic layering
// Visualisation: Horizontal strips pulse according to Beta distribution envelopes, forming layered waves
// Unique mechanism: Evaluates Beta distributions with time-varying parameters to modulate strip opacity and phase
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const beta = (x: number, a: number, b: number) => {
  if (x <= 0 || x >= 1) return 0;
  const lnBeta = lgamma(a) + lgamma(b) - lgamma(a + b);
  return Math.exp((a - 1) * Math.log(x) + (b - 1) * Math.log(1 - x) - lnBeta);
};

const lgamma = (z: number) => {
  const cof = [76.18009172947146, -86.50532032941677, 24.01409824083091, -1.231739572450155, 0.1208650973866179e-2, -0.5395239384953e-5];
  let x = z;
  let y = z;
  let tmp = x + 5.5;
  tmp -= (x + 0.5) * Math.log(tmp);
  let ser = 1.000000000190015;
  for (let j = 0; j < cof.length; j++) {
    y += 1;
    ser += cof[j] / y;
  }
  return -tmp + Math.log(2.5066282746310005 * ser / x);
};

const BetaWaveStrips: React.FC<VisualProps> = ({ width, height }) => {
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

    const strips = 110;
    const stripHeight = height / strips;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0005;
      ctx.fillStyle = 'rgba(25,25,25,0.12)';
      for (let i = 0; i < strips; i++) {
        const y = i * stripHeight;
        const normalized = i / strips;
        const a = 1.4 + 0.8 * Math.sin(t + normalized * 4);
        const b = 1.2 + 0.7 * Math.cos(t * 0.9 + normalized * 3);
        const value = beta(normalized, a, b);
        const alpha = Math.min(0.22, value * 0.12 + 0.04);
        ctx.globalAlpha = alpha;
        ctx.fillRect(0, y, width, stripHeight * 0.9);
      }
      ctx.globalAlpha = 1;

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
  themes: 'beta,distribution,stripes',
  visualisation: 'Beta distribution envelopes modulate soft stripes',
  promptSuggestion: '1. Follow probability flowing through stripes\n2. Imagine gradual parameters shifting\n3. Let statistical waves slow your breath'
};
(BetaWaveStrips as any).metadata = metadata;

export default BetaWaveStrips;

// Differs from others by: Uses time-varying Beta distribution evaluations to modulate stripe opacity.

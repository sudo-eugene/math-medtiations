// Themes: airy caustics, gentle focus, oscillatory calm
// Visualisation: Vertical fans shimmer with intensity derived from Airy functions, resembling optical caustics
// Unique mechanism: Evaluates the Airy Ai function along columns to modulate fan opacity and oscillation
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const airyAi = (x: number) => {
  let sum = 0;
  let term = 1;
  for (let n = 0; n < 12; n++) {
    if (n > 0) {
      term *= x / (n * (n + 2 / 3));
    }
    const coeff = Math.pow(-1, n) / (factorial(3 * n) * Math.pow(3, n));
    sum += coeff * term;
  }
  return sum;
};

const factorial = (n: number) => {
  let res = 1;
  for (let i = 2; i <= n; i++) res *= i;
  return res;
};

const AiryCausticFans: React.FC<VisualProps> = ({ width, height }) => {
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

    const fans = 90;
    const fanHeight = Math.min(height * 0.8, 380);

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0005;
      ctx.lineWidth = 1;
      for (let i = 0; i < fans; i++) {
        const x = (i / (fans - 1)) * width;
        const normalized = i / fans;
        const argument = normalized * 6 - 3 + Math.sin(t + normalized * 3) * 0.5;
        const ai = airyAi(argument);
        const alpha = 0.05 + Math.min(0.22, Math.abs(ai) * 0.3);
        const offset = Math.sin(t * 0.8 + normalized * 5) * height * 0.05;
        ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
        ctx.beginPath();
        ctx.moveTo(x, height * 0.1 + offset);
        ctx.lineTo(x, height * 0.1 + offset + fanHeight);
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
  themes: 'airy,caustic,fans',
  visualisation: 'Airy-based vertical fans shimmer with caustic intensity',
  promptSuggestion: '1. Picture light forming gentle caustics\n2. Follow airy oscillations up and down\n3. Let the optical calm soften your focus'
};
(AiryCausticFans as any).metadata = metadata;

export default AiryCausticFans;

// Differs from others by: Uses the Airy Ai function to modulate vertical fan opacity and motion, resembling optical caustics.

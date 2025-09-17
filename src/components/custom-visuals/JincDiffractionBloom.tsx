// Themes: diffraction bloom, radial calm, airy rings
// Visualisation: Radial rings modulated by the jinc function pulse softly like diffraction patterns
// Unique mechanism: Evaluates the jinc function (J1(x)/x) to determine ring intensity and animates the bloom
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const j1 = (x: number) => {
  let sum = 0;
  let term = x / 2;
  for (let k = 0; k < 12; k++) {
    if (k > 0) {
      term *= -1 * (x * x) / (4 * k * (k + 1));
    }
    sum += term;
  }
  return sum;
};

const jinc = (x: number) => {
  if (x === 0) return 0.5;
  return j1(x) / x;
};

const JincDiffractionBloom: React.FC<VisualProps> = ({ width, height }) => {
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

    const rings = 80;
    const maxRadius = Math.min(width, height) * 0.45;
    const cx = width / 2;
    const cy = height / 2;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0005;
      ctx.lineWidth = 1;
      for (let i = 0; i < rings; i++) {
        const radius = (i / rings) * maxRadius;
        const argument = Math.PI * (radius / maxRadius) * (1.1 + 0.1 * Math.sin(t));
        const value = Math.abs(jinc(argument));
        const alpha = Math.min(0.22, value * 0.5);
        if (alpha < 0.02) continue;
        ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
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
  themes: 'jinc,diffraction,bloom',
  visualisation: 'Jinc-modulated rings bloom like diffraction patterns',
  promptSuggestion: '1. Imagine light diffracting into rings\n2. Follow the bloom of airy circles\n3. Let the radial calm slow your breath'
};
(JincDiffractionBloom as any).metadata = metadata;

export default JincDiffractionBloom;

// Differs from others by: Uses the jinc function (J1(x)/x) to control ring intensities, mimicking optical diffraction.

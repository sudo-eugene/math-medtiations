// Themes: radial resonance, quiet pulses, mathematical bloom
// Visualisation: Concentric arcs pulse in and out following Bessel function amplitudes
// Unique mechanism: Uses Bessel J0/J1 evaluations to control the opacity and radius of concentric arcs over time
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const besselJ0 = (x: number) => {
  let sum = 1;
  let term = 1;
  const x2 = (x * x) / 4;
  for (let k = 1; k < 12; k++) {
    term *= -x2 / (k * k);
    sum += term;
  }
  return sum;
};

const besselJ1 = (x: number) => {
  let sum = x / 2;
  let term = x / 2;
  const x2 = (x * x) / 4;
  for (let k = 1; k < 12; k++) {
    term *= -x2 / (k * (k + 1));
    sum += term;
  }
  return sum;
};

const BesselRingResonance: React.FC<VisualProps> = ({ width, height }) => {
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

    const rings = 24;
    const baseRadius = Math.min(width, height) * 0.4;
    const cx = width / 2;
    const cy = height / 2;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.001;
      ctx.lineWidth = 1;
      for (let i = 0; i < rings; i++) {
        const n = i + 1;
        const argument = n * 2 + Math.sin(t * 0.8 + i * 0.2) * 2;
        const amplitude = Math.abs(besselJ0(argument));
        const radius = baseRadius * (0.1 + i / rings * 0.85 + 0.06 * besselJ1(argument));
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.25 * amplitude})`;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(30,30,30,0.2)';
      ctx.beginPath();
      ctx.arc(cx, cy, 4 + 2 * Math.sin(t), 0, Math.PI * 2);
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
  themes: 'bessel,resonance,rings',
  visualisation: 'Bessel-driven arcs pulse in concentric harmony',
  promptSuggestion: '1. Follow the Bessel pulses breathing\n2. Imagine harmonic circles tuning\n3. Let radial resonance calm you'
};
(BesselRingResonance as any).metadata = metadata;

export default BesselRingResonance;

// Differs from others by: Evaluates Bessel functions J0 and J1 to modulate concentric arc amplitudes.

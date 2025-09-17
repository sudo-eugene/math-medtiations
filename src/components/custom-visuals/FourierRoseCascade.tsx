// Themes: layered resonance, circular mantra, harmonic bloom
// Visualisation: Cascading rose curves form luminous rings that expand and contract
// Unique mechanism: Superimposes animated Fourier series coefficients on radial samples to generate evolving rose curves
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const FourierRoseCascade: React.FC<VisualProps> = ({ width, height }) => {
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

    const sampleCount = 420;
    const radii = new Float32Array(sampleCount);

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      const cx = width / 2;
      const cy = height / 2;
      const baseRadius = Math.min(width, height) * 0.34;

      const coeffs = [
        0.24 + 0.08 * Math.sin(t * 1.2),
        0.18 + 0.06 * Math.cos(t * 1.7),
        0.12 + 0.05 * Math.sin(t * 2.3),
        0.08 + 0.04 * Math.cos(t * 2.8)
      ];

      for (let i = 0; i < sampleCount; i++) {
        const angle = (i / sampleCount) * Math.PI * 2;
        let r = baseRadius;
        for (let k = 0; k < coeffs.length; k++) {
          const freq = k + 2;
          r += baseRadius * coeffs[k] * Math.sin(freq * angle + t * (k + 1) * 0.7);
        }
        radii[i] = r;
      }

      ctx.lineWidth = 0.9;
      for (let layer = 0; layer < 4; layer++) {
        const phaseShift = layer * 0.6;
        ctx.beginPath();
        for (let i = 0; i < sampleCount + 1; i++) {
          const index = i % sampleCount;
          const angle = (index / sampleCount) * Math.PI * 2 + phaseShift;
          const radius = radii[index] * (0.6 + layer * 0.12);
          const x = cx + Math.cos(angle) * radius;
          const y = cy + Math.sin(angle) * radius;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.strokeStyle = `rgba(25,25,25,${0.04 + layer * 0.06})`;
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(30,30,30,0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, 3.4 + 1.4 * Math.sin(t * 1.1), 0, Math.PI * 2);
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
  themes: 'fourier,rose,mantra',
  visualisation: 'Layered Fourier rose curves cascade outward',
  promptSuggestion: '1. Count the petals as they swell\n2. Hear the harmonics hum together\n3. Breathe with each Fourier wave'
};
(FourierRoseCascade as any).metadata = metadata;

export default FourierRoseCascade;

// Differs from others by: Applies a time-varying Fourier series to radial samples to form cascading rose curves.

// Themes: harmonic resonance, circular contemplation, quiet symmetry
// Visualisation: Chords bloom across a circle as modular multipliers ebb and flow in ink
// Unique mechanism: Time-varying modular multiplication on a circular point set generates chord patterns with adaptive attenuation
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const ModularChordBloom: React.FC<VisualProps> = ({ width, height }) => {
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

    const count = 160;
    const radius = Math.min(width, height) * 0.38;
    const points = new Float32Array(count * 2);
    for (let i = 0; i < count; i++) {
      const angle = (i / count) * Math.PI * 2;
      points[i * 2] = width / 2 + Math.cos(angle) * radius;
      points[i * 2 + 1] = height / 2 + Math.sin(angle) * radius;
    }

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0002;
      const multiplier = 2.5 + Math.sin(t * 3) * 1.6 + Math.cos(t * 1.3) * 0.7;
      const decay = 0.35 + 0.2 * Math.sin(t * 2.1);

      ctx.lineWidth = 0.75;
      for (let i = 0; i < count; i++) {
        const x1 = points[i * 2];
        const y1 = points[i * 2 + 1];
        const targetIndex = Math.floor((i * multiplier) % count);
        const x2 = points[targetIndex * 2];
        const y2 = points[targetIndex * 2 + 1];
        const mid = (i + targetIndex) * 0.5;
        const phase = Math.sin(t * 1.7 + mid * 0.08);
        const alpha = 0.04 + Math.pow(Math.abs(Math.sin((targetIndex - i) * 0.05)), 1.6) * 0.2;
        ctx.strokeStyle = `rgba(20,20,20,${alpha * (1 - decay * 0.2 * (1 + phase))})`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        const cx = (x1 + x2) / 2 + Math.sin(i * 0.12 + t) * 12;
        const cy = (y1 + y2) / 2 + Math.cos(i * 0.14 - t) * 12;
        ctx.quadraticCurveTo(cx, cy, x2, y2);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(30,30,30,0.15)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, radius, 0, Math.PI * 2);
      ctx.stroke();

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
  themes: 'modular,chords,resonance',
  visualisation: 'Circular chords morph through modular multipliers',
  promptSuggestion: '1. Trace the chord bloom quietly\n2. Match your breath with the rotating modulus\n3. Sense harmony emerging from arithmetic'
};
(ModularChordBloom as any).metadata = metadata;

export default ModularChordBloom;

// Differs from others by: Uses time-varying modular multiplication on a circular lattice to drive evolving chord patterns.

// Themes: coupled oscillators, phase bloom, synchronous calm
// Visualisation: Kuramoto oscillators synchronize and radiate phase petals from the center
// Unique mechanism: Integrates the Kuramoto model for many oscillators and renders radial spokes according to phase alignment
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Oscillator {
  phase: number;
  natural: number;
}

const KuramotoPhaseBloom: React.FC<VisualProps> = ({ width, height }) => {
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

    const N = 64;
    const K = 1.4;
    const oscillators: Oscillator[] = Array.from({ length: N }).map((_, i) => ({
      phase: Math.random() * Math.PI * 2,
      natural: 0.6 + 0.4 * Math.sin(i * 0.3),
    }));

    const dt = 0.016;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < N; i++) {
        const osc = oscillators[i];
        let coupling = 0;
        for (let j = 0; j < N; j++) {
          coupling += Math.sin(oscillators[j].phase - osc.phase);
        }
        osc.phase += (osc.natural + (K / N) * coupling) * dt;
      }

      const cx = width / 2;
      const cy = height / 2;
      const radius = Math.min(width, height) * 0.33;
      ctx.lineWidth = 1.1;
      for (let i = 0; i < N; i++) {
        const osc = oscillators[i];
        const x = cx + Math.cos(osc.phase) * radius;
        const y = cy + Math.sin(osc.phase) * radius;
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.15 * (i / N)})`;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(25,25,25,0.22)';
      ctx.beginPath();
      ctx.arc(cx, cy, 6, 0, Math.PI * 2);
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
  themes: 'kuramoto,phase,synchrony',
  visualisation: 'Kuramoto oscillators bloom into synchrony',
  promptSuggestion: '1. Watch phases entrain gently\n2. Imagine oscillators listening to each other\n3. Let the bloom of synchrony calm you'
};
(KuramotoPhaseBloom as any).metadata = metadata;

export default KuramotoPhaseBloom;

// Differs from others by: Integrates the Kuramoto model for many oscillators and renders their phases as radial spokes.

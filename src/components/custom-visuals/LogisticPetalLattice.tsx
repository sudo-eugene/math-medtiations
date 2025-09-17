// Themes: dynamic equilibrium, iterative bloom, mathematical petals
// Visualisation: Logistic-map-driven petals oscillate in a calm lattice
// Unique mechanism: Independent logistic maps per petal determine radii creating quasi-chaotic floral breathing
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const LogisticPetalLattice: React.FC<VisualProps> = ({ width, height }) => {
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

    const petals = 72;
    const states = new Float32Array(petals);
    const params = new Float32Array(petals);
    for (let i = 0; i < petals; i++) {
      states[i] = 0.2 + (i / petals) * 0.6;
      params[i] = 3.3 + 0.3 * Math.sin(i * 0.12);
    }

    const baseRadius = Math.min(width, height) * 0.42;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;
      const spin = time * 0.00015;

      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.08, 0, Math.PI * 2);
      ctx.fillStyle = 'rgba(30,30,30,0.08)';
      ctx.fill();

      for (let i = 0; i < petals; i++) {
        const r = params[i];
        const state = states[i];
        const newState = r * state * (1 - state);
        states[i] = newState;
        const radius = baseRadius * (0.2 + newState * 0.65);
        const angle = (i / petals) * Math.PI * 2 + spin;
        const tipX = cx + Math.cos(angle) * radius;
        const tipY = cy + Math.sin(angle) * radius;

        ctx.strokeStyle = `rgba(25,25,25,${0.05 + newState * 0.12})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        const innerRadius = baseRadius * (0.1 + Math.abs(Math.sin(newState * Math.PI)) * 0.25);
        const innerX = cx + Math.cos(angle + Math.PI / 2) * innerRadius * 0.4;
        const innerY = cy + Math.sin(angle + Math.PI / 2) * innerRadius * 0.4;
        ctx.strokeStyle = 'rgba(20,20,20,0.08)';
        ctx.beginPath();
        ctx.moveTo(innerX, innerY);
        ctx.lineTo(tipX, tipY);
        ctx.stroke();

        if (i % 6 === 0) {
          ctx.beginPath();
          ctx.arc(tipX, tipY, 2.2, 0, Math.PI * 2);
          ctx.fillStyle = 'rgba(30,30,30,0.12)';
          ctx.fill();
        }
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
  themes: 'logistic,petals,iteration',
  visualisation: 'Logistic map petals flicker in a lattice',
  promptSuggestion: '1. Contemplate iterative growth settling\n2. Follow each petal’s logistic pulse\n3. Notice order arising from chaos'
};
(LogisticPetalLattice as any).metadata = metadata;

export default LogisticPetalLattice;

// Differs from others by: Drives each petal length via its own logistic map iteration.

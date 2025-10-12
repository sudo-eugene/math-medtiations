// Themes: standing energy, eigenmode calm, shell resonance
// Visualisation: Layered shells shimmer with eigenmodes of a rectangular membrane
// Unique mechanism: Synthesizes a field from low-order eigenmodes (sin products) and animates iso-shells
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const EigenmodeWaveShell: React.FC<VisualProps> = ({ width, height }) => {
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

    const cols = 120;
    const rows = 80;
    const cellW = width / cols;
    const cellH = height / rows;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.001;
      ctx.lineWidth = 0.7;
      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = (col / cols);
          const y = (row / rows);
          let value = 0;
          const modes = [
            { m: 1, n: 1, amp: 0.6 },
            { m: 2, n: 1, amp: 0.4 },
            { m: 1, n: 2, amp: 0.35 },
            { m: 2, n: 2, amp: 0.25 }
          ];
          for (let i = 0; i < modes.length; i++) {
            const mode = modes[i];
            value += mode.amp * Math.sin(mode.m * Math.PI * x) * Math.sin(mode.n * Math.PI * y) * Math.cos(t * (mode.m + mode.n));
          }
          const alpha = Math.min(0.2, Math.abs(value) * 0.4);
          if (alpha < 0.02) continue;
          ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(col * cellW, row * cellH);
          ctx.lineTo(col * cellW + cellW, row * cellH + cellH);
          ctx.stroke();
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
  themes: 'eigenmode,resonance,shell',
  visualisation: 'Eigenmodes shimmer as shell-like patterns',
  promptSuggestion: '1. Watch standing waves breathe\n2. Sense eigenmodes balancing energy\n3. Relax with the shimmering shell'
};
(EigenmodeWaveShell as any).metadata = metadata;

export default EigenmodeWaveShell;

// Differs from others by: Synthesizes low-order eigenmodes of a rectangular membrane and visualizes them as drifting shells.

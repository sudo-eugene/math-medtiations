// Themes: plate resonance, smooth modes, layered calm
// Visualisation: Biharmonic plate modes shimmer across the canvas as layered contours
// Unique mechanism: Synthesizes biharmonic plate eigenmodes (sin combinations scaled by (m^2+n^2)^2) and renders their contours
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const BiharmonicPlateModes: React.FC<VisualProps> = ({ width, height }) => {
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

    const cols = 140;
    const rows = 90;
    const cellW = width / cols;
    const cellH = height / rows;

    const modes = [
      { m: 1, n: 1, amp: 0.7 },
      { m: 2, n: 1, amp: 0.4 },
      { m: 1, n: 2, amp: 0.35 },
      { m: 2, n: 2, amp: 0.25 },
      { m: 3, n: 1, amp: 0.18 }
    ];

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0005;
      ctx.lineWidth = 0.7;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col / cols;
          const y = row / rows;
          let value = 0;
          for (let i = 0; i < modes.length; i++) {
            const mode = modes[i];
            const k = Math.pow(mode.m * mode.m + mode.n * mode.n, 2);
            value += mode.amp * Math.sin(mode.m * Math.PI * x) * Math.sin(mode.n * Math.PI * y) * Math.cos(Math.sqrt(k) * t);
          }
          const alpha = Math.min(0.24, Math.abs(value) * 0.4);
          if (alpha < 0.02) continue;
          ctx.fillStyle = `rgba(25,25,25,${alpha})`;
          ctx.fillRect(col * cellW, row * cellH, cellW, cellH);
        }
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.08, height * 0.08, width * 0.84, height * 0.84);

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
  themes: 'biharmonic,plate,modes',
  visualisation: 'Biharmonic plate modes shimmer as layered contours',
  promptSuggestion: '1. Sense the plate resonating smoothly\n2. Observe modes appearing and fading\n3. Let harmonic layers calm you'
};
(BiharmonicPlateModes as any).metadata = metadata;

export default BiharmonicPlateModes;

// Differs from others by: Combines biharmonic plate eigenmodes to animate layered contours.

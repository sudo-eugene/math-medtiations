// Themes: clothoid calm, smooth curvature, measured drift
// Visualisation: Clothoid (Euler spiral) paths unfurl from the center like quiet vines
// Unique mechanism: Uses Fresnel integrals to generate Euler spiral trajectories and offsets them in a rotating garden
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const fresnel = (s: number) => {
  let sumC = 0;
  let sumS = 0;
  let termC = 1;
  let termS = s;
  const pi = Math.PI;
  sumC += termC;
  sumS += termS;
  for (let n = 1; n < 8; n++) {
    const coef = (-(pi * pi) / 4) * (s * s) / (n * (2 * n + 1));
    termC *= coef;
    termS *= coef;
    sumC += termC / (4 * n + 1);
    sumS += termS / (4 * n + 3);
  }
  const c = sumC * s;
  const sVal = sumS * s * s;
  return { c, s: sVal };
};

const EulerSpiralGarden: React.FC<VisualProps> = ({ width, height }) => {
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

    const spirals = 12;
    const samples = 260;
    const maxS = 3;
    const cx = width / 2;
    const cy = height / 2;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      ctx.lineWidth = 0.9;
      for (let i = 0; i < spirals; i++) {
        const rotation = (i / spirals) * Math.PI * 2 + t * 0.2;
        const scale = Math.min(width, height) * (0.12 + 0.05 * Math.sin(t + i));
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + i * 0.06})`;
        ctx.beginPath();
        for (let k = 0; k <= samples; k++) {
          const s = (k / samples) * maxS;
          const fres = fresnel(s);
          const x = cx + (fres.c * Math.cos(rotation) - fres.s * Math.sin(rotation)) * scale;
          const y = cy + (fres.c * Math.sin(rotation) + fres.s * Math.cos(rotation)) * scale;
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(30,30,30,0.2)';
      ctx.beginPath();
      ctx.arc(cx, cy, 5, 0, Math.PI * 2);
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
  themes: 'clothoid,euler,spiral',
  visualisation: 'Euler spirals unfurl like meditative vines',
  promptSuggestion: '1. Follow curvature increasing smoothly\n2. Imagine track designers whispering curves\n3. Let the spirals unwind your thoughts'
};
(EulerSpiralGarden as any).metadata = metadata;

export default EulerSpiralGarden;

// Differs from others by: Uses Fresnel integrals to generate Euler spiral trajectories with rotating offsets.

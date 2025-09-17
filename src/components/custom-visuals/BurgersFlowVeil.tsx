// Themes: viscous calm, shock smoothing, fluid veil
// Visualisation: The 1D viscous Burgers’ equation evolves and is rendered as a veil of flowing streaks
// Unique mechanism: Solves the viscous Burgers’ equation on a line using numerical integration, then extrudes the result into streaks
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const BurgersFlowVeil: React.FC<VisualProps> = ({ width, height }) => {
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

    const cells = 240;
    const u = new Float32Array(cells);
    const uNext = new Float32Array(cells);

    for (let i = 0; i < cells; i++) {
      const x = i / cells;
      u[i] = 0.5 + 0.3 * Math.sin(x * Math.PI * 2);
    }

    const viscosity = 0.02;
    const dx = 1 / cells;
    const dt = 0.002;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 1; i < cells - 1; i++) {
        const du = -u[i] * (u[i] - u[i - 1]) / dx + viscosity * (u[i + 1] - 2 * u[i] + u[i - 1]) / (dx * dx);
        uNext[i] = u[i] + du * dt;
      }
      uNext[0] = uNext[1];
      uNext[cells - 1] = uNext[cells - 2];
      u.set(uNext);

      ctx.lineWidth = 1;
      for (let i = 0; i < cells - 1; i++) {
        const x1 = (i / (cells - 1)) * width;
        const x2 = ((i + 1) / (cells - 1)) * width;
        const y1 = height * (0.15 + u[i] * 0.7);
        const y2 = height * (0.15 + u[i + 1] * 0.7);
        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.16 * Math.abs(u[i] - 0.5)})`;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
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
  themes: 'burgers,viscous,veil',
  visualisation: 'Viscous Burgers’ flow forms a gentle veil',
  promptSuggestion: '1. Observe shocks soothing into smooth flow\n2. Imagine diffusion balancing advection\n3. Let viscous motion relax you'
};
(BurgersFlowVeil as any).metadata = metadata;

export default BurgersFlowVeil;

// Differs from others by: Numerically integrates the viscous Burgers’ equation on a line and extrudes the solution into streaks.

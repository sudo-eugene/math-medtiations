// Themes: Bernoulli balance, guided flow, analytic weave
// Visualisation: Flow lines follow solutions of Bernoulli differential equations, forming a woven grid
// Unique mechanism: Solves Bernoulli ODEs with varying exponents along horizontal tracks to generate curved flux lines
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const BernoulliFluxGrid: React.FC<VisualProps> = ({ width, height }) => {
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

    const curves = 40;
    const steps = 220;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      ctx.lineWidth = 0.8;
      for (let c = 0; c < curves; c++) {
        const exp = 1.2 + 0.6 * Math.sin(t + c * 0.2);
        const y0 = height * (0.1 + (c / (curves - 1)) * 0.8);
        let y = y0;
        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.1 * (c / curves)})`;
        ctx.beginPath();
        ctx.moveTo(0, y0);
        for (let step = 1; step <= steps; step++) {
          const x = (step / steps) * width;
          const dx = width / steps;
          const P = 0.4 * Math.sin(t * 1.1 + x * 0.01);
          const Q = 0.3 * Math.cos(t * 0.9 + x * 0.02);
          const dy = (Q - P * y) * dx;
          const correction = Math.pow(Math.abs(y), exp - 1) * dx * 0.01;
          y += dy - correction;
          ctx.lineTo(x, y);
        }
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
  themes: 'bernoulli,flux,grid',
  visualisation: 'Bernoulli ODE solutions weave a flux grid',
  promptSuggestion: '1. Watch analytic flows adjust gently\n2. Imagine solving each curve in real time\n3. Let the woven flux quiet your focus'
};
(BernoulliFluxGrid as any).metadata = metadata;

export default BernoulliFluxGrid;

// Differs from others by: Solves Bernoulli differential equations with varying exponents along horizontal tracks to draw the flux grid.

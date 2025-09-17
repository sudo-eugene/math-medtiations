// Themes: complex calm, residue drift, analytic flow
// Visualisation: Flow lines respond to complex residues, curling around invisible poles
// Unique mechanism: Constructs a vector field from the gradient of a Cauchy potential with multiple residues and advects tracers
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Tracer {
  x: number;
  y: number;
  history: number[];
}

const residues = [
  { x: -0.6, y: -0.4, strength: 0.9 },
  { x: 0.7, y: -0.2, strength: -1.2 },
  { x: -0.2, y: 0.6, strength: 0.8 }
];

const complexField = (x: number, y: number) => {
  let fx = 0;
  let fy = 0;
  for (let i = 0; i < residues.length; i++) {
    const pole = residues[i];
    const dx = x - pole.x;
    const dy = y - pole.y;
    const denom = dx * dx + dy * dy + 1e-4;
    const factor = pole.strength / denom;
    fx += factor * (-dy);
    fy += factor * dx;
  }
  return { fx, fy };
};

const CauchyResidueFlow: React.FC<VisualProps> = ({ width, height }) => {
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

    const tracerCount = 160;
    const tracers: Tracer[] = Array.from({ length: tracerCount }).map(() => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      history: [],
    }));
    const maxHistory = 100;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.8;
      for (let i = 0; i < tracers.length; i++) {
        const tracer = tracers[i];
        const field = complexField(tracer.x, tracer.y);
        tracer.x += field.fx * 0.02;
        tracer.y += field.fy * 0.02;
        tracer.history.push(tracer.x, tracer.y);
        if (tracer.history.length > maxHistory * 2) {
          tracer.history.splice(0, tracer.history.length - maxHistory * 2);
        }
        if (tracer.x < -1 || tracer.x > 1 || tracer.y < -1 || tracer.y > 1) {
          tracer.x = (Math.random() - 0.5) * 2;
          tracer.y = (Math.random() - 0.5) * 2;
          tracer.history.length = 0;
        }

        const pts = tracer.history;
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.12 * (i / tracers.length)})`;
        ctx.beginPath();
        for (let p = 0; p < pts.length; p += 2) {
          const px = width / 2 + pts[p] * width * 0.4;
          const py = height / 2 + pts[p + 1] * height * 0.4;
          if (p === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.12)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.1, height * 0.1, width * 0.8, height * 0.8);

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
  themes: 'cauchy,residue,flow',
  visualisation: 'Residue-induced flow lines curl around invisible poles',
  promptSuggestion: '1. Imagine complex residues whispering\n2. Follow the curls around poles\n3. Let analytic drift calm your attention'
};
(CauchyResidueFlow as any).metadata = metadata;

export default CauchyResidueFlow;

// Differs from others by: Constructs a vector field from complex residues to advect tracers around invisible poles.

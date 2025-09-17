// Themes: braided currents, quadratic calm, gentle entanglement
// Visualisation: Ink threads braid through a quadratic vector field, forming interlaced currents
// Unique mechanism: Uses a quadratic polynomial vector field with alternating integration direction to braid traced paths
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Strand {
  x: number;
  y: number;
  history: number[];
  invert: boolean;
}

const QuadraticBraidCurrents: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x1bd4378c);
    const strandCount = 80;
    const strands: Strand[] = Array.from({ length: strandCount }).map((_, i) => ({
      x: width * (0.2 + rng() * 0.6),
      y: height * (0.1 + (i / strandCount) * 0.8),
      history: [],
      invert: i % 2 === 0,
    }));
    const maxHistory = 160;

    const field = (x: number, y: number) => {
      const nx = (x / width - 0.5) * 2;
      const ny = (y / height - 0.5) * 2;
      const vx = 1.2 * nx * nx - 0.6 * ny * ny + 0.4 * nx * ny;
      const vy = -0.8 * nx * ny + 0.6 * nx - ny * ny * 0.2;
      return { vx, vy };
    };

    const reset = (strand: Strand) => {
      strand.x = width * (0.2 + rng() * 0.6);
      strand.y = height * (0.08 + rng() * 0.84);
      strand.history.length = 0;
    };

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.85;
      for (let i = 0; i < strands.length; i++) {
        const strand = strands[i];
        const vel = field(strand.x, strand.y);
        const speed = strand.invert ? -1 : 1;
        strand.x += vel.vx * 10 * speed;
        strand.y += vel.vy * 10 * speed;

        if (strand.x < width * 0.08 || strand.x > width * 0.92 || strand.y < height * 0.08 || strand.y > height * 0.92) {
          reset(strand);
        }

        strand.history.push(strand.x, strand.y);
        if (strand.history.length > maxHistory * 2) {
          strand.history.splice(0, strand.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.1 * (i / strands.length)})`;
        ctx.beginPath();
        const pts = strand.history;
        for (let p = 0; p < pts.length; p += 2) {
          const x = pts[p];
          const y = pts[p + 1];
          if (p === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.08)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.07, height * 0.07, width * 0.86, height * 0.86);

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
  themes: 'quadratic,braid,currents',
  visualisation: 'Quadratic vector fields braid flowing currents',
  promptSuggestion: '1. Watch threads weave opposing directions\n2. Sense how braids thicken then unfold\n3. Let the polynomial current settle your focus'
};
(QuadraticBraidCurrents as any).metadata = metadata;

export default QuadraticBraidCurrents;

// Differs from others by: Uses a quadratic polynomial vector field with alternating integration direction to braid tracer paths.

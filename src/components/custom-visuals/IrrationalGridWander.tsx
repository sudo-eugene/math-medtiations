// Themes: quasiperiodic walk, gentle curiosity, mathematical tiling
// Visualisation: Ink travellers drift along overlapping irrational grids leaving soft tapestries
// Unique mechanism: walkers follow gradients of two incommensurate rotated lattices producing quasi-periodic drift
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Walker {
  x: number;
  y: number;
  vx: number;
  vy: number;
  history: number[];
  tint: number;
}

const IrrationalGridWander: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0xa8127fd1);
    const walkerCount = 64;
    const walkers: Walker[] = Array.from({ length: walkerCount }).map(() => ({
      x: width * (0.3 + rng() * 0.4),
      y: height * (0.3 + rng() * 0.4),
      vx: 0,
      vy: 0,
      history: [],
      tint: 0.05 + rng() * 0.04,
    }));

    const thetaA = Math.PI * (1 / 3);
    const thetaB = Math.PI * (Math.sqrt(5) / 4);
    const dirAx = Math.cos(thetaA);
    const dirAy = Math.sin(thetaA);
    const dirBx = Math.cos(thetaB);
    const dirBy = Math.sin(thetaB);
    const spacingA = Math.min(width, height) * 0.11;
    const spacingB = Math.min(width, height) * 0.1372;
    const maxHistory = 90;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < walkers.length; i++) {
        const walker = walkers[i];

        const projA = (walker.x * dirAx + walker.y * dirAy) / spacingA;
        const projB = (walker.x * dirBx + walker.y * dirBy) / spacingB;
        const gradAx = Math.cos(2 * Math.PI * projA) * (2 * Math.PI / spacingA) * dirAx;
        const gradAy = Math.cos(2 * Math.PI * projA) * (2 * Math.PI / spacingA) * dirAy;
        const gradBx = Math.cos(2 * Math.PI * projB) * (2 * Math.PI / spacingB) * dirBx;
        const gradBy = Math.cos(2 * Math.PI * projB) * (2 * Math.PI / spacingB) * dirBy;
        const bias = 0.00008 * Math.sin(time * 0.0002 + i);

        walker.vx += (-gradAx - gradBx) * 0.006 + bias;
        walker.vy += (-gradAy - gradBy) * 0.006 + bias * 0.6;
        walker.vx *= 0.96;
        walker.vy *= 0.96;
        walker.x += walker.vx;
        walker.y += walker.vy;

        if (walker.x < width * 0.1 || walker.x > width * 0.9) {
          walker.vx *= -0.7;
        }
        if (walker.y < height * 0.1 || walker.y > height * 0.9) {
          walker.vy *= -0.7;
        }
        walker.x = Math.min(Math.max(walker.x, width * 0.08), width * 0.92);
        walker.y = Math.min(Math.max(walker.y, height * 0.08), height * 0.92);

        walker.history.push(walker.x, walker.y);
        if (walker.history.length > maxHistory * 2) {
          walker.history.splice(0, walker.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(35,35,35,${walker.tint})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const pts = walker.history;
        ctx.moveTo(pts[0], pts[1]);
        for (let p = 2; p < pts.length; p += 2) {
          ctx.lineTo(pts[p], pts[p + 1]);
        }
        ctx.stroke();

        if (i % 8 === 0) {
          ctx.fillStyle = 'rgba(25,25,25,0.12)';
          ctx.beginPath();
          ctx.arc(walker.x, walker.y, 1.5, 0, Math.PI * 2);
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
  themes: 'quasicrystal,wandering,interference',
  visualisation: 'Walkers slide along incommensurate grid gradients leaving threads',
  promptSuggestion: '1. Imagine two invisible grids guiding a stroll\n2. Track how wanderers hesitate and cross seams\n3. Feel the calm of almost-repeating geometry'
};
(IrrationalGridWander as any).metadata = metadata;

export default IrrationalGridWander;

// Differs from others by: Uses gradients from two irrationally-related lattices to guide walker paths.

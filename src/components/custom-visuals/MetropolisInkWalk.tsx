// Themes: stochastic sampling, ink wander, probabilistic calm
// Visualisation: A Metropolis–Hastings random walk samples a target density, leaving inky wander paths
// Unique mechanism: Implements Metropolis–Hastings sampling for a mixture density and draws the accepted steps as trails
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Walker {
  x: number;
  y: number;
  history: number[];
}

const targetDensity = (x: number, y: number) => {
  const g1 = Math.exp(-((x + 0.4) ** 2 + (y - 0.3) ** 2) * 6);
  const g2 = 0.6 * Math.exp(-((x - 0.7) ** 2 + (y + 0.5) ** 2) * 8);
  const g3 = 0.3 * Math.exp(-((x) ** 2 + (y) ** 2) * 3);
  return g1 + g2 + g3;
};

const MetropolisInkWalk: React.FC<VisualProps> = ({ width, height }) => {
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

    const walkers: Walker[] = Array.from({ length: 80 }).map(() => ({
      x: (Math.random() - 0.5) * 2,
      y: (Math.random() - 0.5) * 2,
      history: [],
    }));
    const maxHistory = 90;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.75;
      for (let i = 0; i < walkers.length; i++) {
        const walker = walkers[i];
        const proposalX = walker.x + (Math.random() * 2 - 1) * 0.12;
        const proposalY = walker.y + (Math.random() * 2 - 1) * 0.12;
        if (Math.abs(proposalX) < 1 && Math.abs(proposalY) < 1) {
          const currentDensity = targetDensity(walker.x, walker.y);
          const proposalDensity = targetDensity(proposalX, proposalY);
          if (Math.random() < proposalDensity / (currentDensity + 1e-6)) {
            walker.x = proposalX;
            walker.y = proposalY;
          }
        }
        walker.history.push(walker.x, walker.y);
        if (walker.history.length > maxHistory * 2) {
          walker.history.splice(0, walker.history.length - maxHistory * 2);
        }
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + 0.1 * (i / walkers.length)})`;
        ctx.beginPath();
        const pts = walker.history;
        for (let j = 0; j < pts.length; j += 2) {
          const x = (pts[j] * 0.5 + 0.5) * width;
          const y = (pts[j + 1] * 0.5 + 0.5) * height;
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
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
  themes: 'metropolis,sampling,ink',
  visualisation: 'Metropolis–Hastings walks weave an ink veil',
  promptSuggestion: '1. Watch samples wander toward density\n2. Imagine acceptance guiding the motion\n3. Let the probabilistic veil calm you'
};
(MetropolisInkWalk as any).metadata = metadata;

export default MetropolisInkWalk;

// Differs from others by: Uses the Metropolis–Hastings algorithm to sample a target density and draws the accepted steps as trails.

// Themes: stochastic braids, gentle transitions, probabilistic weave
// Visualisation: Braided strands evolve according to a simple Markov chain, weaving probabilistic patterns
// Unique mechanism: Uses a Markov transition matrix to drive segment direction changes, creating braided ink strands
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Strand {
  x: number;
  y: number;
  direction: number;
  history: number[];
}

const transitions = [
  [0.6, 0.25, 0.15],
  [0.2, 0.6, 0.2],
  [0.1, 0.2, 0.7],
];

const chooseNext = (current: number) => {
  const probs = transitions[current];
  const r = Math.random();
  let sum = 0;
  for (let i = 0; i < probs.length; i++) {
    sum += probs[i];
    if (r <= sum) return i;
  }
  return probs.length - 1;
};

const directions = [
  { x: 1, y: -0.2 },
  { x: 1, y: 0 },
  { x: 1, y: 0.2 },
];

const MarkovChainBraids: React.FC<VisualProps> = ({ width, height }) => {
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

    const strandCount = 24;
    const strands: Strand[] = Array.from({ length: strandCount }).map((_, i) => ({
      x: Math.random() * width * 0.2,
      y: height * (0.15 + (i / strandCount) * 0.7),
      direction: Math.floor(Math.random() * directions.length),
      history: [],
    }));
    const maxHistory = 140;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      ctx.lineWidth = 0.9;
      for (let i = 0; i < strands.length; i++) {
        const strand = strands[i];
        if (Math.random() < 0.05) {
          strand.direction = chooseNext(strand.direction);
        }
        const dir = directions[strand.direction];
        strand.x += dir.x * 4;
        strand.y += dir.y * 15;
        if (strand.x > width * 0.95) {
          strand.x = width * 0.05;
          strand.y = height * (0.15 + Math.random() * 0.7);
          strand.history.length = 0;
        }
        if (strand.y < height * 0.1) strand.y = height * 0.1;
        if (strand.y > height * 0.9) strand.y = height * 0.9;

        strand.history.push(strand.x, strand.y);
        if (strand.history.length > maxHistory * 2) {
          strand.history.splice(0, strand.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.12 * (i / strandCount)})`;
        ctx.beginPath();
        const pts = strand.history;
        for (let j = 0; j < pts.length; j += 2) {
          const x = pts[j];
          const y = pts[j + 1];
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.05, height * 0.1, width * 0.9, height * 0.8);

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
  themes: 'markov,braid,stochastic',
  visualisation: 'Markov-driven strands braid across the canvas',
  promptSuggestion: '1. Imagine decisions following probabilities\n2. Watch each strand whispering a path\n3. Let the stochastic weave calm you'
};
(MarkovChainBraids as any).metadata = metadata;

export default MarkovChainBraids;

// Differs from others by: Uses a Markov transition matrix to drive direction changes in braided strands.

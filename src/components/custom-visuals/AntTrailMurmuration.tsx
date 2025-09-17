// Themes: collective wandering, gentle pursuit, whispered trails
// Visualisation: Ant-like agents weave murmuring trails guided by evaporating pheromone fields
// Unique mechanism: Implements a discrete ant-colony style pheromone simulation on a coarse lattice with steering heuristics
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Ant {
  x: number;
  y: number;
  dir: number;
}

const AntTrailMurmuration: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x62bf0acd);
    const gridW = 110;
    const gridH = 70;
    const pheromone = new Float32Array(gridW * gridH);
    const ants: Ant[] = Array.from({ length: 320 }).map(() => ({
      x: rng() * gridW,
      y: rng() * gridH,
      dir: Math.floor(rng() * 8),
    }));

    const directions = [
      { x: 1, y: 0 },
      { x: 1, y: 1 },
      { x: 0, y: 1 },
      { x: -1, y: 1 },
      { x: -1, y: 0 },
      { x: -1, y: -1 },
      { x: 0, y: -1 },
      { x: 1, y: -1 },
    ];

    const cellWidth = width / gridW;
    const cellHeight = height / gridH;

    const sense = (x: number, y: number) => {
      const gx = ((x % gridW) + gridW) % gridW;
      const gy = ((y % gridH) + gridH) % gridH;
      return pheromone[gy * gridW + gx];
    };

    const deposit = (x: number, y: number, amount: number) => {
      const gx = ((Math.floor(x) % gridW) + gridW) % gridW;
      const gy = ((Math.floor(y) % gridH) + gridH) % gridH;
      pheromone[gy * gridW + gx] += amount;
    };

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < pheromone.length; i++) {
        pheromone[i] *= 0.985;
      }

      ctx.strokeStyle = 'rgba(25,25,25,0.11)';
      ctx.lineWidth = 0.9;
      for (let i = 0; i < ants.length; i++) {
        const ant = ants[i];
        const dirOptions = [ant.dir, (ant.dir + 1) % 8, (ant.dir + 7) % 8];
        let bestDir = dirOptions[0];
        let bestValue = -Infinity;
        for (let k = 0; k < dirOptions.length; k++) {
          const d = directions[dirOptions[k]];
          const sampleX = ant.x + d.x * 2.5;
          const sampleY = ant.y + d.y * 2.5;
          const value = sense(sampleX, sampleY) + rng() * 0.1;
          if (value > bestValue) {
            bestValue = value;
            bestDir = dirOptions[k];
          }
        }
        ant.dir = bestDir;
        const d = directions[ant.dir];
        const prevX = ant.x;
        const prevY = ant.y;
        ant.x += d.x * (1.1 + rng() * 0.3);
        ant.y += d.y * (1.1 + rng() * 0.3);

        if (ant.x < 0) ant.x += gridW;
        if (ant.x >= gridW) ant.x -= gridW;
        if (ant.y < 0) ant.y += gridH;
        if (ant.y >= gridH) ant.y -= gridH;

        deposit(ant.x, ant.y, 0.6);

        ctx.beginPath();
        ctx.moveTo(prevX * cellWidth, prevY * cellHeight);
        ctx.lineTo(ant.x * cellWidth, ant.y * cellHeight);
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
  themes: 'collective,pheromone,trails',
  visualisation: 'Ant-like murmuration leaves whispered pheromone trails',
  promptSuggestion: '1. Notice how the swarm listens to subtle traces\n2. Imagine each turn as a soft decision\n3. Let the murmuring network relax your attention'
};
(AntTrailMurmuration as any).metadata = metadata;

export default AntTrailMurmuration;

// Differs from others by: Implements a pheromone-guided ant colony simulation on a discrete lattice to drive trail formation.

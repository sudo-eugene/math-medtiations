// Themes: hive resonance, communal bloom, crystalline calm
// Visualisation: A hexagonal cellular automaton ripples with births and fades across a honeycomb
// Unique mechanism: Pointy-top hex grid life-like rules with time-modulated thresholds and ink rendering
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const HexLifeBloom: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x9d44aefc);
    const cols = Math.max(18, Math.floor(width / 70));
    const rows = Math.max(14, Math.floor(height / 70));
    const state = new Uint8Array(cols * rows);
    const next = new Uint8Array(cols * rows);
    for (let i = 0; i < state.length; i++) {
      state[i] = rng() > 0.5 ? 1 : 0;
    }

    const hexRadius = Math.min(width / (cols * 1.5), height / (rows * 1.3));
    const hexWidth = hexRadius * 2;
    const hexHeight = Math.sqrt(3) * hexRadius;
    const horiz = hexWidth * 0.75;
    const offsetX = (width - horiz * (cols - 1) - hexWidth) / 2;
    const offsetY = (height - hexHeight * (rows + 0.5)) / 2;

    const evenNeighbors = [
      [1, 0],
      [0, 1],
      [-1, 1],
      [-1, 0],
      [-1, -1],
      [0, -1],
    ];
    const oddNeighbors = [
      [1, 0],
      [1, 1],
      [0, 1],
      [-1, 0],
      [0, -1],
      [1, -1],
    ];

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      for (let col = 0; col < cols; col++) {
        const neighborOffsets = col % 2 === 0 ? evenNeighbors : oddNeighbors;
        for (let row = 0; row < rows; row++) {
          const idx = row * cols + col;
          let sum = 0;
          for (let k = 0; k < neighborOffsets.length; k++) {
            const [dx, dy] = neighborOffsets[k];
            const nx = (col + dx + cols) % cols;
            const ny = (row + dy + rows) % rows;
            sum += state[ny * cols + nx];
          }
          const mod = 0.5 + 0.5 * Math.sin(time * 0.0003 + col * 0.4 + row * 0.33);
          const birthThreshold = mod > 0.5 ? 2 : 3;
          const surviveMin = 2;
          const surviveMax = 3 + (mod > 0.7 ? 1 : 0);
          if (state[idx] === 1) {
            next[idx] = sum >= surviveMin && sum <= surviveMax ? 1 : 0;
          } else {
            next[idx] = sum === birthThreshold ? 1 : 0;
          }
        }
      }

      state.set(next);

      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(30,30,30,0.15)';

      for (let col = 0; col < cols; col++) {
        for (let row = 0; row < rows; row++) {
          const idx = row * cols + col;
          const x = offsetX + col * horiz;
          const y = offsetY + row * hexHeight + (col % 2 === 1 ? hexHeight / 2 : 0);
          ctx.beginPath();
          for (let corner = 0; corner < 6; corner++) {
            const angle = Math.PI / 6 + (Math.PI / 3) * corner;
            const px = x + hexRadius * Math.cos(angle);
            const py = y + hexRadius * Math.sin(angle);
            if (corner === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.stroke();
          ctx.fillStyle = state[idx] === 1 ? 'rgba(30,30,30,0.12)' : 'rgba(30,30,30,0.04)';
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
  themes: 'hive,automaton,bloom',
  visualisation: 'Hex life-like automaton blooming across honeycomb',
  promptSuggestion: '1. Watch the hive breathe in maths\n2. Feel each cell listening to its six neighbours\n3. Let emergent blooms steady your focus'
};
(HexLifeBloom as any).metadata = metadata;

export default HexLifeBloom;

// Differs from others by: Uses a time-modulated life-like rule on a pointy-top hexagonal lattice to animate tiles.

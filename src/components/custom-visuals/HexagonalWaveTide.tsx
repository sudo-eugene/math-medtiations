// Themes: tidal hex, rhythmic shimmer, lattice tide
// Visualisation: Wavefronts travel across a hexagonal lattice like a gentle tide
// Unique mechanism: Propagates a wave equation on axial hex coordinates and renders crest lines across the lattice
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const HexagonalWaveTide: React.FC<VisualProps> = ({ width, height }) => {
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

    const radius = Math.min(width, height) / 28;
    const hexHeight = Math.sqrt(3) * radius;
    const cols = Math.ceil(width / (radius * 1.5)) + 2;
    const rows = Math.ceil(height / hexHeight) + 2;

    const wave = new Float32Array(cols * rows);
    const vel = new Float32Array(cols * rows);

    const idx = (c: number, r: number) => {
      const cc = (c + cols) % cols;
      const rr = (r + rows) % rows;
      return rr * cols + cc;
    };

    const neighbors = (c: number, r: number) => [
      [c + 1, r],
      [c - 1, r],
      [c, r + 1],
      [c, r - 1],
      [c + (r % 2 === 0 ? -1 : 1), r + 1],
      [c + (r % 2 === 0 ? -1 : 1), r - 1],
    ];

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      const sourceC = Math.floor(cols * (0.5 + 0.2 * Math.sin(t)));
      const sourceR = Math.floor(rows * (0.5 + 0.2 * Math.cos(t * 1.2)));
      wave[idx(sourceC, sourceR)] += 1.2;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const id = idx(c, r);
          let sum = 0;
          const neigh = neighbors(c, r);
          for (let n = 0; n < neigh.length; n++) {
            const [nc, nr] = neigh[n];
            sum += wave[idx(nc, nr)];
          }
          const lap = sum - neigh.length * wave[id];
          vel[id] = vel[id] * 0.984 + lap * 0.12;
        }
      }

      for (let i = 0; i < wave.length; i++) {
        wave[i] += vel[i];
      }

      ctx.lineWidth = 0.8;
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const value = wave[idx(c, r)];
          const alpha = Math.min(0.2, Math.abs(value) * 0.5);
          if (alpha < 0.03) continue;
          const offsetX = r % 2 === 0 ? 0 : radius * 0.75;
          const centerX = c * radius * 1.5 + offsetX;
          const centerY = r * hexHeight;
          ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(centerX - radius, centerY);
          ctx.lineTo(centerX, centerY + hexHeight / 2);
          ctx.lineTo(centerX + radius, centerY);
          ctx.lineTo(centerX, centerY - hexHeight / 2);
          ctx.closePath();
          ctx.stroke();
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
  themes: 'hex,wave,tide',
  visualisation: 'Standing tide ripples across a hex lattice',
  promptSuggestion: '1. Watch crests travel hex to hex\n2. Imagine a gentle tide moving across tiles\n3. Let the rhythmic shimmer slow your pulse'
};
(HexagonalWaveTide as any).metadata = metadata;

export default HexagonalWaveTide;

// Differs from others by: Propagates a wave equation on axial hex coordinates to animate lattice tide ripples.

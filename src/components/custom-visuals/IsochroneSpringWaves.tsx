// Themes: radial patience, converging pulses, shared timing
// Visualisation: Isochronal wavefront rings expand from drifting sources across a subtle lattice
// Unique mechanism: Multi-source breadth-first distance fields recomputed each frame to drive iso-lines
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Source {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  phase: number;
  rate: number;
}

const IsochroneSpringWaves: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x5cfb102a);
    const sourceCount = 4;
    const sources: Source[] = Array.from({ length: sourceCount }).map((_, i) => ({
      x: width * (0.25 + 0.15 * i) + rng() * width * 0.08,
      y: height * (0.3 + 0.2 * rng()),
      baseX: width * (0.2 + rng() * 0.6),
      baseY: height * (0.2 + rng() * 0.6),
      phase: rng() * Math.PI * 2,
      rate: 0.0003 + rng() * 0.0002,
    }));

    const cols = Math.max(48, Math.floor(width / 16));
    const rows = Math.max(48, Math.floor(height / 16));
    const distances = new Float32Array(cols * rows);
    const queue = new Int32Array(cols * rows);

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < sources.length; i++) {
        const src = sources[i];
        src.phase += src.rate;
        src.x = src.baseX + Math.cos(src.phase + i) * width * 0.08;
        src.y = src.baseY + Math.sin(src.phase * 0.8 + i * 1.7) * height * 0.08;
      }

      distances.fill(Number.POSITIVE_INFINITY);
      let head = 0;
      let tail = 0;
      for (let i = 0; i < sources.length; i++) {
        const col = Math.max(0, Math.min(cols - 1, Math.floor((sources[i].x / width) * cols)));
        const row = Math.max(0, Math.min(rows - 1, Math.floor((sources[i].y / height) * rows)));
        const idx = row * cols + col;
        distances[idx] = 0;
        queue[tail++] = idx;
      }

      const offsets = [-1, 1, -cols, cols];
      while (head !== tail) {
        const idx = queue[head++];
        if (head >= queue.length) head = 0;
        const currentDist = distances[idx];
        const baseRow = Math.floor(idx / cols);
        const baseCol = idx % cols;
        for (let o = 0; o < offsets.length; o++) {
          const nIdx = idx + offsets[o];
          const nRow = baseRow + (o > 1 ? (o === 2 ? -1 : 1) : 0);
          const nCol = baseCol + (o === 0 ? -1 : o === 1 ? 1 : 0);
          if (nRow < 0 || nRow >= rows || nCol < 0 || nCol >= cols) continue;
          if (currentDist + 1 < distances[nIdx]) {
            distances[nIdx] = currentDist + 1;
            queue[tail++] = nIdx;
            if (tail >= queue.length) tail = 0;
          }
        }
      }

      const cellWidth = width / cols;
      const cellHeight = height / rows;
      const waveSpeed = 26;
      const globalTime = time * 0.002;

      ctx.strokeStyle = 'rgba(30,30,30,0.14)';
      ctx.lineWidth = 1;
      ctx.beginPath();

      for (let row = 0; row < rows; row++) {
        const y = row * cellHeight + cellHeight * 0.5;
        for (let col = 0; col < cols; col++) {
          const idx = row * cols + col;
          const d = distances[idx];
          if (!isFinite(d)) continue;
          const phase = globalTime - d / waveSpeed;
          const envelope = Math.pow(Math.max(0, 1 - d / (Math.max(cols, rows) * 0.9)), 1.6);
          const oscillation = 0.5 * (1 + Math.sin(phase * Math.PI * 2));
          if (oscillation > 0.96) {
            const x = col * cellWidth + cellWidth * 0.5;
            ctx.moveTo(x - cellWidth * 0.4, y);
            ctx.lineTo(x + cellWidth * 0.4, y);
          }
          if (oscillation < 0.04) {
            const x = col * cellWidth + cellWidth * 0.5;
            ctx.moveTo(x, y - cellHeight * 0.4);
            ctx.lineTo(x, y + cellHeight * 0.4);
          }
          if (envelope > 0.6 && oscillation > 0.4 && oscillation < 0.6) {
            const x = col * cellWidth + cellWidth * 0.5;
            ctx.moveTo(x - cellWidth * 0.2, y - cellHeight * 0.2);
            ctx.lineTo(x + cellWidth * 0.2, y + cellHeight * 0.2);
          }
        }
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(30,30,30,0.25)';
      sources.forEach((src) => {
        ctx.beginPath();
        ctx.arc(src.x, src.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });

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
  themes: 'isochrones,waves,coordination',
  visualisation: 'Discrete wavefront rings from drifting sources',
  promptSuggestion: '1. Watch pulses meet in quiet interference\n2. Feel timing ripple across the field\n3. Let the shared beats steady your breath'
};
(IsochroneSpringWaves as any).metadata = metadata;

export default IsochroneSpringWaves;

// Differs from others by: Recomputes BFS distance fields per frame to place iso-line strokes from multiple moving sources.

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: probabilistic nature, emergence from emptiness, ephemeral structure
// Visualization: A lattice of points that sporadically "bloom" outward with jump animations

const QuantumLatticeBloom: React.FC<VisualProps> = ({ width: containerWidth, height: containerHeight }) => {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const fontSize = 12;
    const charWidth = fontSize * 0.6;
    const charHeight = fontSize * 1.2;
    const cols = Math.floor(containerWidth / charWidth);
    const rows = Math.floor(containerHeight / charHeight);

    const density = '  ..--==**##@@▓█';
    let grid: number[][] = Array.from({ length: rows }, () => Array(cols).fill(0));
    let frame = 0;
    let animationId: number;

    const seededRandom = (x: number, y: number, f: number) => {
      const seed = x * 374761393 + y * 668265263 + f * 98764321;
      const s = Math.sin(seed) * 43758.5453;
      return s - Math.floor(s);
    };

    const render = () => {
      const fragments = new Array(rows);
      for (let y = 0; y < rows; y++) {
        let line = '';
        for (let x = 0; x < cols; x++) {
          const val = Math.min(1, Math.pow(grid[y][x], 0.6));
          const idx = Math.min(density.length - 1, Math.floor(val * (density.length - 1)));
          line += density[idx];
        }
        fragments[y] = line;
      }
      container.textContent = fragments.join('\n');
    };

    const update = () => {
      const next = Array.from({ length: rows }, () => Array(cols).fill(0));

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          next[y][x] = grid[y][x] * 0.9;

          if (seededRandom(x, y, frame) > 0.995) {
            next[y][x] = 1.25;
          }

          if (grid[y][x] > 0.1) {
            for (let dy = -1; dy <= 1; dy++) {
              for (let dx = -1; dx <= 1; dx++) {
                if (dx === 0 && dy === 0) continue;
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < cols && ny >= 0 && ny < rows) {
                  next[ny][nx] = Math.max(next[ny][nx], grid[y][x] * 0.82);
                }
              }
            }
          }
        }
      }

      grid = next;
      frame++;
    };

    const animate = () => {
      update();
      render();
      animationId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [containerWidth, containerHeight]);

  return (
    <div
      ref={containerRef}
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        background: '#F0EEE6',
        fontFamily: 'monospace',
        fontSize: '12px',
        lineHeight: '1.2em',
        color: '#1f1f1f',
        whiteSpace: 'pre',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden'
      }}
    />
  );
};

export default QuantumLatticeBloom;

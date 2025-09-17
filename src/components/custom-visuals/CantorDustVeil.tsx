// Themes: fractal dust, gentle omission, recursive calm
// Visualisation: Cantor dust cells glow softly as the set evolves through recursive omission
// Unique mechanism: Recursively constructs a Cantor dust mask and animates cell opacity to evoke a drifting veil
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const buildCantorDust = (order: number) => {
  const cells: Array<{ x: number; y: number; size: number }> = [];
  const recurse = (x: number, y: number, size: number, level: number) => {
    if (level === 0) {
      cells.push({ x, y, size });
      return;
    }
    const newSize = size / 3;
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        if ((row === 1) || (col === 1)) continue;
        recurse(x + col * newSize, y + row * newSize, newSize, level - 1);
      }
    }
  };
  recurse(0, 0, 1, order);
  return cells;
};

const CantorDustVeil: React.FC<VisualProps> = ({ width, height }) => {
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

    const order = 4;
    const cells = buildCantorDust(order);

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      const size = Math.min(width, height) * 0.8;
      const offsetX = (width - size) / 2;
      const offsetY = (height - size) / 2;

      for (let i = 0; i < cells.length; i++) {
        const cell = cells[i];
        const phase = Math.sin(t + i * 0.37);
        const alpha = 0.05 + Math.abs(phase) * 0.2;
        ctx.fillStyle = `rgba(25,25,25,${alpha})`;
        ctx.fillRect(offsetX + cell.x * size, offsetY + cell.y * size, cell.size * size, cell.size * size);
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
  themes: 'cantor,dust,veil',
  visualisation: 'Cantor dust cells pulse as a meditative veil',
  promptSuggestion: '1. Observe the dust forming calm patterns\n2. Imagine recursion carving quiet gaps\n3. Let the glowing dust steady your thoughts'
};
(CantorDustVeil as any).metadata = metadata;

export default CantorDustVeil;

// Differs from others by: Recursively constructs Cantor dust and animates the surviving cells as a glowing veil.

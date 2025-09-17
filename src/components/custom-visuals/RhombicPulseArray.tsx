// Themes: tessellated calm, resonant pulses, gentle geometry
// Visualisation: Diamond tiles glow with soft wave pulses propagating through a rhombic lattice
// Unique mechanism: Discrete wave equation evolves on an offset rhombic grid with alternating excitations
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const RhombicPulseArray: React.FC<VisualProps> = ({ width, height }) => {
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

    const cols = 36;
    const rows = 22;
    const values = new Float32Array(cols * rows);
    const prevValues = new Float32Array(cols * rows);

    const cellW = width / (cols + 4);
    const cellH = height / (rows + 4);
    const damping = 0.96;
    const driveInterval = 2200;

    const index = (x: number, y: number) => ((y + rows) % rows) * cols + ((x + cols) % cols);

    const excite = (time: number) => {
      const t = Math.floor(time / driveInterval);
      for (let i = 0; i < 4; i++) {
        const cx = (t * 7 + i * 5) % cols;
        const cy = (t * 3 + i * 4) % rows;
        values[index(cx, cy)] += 1.2;
      }
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      excite(time);

      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = index(x, y);
          const current = values[idx];
          const lap =
            values[index(x + 1, y)] +
            values[index(x - 1, y)] +
            values[index(x, y + 1)] +
            values[index(x, y - 1)] -
            4 * current;
          const next = (2 * current - prevValues[idx]) * damping + lap * 0.18;
          prevValues[idx] = current;
          values[idx] = next;
        }
      }

      ctx.lineWidth = 0.8;
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const idx = index(x, y);
          const val = values[idx];
          const centerX = width / 2 + (x - cols / 2) * cellW + (y % 2) * cellW * 0.5;
          const centerY = height / 2 + (y - rows / 2) * cellH * 0.75;
          const intensity = Math.max(-0.8, Math.min(0.8, val));
          ctx.beginPath();
          ctx.moveTo(centerX, centerY - cellH * 0.4);
          ctx.lineTo(centerX + cellW * 0.5, centerY);
          ctx.lineTo(centerX, centerY + cellH * 0.4);
          ctx.lineTo(centerX - cellW * 0.5, centerY);
          ctx.closePath();
          ctx.fillStyle = `rgba(30,30,30,${0.08 + 0.18 * Math.abs(intensity)})`;
          ctx.fill();
          ctx.strokeStyle = `rgba(20,20,20,${0.06 + 0.04 * Math.abs(intensity)})`;
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
  themes: 'rhombus,pulse,lattice',
  visualisation: 'Wave pulses glide across a rhombic tile array',
  promptSuggestion: '1. Observe the pulse shimmering through diamonds\n2. Imagine each tile breathing with the wave\n3. Let the lattice settle you into symmetry'
};
(RhombicPulseArray as any).metadata = metadata;

export default RhombicPulseArray;

// Differs from others by: Evolves a discrete wave equation on a rhombic grid with offset centers to animate diamond pulses.

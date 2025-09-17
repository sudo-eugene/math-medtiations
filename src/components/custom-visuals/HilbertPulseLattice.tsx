// Themes: ordered curiosity, space-filling calm, mindful scanning
// Visualisation: A Hilbert space-filling curve pulses with waves of ink traversing the lattice
// Unique mechanism: Space-filling Hilbert curve generated via bitwise decoding with animated Gaussian pulses
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const hilbertIndexToXY = (index: number, order: number) => {
  let x = 0;
  let y = 0;
  let t = index;
  for (let s = 1; s < 1 << order; s <<= 1) {
    const rx = 1 & (t >> 1);
    const ry = 1 & (t ^ rx);
    if (ry === 0) {
      if (rx === 1) {
        x = s - 1 - x;
        y = s - 1 - y;
      }
      const temp = x;
      x = y;
      y = temp;
    }
    x += s * rx;
    y += s * ry;
    t >>= 2;
  }
  return { x, y };
};

const HilbertPulseLattice: React.FC<VisualProps> = ({ width, height }) => {
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

    const order = 6;
    const size = 1 << order;
    const total = size * size;
    const coords = new Float32Array(total * 2);
    for (let i = 0; i < total; i++) {
      const { x, y } = hilbertIndexToXY(i, order);
      coords[i * 2] = width * 0.1 + (x / (size - 1)) * width * 0.8;
      coords[i * 2 + 1] = height * 0.1 + (y / (size - 1)) * height * 0.8;
    }

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const phase1 = ((time * 0.25) % (total * 10)) / 10;
      const phase2 = ((time * 0.18) % (total * 10)) / 10;
      const sigma = 120;

      for (let i = 0; i < total - 1; i++) {
        const dx1 = i - phase1;
        const dx2 = i - phase2;
        const intensity = 0.015 + 0.18 * Math.exp(-(dx1 * dx1) / (2 * sigma * sigma)) + 0.14 * Math.exp(-(dx2 * dx2) / (2 * sigma * sigma));
        const x1 = coords[i * 2];
        const y1 = coords[i * 2 + 1];
        const x2 = coords[i * 2 + 2];
        const y2 = coords[i * 2 + 3];
        ctx.strokeStyle = `rgba(25,25,25,${intensity})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
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
  themes: 'space-filling,scan,order',
  visualisation: 'Hilbert curve pulses sweep across the page',
  promptSuggestion: '1. Follow the path visiting every cell\n2. Let pulses guide a mindful scan\n3. Sense an ordered flow across the lattice'
};
(HilbertPulseLattice as any).metadata = metadata;

export default HilbertPulseLattice;

// Differs from others by: Generates a Hilbert space-filling curve via bitwise decoding and animates Gaussian pulses along it.

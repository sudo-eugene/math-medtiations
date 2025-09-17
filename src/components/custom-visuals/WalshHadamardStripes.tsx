// Themes: orthogonal stripes, Walsh calm, binary weave
// Visualisation: Stripes flicker according to Walsh–Hadamard sequences, forming an orthogonal weave
// Unique mechanism: Evaluates Walsh–Hadamard basis functions over time to modulate stripe opacity
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const walsh = (n: number, k: number) => {
  let result = 1;
  while (n > 0 || k > 0) {
    const nb = n & 1;
    const kb = k & 1;
    if (nb === 1 && kb === 1) result *= -1;
    n >>= 1;
    k >>= 1;
  }
  return result;
};

const WalshHadamardStripes: React.FC<VisualProps> = ({ width, height }) => {
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

    const stripes = 96;
    const stripeHeight = height / stripes;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = Math.floor(time * 0.0004 * stripes);
      ctx.fillStyle = 'rgba(25,25,25,0.12)';
      for (let i = 0; i < stripes; i++) {
        const value = walsh(i, t % stripes);
        const alpha = value > 0 ? 0.16 : 0.04;
        ctx.fillStyle = `rgba(25,25,25,${alpha})`;
        ctx.fillRect(0, i * stripeHeight, width, stripeHeight * 0.95);
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
  themes: 'walsh,hadamard,stripes',
  visualisation: 'Walsh–Hadamard sequences modulate calm stripes',
  promptSuggestion: '1. Observe binary harmonies swapping\n2. Imagine orthogonal pulses weaving\n3. Let the Walsh weave quiet your mind'
};
(WalshHadamardStripes as any).metadata = metadata;

export default WalshHadamardStripes;

// Differs from others by: Uses Walsh–Hadamard basis functions to modulate stripe opacity over time.

// Themes: chaotic map, bloom, filigree
// Visualisation: Filigree patterns bloom from a Gumowski–Mira orbit cloud
// Unique mechanism: Gumowski–Mira map with nonlinearity f(x) rendered as soft breathing glows

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const GumowskiMiraBloom: React.FC<VisualProps> = ({ width, height }) => {
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

    let seed = 77338855 >>> 0;
    const rng = () => (seed = (1664525 * seed + 1013904223) >>> 0, seed / 4294967296);

    let x = (rng() * 2 - 1) * 0.12;
    let y = (rng() * 2 - 1) * 0.12;
    const a = 0.008;
    const b = 0.05;
    const m = -0.98;
    const f = (v: number) => m * v + 2 * (1 - m) * v * v / (1 + v * v);

    const cx = width * 0.5;
    const cy = height * 0.5;
    const scale = Math.min(width, height) * 0.44;

    const render = (timeMs: number) => {
      const time = timeMs * 0.001;

      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < 15000; i++) {
        const xn = y + a * (1 - b * y * y) * y + f(x);
        const yn = -x + f(xn);
        x = xn;
        y = yn;

        const px = cx + x * scale;
        const py = cy + y * scale;
        if (px < -40 || px > width + 40 || py < -40 || py > height + 40) {
          x = (rng() * 2 - 1) * 0.12;
          y = (rng() * 2 - 1) * 0.12;
          continue;
        }

        const radiusBase = 0.9 + 1.2 / (1 + (x * x + y * y) * 6);
        const breathing = Math.sin(time * 1.4 + i * 0.002) * 0.18 + 0.88;
        const radius = radiusBase * breathing;
        const tone = 92 + Math.min(20, 20 / (1 + Math.abs(x * y) * 3.8));
        const alpha = 0.14 + 0.22 / (1 + Math.abs(x * y) * 4.2);

        const glow = ctx.createRadialGradient(px, py, 0, px, py, radius * 1.25);
        glow.addColorStop(0, `rgba(${tone}, ${tone}, ${tone}, ${alpha})`);
        glow.addColorStop(1, `rgba(${tone}, ${tone}, ${tone}, 0)`);

        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(px, py, radius * 1.25, 0, Math.PI * 2);
        ctx.fill();

        const core = ctx.createRadialGradient(px, py, 0, px, py, radius * 0.55);
        core.addColorStop(0, `rgba(${tone - 12}, ${tone - 12}, ${tone - 12}, ${alpha * 1.6})`);
        core.addColorStop(1, `rgba(${tone - 12}, ${tone - 12}, ${tone - 12}, 0)`);

        ctx.fillStyle = core;
        ctx.beginPath();
        ctx.arc(px, py, radius * 0.55, 0, Math.PI * 2);
        ctx.fill();
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
  themes: 'gumowski-mira, chaotic bloom, filigree, gentle glow',
  visualisation: 'Gumowski–Mira orbit bloom rendered as breathing filigree glows',
  promptSuggestion: '1. Adjust orbit scale\n2. Vary glow softness\n3. Tune iteration count'
};
(GumowskiMiraBloom as any).metadata = metadata;

export default GumowskiMiraBloom;

// Differs from others by: Gumowski–Mira chaotic map forming layered neutral glows instead of pixel scatter


// Themes: hexagonal harmony, dithered calm, breathing lattice
// Visualisation: Hex cells shimmer with harmonic dithering, forming a breathing tonal lattice
// Unique mechanism: Evaluates multiple harmonic waves at hexagon centers and dithers opacity via temporal averaging to animate the lattice
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const HarmonicHexDither: React.FC<VisualProps> = ({ width, height }) => {
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

    const hexRadius = Math.min(width, height) / 26;
    const hexHeight = Math.sqrt(3) * hexRadius;
    const cols = Math.ceil(width / (hexRadius * 1.5)) + 2;
    const rows = Math.ceil(height / hexHeight) + 2;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      ctx.lineWidth = 1;
      for (let row = -1; row < rows; row++) {
        for (let col = -1; col < cols; col++) {
          const offsetX = row % 2 === 0 ? 0 : hexRadius * 0.75;
          const x = col * hexRadius * 1.5 + offsetX;
          const y = row * hexHeight * 0.9;
          const cx = x + hexRadius;
          const cy = y + hexHeight / 2;
          const nx = (cx / width - 0.5) * 2;
          const ny = (cy / height - 0.5) * 2;
          const harmonic =
            Math.sin(nx * 3 + t) * 0.4 +
            Math.sin(ny * 4.1 - t * 0.8) * 0.3 +
            Math.sin((nx + ny) * 2.8 + t * 1.3) * 0.3;
          const alpha = 0.09 + Math.abs(harmonic) * 0.18;
          ctx.beginPath();
          for (let i = 0; i < 6; i++) {
            const angle = Math.PI / 6 + (i / 6) * Math.PI * 2;
            const px = cx + Math.cos(angle) * hexRadius;
            const py = cy + Math.sin(angle) * hexRadius;
            if (i === 0) ctx.moveTo(px, py);
            else ctx.lineTo(px, py);
          }
          ctx.closePath();
          ctx.fillStyle = `rgba(30,30,30,${alpha})`;
          ctx.fill();
          ctx.strokeStyle = 'rgba(20,20,20,0.08)';
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
  themes: 'hex,harmonic,dither',
  visualisation: 'Harmonic waves dither a hexagonal lattice',
  promptSuggestion: '1. Watch hex cells pulse with harmony\n2. Imagine tones humming beneath\n3. Let the lattice breathe with you'
};
(HarmonicHexDither as any).metadata = metadata;

export default HarmonicHexDither;

// Differs from others by: Dithers opacity of a hexagonal lattice using combined harmonic waves evaluated at each cell center.

// Themes: woven harmony, oscillatory calm, fabric of sound
// Visualisation: Lissajous curves blend into a translucent fabric of oscillating strands
// Unique mechanism: Generates multi-frequency Lissajous paths and layer blends them with varying phase shifts to form a fabric
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const LissajousFabric: React.FC<VisualProps> = ({ width, height }) => {
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

    const layers = 8;
    const samples = 240;
    const maxRadius = Math.min(width, height) * 0.32;
    const cx = width / 2;
    const cy = height / 2;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      ctx.lineWidth = 0.9;

      for (let layer = 0; layer < layers; layer++) {
        const a = 2 + layer;
        const b = 3 + layer * 0.5;
        const delta = Math.sin(t * 0.8 + layer) * Math.PI * 0.3;
        const amplitude = maxRadius * (0.3 + layer * 0.08);
        ctx.strokeStyle = `rgba(25,25,25,${0.04 + layer * 0.06})`;
        ctx.beginPath();
        for (let i = 0; i <= samples; i++) {
          const u = (i / samples) * Math.PI * 2;
          const x = cx + amplitude * Math.sin(a * u + delta) * (0.8 + 0.2 * Math.sin(t + layer));
          const y = cy + amplitude * Math.sin(b * u) * (0.8 + 0.2 * Math.cos(t * 1.2 + layer));
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.fillStyle = 'rgba(30,30,30,0.24)';
      ctx.beginPath();
      ctx.arc(cx, cy, 5 + 2 * Math.sin(t), 0, Math.PI * 2);
      ctx.fill();

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
  themes: 'lissajous,fabric,oscillation',
  visualisation: 'Layered Lissajous loops weave a musical fabric',
  promptSuggestion: '1. Hear oscillations weaving threads\n2. Follow each loop blending softly\n3. Let rhythmic fabric settle your mind'
};
(LissajousFabric as any).metadata = metadata;

export default LissajousFabric;

// Differs from others by: Layers multi-frequency Lissajous curves with varying phases to form a woven fabric.

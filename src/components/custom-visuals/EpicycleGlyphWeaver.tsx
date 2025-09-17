// Themes: ritual script, harmonic weaving, cyclic calm
// Visualisation: Multiple scribes trace intertwining epicyclic glyphs that fade into one another
// Unique mechanism: Layered epicycle sums per agent with retained history ribbons for each glyph
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Glyph {
  radii: number[];
  freqs: number[];
  phaseOffsets: number[];
  history: number[];
  tint: number;
}

const EpicycleGlyphWeaver: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x77af10c5);
    const glyphs: Glyph[] = Array.from({ length: 18 }).map((_, i) => {
      const radii = [0.19, 0.12, 0.07].map((base, idx) => base * Math.min(width, height) * (0.6 + rng() * 0.8));
      const freqs = [1 + i * 0.02, 2.3 + rng() * 0.3, 3.8 + rng() * 0.4];
      const phaseOffsets = [rng() * Math.PI * 2, rng() * Math.PI * 2, rng() * Math.PI * 2];
      return {
        radii,
        freqs,
        phaseOffsets,
        history: [],
        tint: 0.05 + rng() * 0.05,
      };
    });

    const maxHistory = 220;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const cx = width / 2;
      const cy = height / 2;

      for (let i = 0; i < glyphs.length; i++) {
        const glyph = glyphs[i];
        const t = time * 0.0004;
        let x = cx;
        let y = cy;
        for (let k = 0; k < glyph.radii.length; k++) {
          const radius = glyph.radii[k];
          x += Math.cos(t * glyph.freqs[k] + glyph.phaseOffsets[k]) * radius;
          y += Math.sin(t * glyph.freqs[k] + glyph.phaseOffsets[k]) * radius * (1.0 - 0.1 * k);
        }
        glyph.history.push(x, y);
        if (glyph.history.length > maxHistory * 2) {
          glyph.history.splice(0, glyph.history.length - maxHistory * 2);
        }

        ctx.strokeStyle = `rgba(35,35,35,${glyph.tint})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        const pts = glyph.history;
        ctx.moveTo(pts[0], pts[1]);
        for (let p = 2; p < pts.length; p += 2) {
          ctx.lineTo(pts[p], pts[p + 1]);
        }
        ctx.stroke();

        // trailing shadow
        ctx.strokeStyle = 'rgba(30,30,30,0.07)';
        ctx.lineWidth = 2.2;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let p = 4; p < pts.length; p += 4) {
          ctx.lineTo((pts[p] + cx) * 0.5, (pts[p + 1] + cy) * 0.5);
        }
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
  themes: 'cycles,glyphs,resonance',
  visualisation: 'Epicycles trace meditative glyphs with soft echoes',
  promptSuggestion: '1. Imagine writing mantras with rotating arms\n2. Feel multiple rhythms weave into one symbol\n3. Follow layered circles breathing in phase'
};
(EpicycleGlyphWeaver as any).metadata = metadata;

export default EpicycleGlyphWeaver;

// Differs from others by: Combines multi-arm epicycles with retained per-glyph history ribbons rather than free particles or lines.

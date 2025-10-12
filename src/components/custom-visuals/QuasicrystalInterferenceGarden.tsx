// Themes: quasicrystal, moiré, wave interference, greyscale ink
// Visualisation: Soft rosettes and starburst moirés drift and fade on parchment
// Unique mechanism: Five incommensurate plane waves interfere on a coarse lattice to create quasicrystal intensity and stippled ink rendering

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const QuasicrystalInterferenceGarden: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const rafRef = useRef<number|undefined>();
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d', { alpha: true }); if (!ctx) return;
    canvas.width = width; canvas.height = height;

    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    // PRNG with unique seed
    let s = 123456789 >>> 0;
    const rnd = () => (s = (1664525 * s + 1013904223) >>> 0, s / 4294967296);

    // Five wave directions (72° apart) and phases
    const waves = Array.from({ length: 5 }, (_, i) => {
      const ang = (i * (Math.PI * 2 / 5)) + (rnd()*0.2 - 0.1);
      const k = 0.018 + rnd() * 0.01; // spatial frequency
      const phase = rnd() * Math.PI * 2;
      return { kx: Math.cos(ang) * k, ky: Math.sin(ang) * k, phase, speed: (rnd()*0.4+0.2)*0.3 };
    });

    const res = Math.max(5, Math.floor(Math.min(width, height) / 150)); // coarse lattice for speed
    const nx = Math.floor(width / res);
    const ny = Math.floor(height / res);

    const smoothstep = (e0: number, e1: number, x: number) => {
      const t = Math.min(1, Math.max(0, (x - e0) / (e1 - e0)));
      return t * t * (3 - 2 * t);
    };

    const render = (tms: number) => {
      const t = tms * 0.001;
      // Trails
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      // Update phases
      for (const w of waves) w.phase += w.speed * 0.02;

      for (let yi = 0; yi < ny; yi++) {
        const y = yi * res + res * 0.5;
        for (let xi = 0; xi < nx; xi++) {
          const x = xi * res + res * 0.5;
          let sum = 0;
          for (const w of waves) {
            sum += Math.cos(w.kx * x + w.ky * y + w.phase + t * 0.2);
          }
          // Normalize to [0,1]
          const val = (sum + waves.length) / (2 * waves.length);
          // Stipple clusters near high-intensity interference using jittered offsets
          const a = smoothstep(0.78, 0.95, val);
          if (a > 0.02) {
            const jitter = (idx: number) => ((idx * 0x1f123bb + 0x9e3779b9) & 0xffff) / 0xffff;
            const seed = (yi * nx + xi);
            const points = 3;
            for (let k = 0; k < points; k++) {
              const j = jitter(seed + k * 7919);
              const offX = (j - 0.5) * res * 0.65;
              const offY = (j * 1.732 - Math.floor(j * 1.732)) * res * 0.65 - res * 0.325;
              const px = x + offX;
              const py = y + offY;
              const opacity = 0.08 + 0.22 * a * ((k + j) % 1);
              ctx.fillStyle = `rgba(28,28,28,${opacity})`;
              ctx.fillRect(px, py, 1.1, 1.1);
            }
          }
        }
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); ctx.clearRect(0,0,width,height); };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6', overflow:'hidden' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{width:'100%', height:'100%'}} />
    </div>
  );
};

const metadata = {
  themes: "quasicrystal,moiré,wave,interference,ink,calm",
  visualisation: "Soft quasicrystal rosettes drifting with subtle ink stipple",
  promptSuggestion: "1. Focus on moiré rosettes\n2. Keep interference soft\n3. Prefer fivefold symmetry"
};
(QuasicrystalInterferenceGarden as any).metadata = metadata;

export default QuasicrystalInterferenceGarden;

// Differs from others by: five-plane wave quasicrystal interference as the core mechanism

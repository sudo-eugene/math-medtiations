// Themes: complex dynamics, orbit trap, buddhabrot-like particles
// Visualisation: Thousands of smooth particle orbits reveal Mandelbrot structure with prominent glowing trails
// Unique mechanism: Orbit-trap filtered Buddhabrot with layered glow rendering for enhanced visibility

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const MandelbrotOrbitTrapInk: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number | undefined>();

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0, 0, width, height);

    // Seeded PRNG
    let s = 20240915 >>> 0;
    const rnd = () => (s = (1664525 * s + 1013904223) >>> 0, s / 4294967296);

    // Sampling region in complex plane
    const bounds = { xmin: -2.2, xmax: 1.1, ymin: -1.5, ymax: 1.5 };
    const trapR2 = 0.03 * 0.03; // orbit trap near origin
    const maxIter = 220;

    // Render loop: sample many c per frame and accumulate their escape trajectories as glows
    const render = (timeMs: number) => {
      const time = timeMs * 0.001;

      // Gentle fade
      ctx.fillStyle = 'rgba(240,238,230,0.015)';
      ctx.fillRect(0, 0, width, height);

      const samples = 140; // per frame
      for (let n = 0; n < samples; n++) {
        const cr = bounds.xmin + rnd() * (bounds.xmax - bounds.xmin);
        const ci = bounds.ymin + rnd() * (bounds.ymax - bounds.ymin);
        let zr = 0, zi = 0;
        
        // Track path
        const pathX: number[] = [];
        const pathY: number[] = [];
        let trapped = false;
        let escaped = false;
        
        for (let k = 0; k < maxIter; k++) {
          const zr2 = zr * zr - zi * zi + cr;
          const zi2 = 2 * zr * zi + ci;
          zr = zr2; zi = zi2;
          const r2 = zr * zr + zi * zi;
          pathX.push(zr); pathY.push(zi);
          if (!trapped && r2 < trapR2) trapped = true;
          if (r2 > 4) { escaped = true; break; }
        }
        
        if (escaped && trapped) {
          // Draw orbit path with varied glows
          for (let i = 0; i < pathX.length; i++) {
            const x = (pathX[i] - bounds.xmin) / (bounds.xmax - bounds.xmin) * width;
            const y = (pathY[i] - bounds.ymin) / (bounds.ymax - bounds.ymin) * height;
            
            if (x >= 0 && x < width && y >= 0 && y < height) {
              const progress = i / pathX.length;
              const breathing = Math.sin(time * 1.3 + i * 0.05) * 0.15 + 0.85;
              
              // Vary rendering based on orbit position
              if (i % 4 === 0) {
                // Larger glow points
                const radius = (1.4 + progress * 0.8) * breathing;
                const tone = 88 + progress * 26;
                const alpha = 0.14 + (1 - progress) * 0.2;

                const glow = ctx.createRadialGradient(x, y, 0, x, y, radius * 1.6);
                glow.addColorStop(0, `rgba(${tone}, ${tone}, ${tone}, ${alpha})`);
                glow.addColorStop(1, `rgba(${tone}, ${tone}, ${tone}, 0)`);

                ctx.fillStyle = glow;
                ctx.beginPath();
                ctx.arc(x, y, radius * 1.6, 0, Math.PI * 2);
                ctx.fill();
              } else {
                // Smaller accent dots
                const radius = (0.9 + progress * 0.5) * breathing;
                const tone = 92 + progress * 20;
                const alpha = 0.12 + (1 - progress) * 0.16;

                const core = ctx.createRadialGradient(x, y, 0, x, y, radius);
                core.addColorStop(0, `rgba(${tone - 10}, ${tone - 10}, ${tone - 10}, ${alpha * 1.3})`);
                core.addColorStop(1, `rgba(${tone - 10}, ${tone - 10}, ${tone - 10}, 0)`);

                ctx.fillStyle = core;
                ctx.beginPath();
                ctx.arc(x, y, radius, 0, Math.PI * 2);
                ctx.fill();
              }
            }
          }
          
          // Draw connecting lines for recent points
          if (pathX.length > 3) {
            ctx.strokeStyle = 'rgba(80, 80, 80, 0.06)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            for (let i = 0; i < Math.min(pathX.length, 25); i++) {
              const x = (pathX[i] - bounds.xmin) / (bounds.xmax - bounds.xmin) * width;
              const y = (pathY[i] - bounds.ymin) / (bounds.ymax - bounds.ymin) * height;
              if (i === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          }
        }
      }

      raf.current = requestAnimationFrame(render);
    };
    
    raf.current = requestAnimationFrame(render);
    return () => { 
      if (raf.current) cancelAnimationFrame(raf.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height]);

  return <div style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6', overflow: 'hidden' }}>
    <canvas ref={ref} width={width} height={height} style={{ width: '100%', height: '100%' }} />
  </div>;
};

const metadata = {
  themes: 'mandelbrot,orbit-trap,buddhabrot,ink',
  visualisation: 'Orbit-trap filtered Buddhabrot particles in ink',
  promptSuggestion: '1. Sample many c\n2. Draw escape paths\n3. Use soft trails'
};
(MandelbrotOrbitTrapInk as any).metadata = metadata;

export default MandelbrotOrbitTrapInk;

// Differs from others by: Mandelbrot orbit-trap criterion on coarse buffer with ink-like upscale

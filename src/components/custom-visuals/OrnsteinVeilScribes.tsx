// Themes: stochastic calm, drifting script, continuous renewal
// Visualisation: Calligraphic trails emerge from scribes whose motion follows Ornstein–Uhlenbeck drift
// Unique mechanism: Uses Ornstein–Uhlenbeck stochastic processes per scribe to generate correlated random ink trajectories
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Scribe {
  x: number;
  y: number;
  vx: number;
  vy: number;
  trail: number[];
}

const OrnsteinVeilScribes: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x51c47ad4);
    const scribeCount = 36;
    const scribes: Scribe[] = Array.from({ length: scribeCount }).map(() => ({
      x: width * (0.3 + rng() * 0.4),
      y: height * (0.3 + rng() * 0.4),
      vx: (rng() - 0.5) * 1.2,
      vy: (rng() - 0.5) * 1.2,
      trail: []
    }));

    const maxTrail = 140;
    const theta = 0.12;
    const sigma = 0.55;
    const meanV = 0;

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      for (let i = 0; i < scribes.length; i++) {
        const s = scribes[i];
        const noiseX = (rng() - 0.5) * Math.sqrt(2 * theta);
        const noiseY = (rng() - 0.5) * Math.sqrt(2 * theta);
        s.vx += theta * (meanV - s.vx) + sigma * noiseX;
        s.vy += theta * (meanV - s.vy) + sigma * noiseY;
        s.x += s.vx;
        s.y += s.vy;

        if (s.x < width * 0.08 || s.x > width * 0.92) {
          s.vx *= -0.8;
        }
        if (s.y < height * 0.08 || s.y > height * 0.92) {
          s.vy *= -0.8;
        }
        s.x = Math.min(Math.max(s.x, width * 0.06), width * 0.94);
        s.y = Math.min(Math.max(s.y, height * 0.06), height * 0.94);

        s.trail.push(s.x, s.y);
        if (s.trail.length > maxTrail * 2) s.trail.splice(0, s.trail.length - maxTrail * 2);

        const pts = s.trail;
        ctx.strokeStyle = `rgba(25,25,25,${0.05 + (i / scribes.length) * 0.08})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        for (let j = 0; j < pts.length; j += 2) {
          const x = pts[j];
          const y = pts[j + 1];
          if (j === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.1)';
      ctx.lineWidth = 1;
      ctx.strokeRect(width * 0.08, height * 0.08, width * 0.84, height * 0.84);

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
  themes: 'stochastic,scribes,calm',
  visualisation: 'OU-driven scribes etch drifting calligraphy',
  promptSuggestion: '1. Imagine scribes moved by gentle randomness\n2. Follow the trails as they forget and remember\n3. Rest in the correlated drift of each line'
};
(OrnsteinVeilScribes as any).metadata = metadata;

export default OrnsteinVeilScribes;

// Differs from others by: Drives each scribe with an Ornstein–Uhlenbeck stochastic process to create correlated random trajectories.

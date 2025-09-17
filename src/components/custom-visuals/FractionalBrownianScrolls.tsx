// Themes: fractal drift, gentle wandering, layered noise
// Visualisation: Scroll-like threads wander under the influence of fractional Brownian motion
// Unique mechanism: Combines multi-octave fBm noise to advect particles along correlated fractal fields
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createNoise = () => {
  const hash = (x: number, y: number) => {
    let h = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
    return h - Math.floor(h);
  };
  const noise2D = (x: number, y: number) => {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;
    const s = hash(xi, yi);
    const t = hash(xi + 1, yi);
    const u = hash(xi, yi + 1);
    const v = hash(xi + 1, yi + 1);
    const fade = (k: number) => k * k * (3 - 2 * k);
    const wx = fade(xf);
    const wy = fade(yf);
    const a = s + wx * (t - s);
    const b = u + wx * (v - u);
    return a + wy * (b - a);
  };
  return (x: number, y: number) => {
    let amplitude = 1;
    let frequency = 1;
    let sum = 0;
    let totalAmp = 0;
    for (let i = 0; i < 5; i++) {
      sum += amplitude * noise2D(x * frequency, y * frequency);
      totalAmp += amplitude;
      amplitude *= 0.5;
      frequency *= 2.3;
    }
    return sum / totalAmp;
  };
};

interface ScrollParticle {
  x: number;
  y: number;
  trail: number[];
}

const FractionalBrownianScrolls: React.FC<VisualProps> = ({ width, height }) => {
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

    const fbm = createNoise();
    const particleCount = 320;
    const particles: ScrollParticle[] = Array.from({ length: particleCount }).map(() => ({
      x: width * (0.2 + Math.random() * 0.6),
      y: height * (0.2 + Math.random() * 0.6),
      trail: [],
    }));
    const maxTrail = 120;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const scale = 0.0016;
      ctx.lineWidth = 0.9;
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        const nx = (p.x - width / 2) * scale;
        const ny = (p.y - height / 2) * scale;
        const angle = fbm(nx + time * 0.00005, ny) * Math.PI * 4;
        const speed = 12 + 8 * Math.sin(time * 0.0004 + i * 0.1);
        const vx = Math.cos(angle) * speed;
        const vy = Math.sin(angle) * speed;

        const prevX = p.x;
        const prevY = p.y;
        p.x += vx;
        p.y += vy;

        if (p.x < width * 0.08 || p.x > width * 0.92 || p.y < height * 0.08 || p.y > height * 0.92) {
          p.x = width * (0.3 + Math.random() * 0.4);
          p.y = height * (0.3 + Math.random() * 0.4);
          p.trail.length = 0;
        }

        p.trail.push(p.x, p.y);
        if (p.trail.length > maxTrail * 2) {
          p.trail.splice(0, p.trail.length - maxTrail * 2);
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.04 + 0.1 * (i / particles.length)})`;
        ctx.beginPath();
        const pts = p.trail;
        for (let t = 0; t < pts.length; t += 2) {
          const x = pts[t];
          const y = pts[t + 1];
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(prevX, prevY);
        ctx.lineTo(p.x, p.y);
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
  themes: 'fbm,scrolls,fractal',
  visualisation: 'Fractional Brownian motion guides scroll trails',
  promptSuggestion: '1. Let fractal gusts guide your gaze\n2. Watch each scroll wander unpredictably\n3. Feel calm within gentle irregularity'
};
(FractionalBrownianScrolls as any).metadata = metadata;

export default FractionalBrownianScrolls;

// Differs from others by: Uses multi-octave fractional Brownian motion to drive particle advection across the canvas.

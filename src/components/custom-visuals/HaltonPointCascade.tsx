// Themes: quasi-random calm, cascading points, uniform drift
// Visualisation: A cascade of points generated from the Halton sequence drifts across the canvas
// Unique mechanism: Generates Halton sequence points (bases 2 and 3) and animates their cascade with gentle drift
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const halton = (index: number, base: number) => {
  let result = 0;
  let f = 1 / base;
  let i = index;
  while (i > 0) {
    result += f * (i % base);
    i = Math.floor(i / base);
    f /= base;
  }
  return result;
};

interface Particle {
  x: number;
  y: number;
  alpha: number;
}

const HaltonPointCascade: React.FC<VisualProps> = ({ width, height }) => {
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

    const particles: Particle[] = Array.from({ length: 480 }).map((_, i) => ({
      x: width * halton(i + 1, 2),
      y: height * halton(i + 1, 3),
      alpha: 0.04 + (i % 80) / 400,
    }));

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const drift = Math.sin(time * 0.0003);
      ctx.fillStyle = '#1f1f1f';
      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];
        p.y += 0.3 + drift * 0.2;
        if (p.y > height) p.y -= height;
        p.x += 0.2 * Math.sin(i * 0.02 + time * 0.0005);
        if (p.x < 0) p.x += width;
        if (p.x > width) p.x -= width;
        ctx.fillStyle = `rgba(25,25,25,${p.alpha})`;
        ctx.fillRect(p.x, p.y, 2.1, 2.1);
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
  themes: 'halton,quasi-random,cascade',
  visualisation: 'Halton sequence points cascade with gentle drift',
  promptSuggestion: '1. Observe quasi-random balance\n2. Imagine uniformity spreading calmly\n3. Let the cascade of points slow your thoughts'
};
(HaltonPointCascade as any).metadata = metadata;

export default HaltonPointCascade;

// Differs from others by: Uses Halton quasi-random sequences to generate a cascading field of points.

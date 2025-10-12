// Themes: orbit plot, meadow, discrete map, flowing threads
// Visualisation: Meadow-like tufts from the Barry Martin Hopalong map with trails and varied visual layers
// Unique mechanism: Hopalong map with flowing trails, layered glows, and dynamic rotation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Trail {
  x: number;
  y: number;
  age: number;
}

const HopalongMeadow: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement | null>(null);
  const raf = useRef<number | undefined>();
  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0, 0, width, height);

    let s = 99661177 >>> 0;
    const rnd = () => (s = (1664525 * s + 1013904223) >>> 0, s / 4294967296);

    const a = 0.9, b = -0.6013, c = 2.0;
    let x = (rnd() * 2 - 1) * 0.1, y = (rnd() * 2 - 1) * 0.1;
    const cx = width * 0.5, cy = height * 0.5;
    const scale = Math.min(width, height) * 0.36;

    const trails: Trail[] = [];
    const maxTrails = 300;

    const render = (timeMs: number) => {
      const time = timeMs * 0.001;

      ctx.fillStyle = 'rgba(240,238,230,0.03)';
      ctx.fillRect(0, 0, width, height);

      // Gentle rotation
      const angle = time * 0.15;
      const cosA = Math.cos(angle);
      const sinA = Math.sin(angle);

      // Update trails
      for (let i = trails.length - 1; i >= 0; i--) {
        trails[i].age++;
        if (trails[i].age > 180) {
          trails.splice(i, 1);
        }
      }

      // Main iteration with varied rendering styles
      for (let i = 0; i < 12000; i++) {
        const xn = y - Math.sign(x) * Math.sqrt(Math.abs(b * x - c));
        const yn = a - x;
        x = xn; y = yn;

        // Apply rotation
        const rx = x * cosA - y * sinA;
        const ry = x * sinA + y * cosA;

        const px = cx + rx * scale;
        const py = cy + ry * scale;

        if (px < -40 || px > width + 40 || py < -40 || py > height + 40) {
          x = (rnd() * 2 - 1) * 0.1;
          y = (rnd() * 2 - 1) * 0.1;
          continue;
        }

        // Add to trails occasionally
        if (i % 45 === 0 && trails.length < maxTrails) {
          trails.push({ x: px, y: py, age: 0 });
        }

        const distance = Math.sqrt(rx * rx + ry * ry);
        const intensity = 1 / (1 + distance * 1.2);
        const variation = Math.sin(i * 0.1 + time * 0.8) * 0.5 + 0.5;
        
        // Vary visual style based on position
        if (i % 3 === 0) {
          // Tufted glows
          const tone = 84 + intensity * 32 + variation * 8;
          const alpha = 0.08 + intensity * 0.22;
          const breathe = Math.sin(time * 1.4 + i * 0.004) * 0.2 + 0.85;
          const radius = (1.2 + intensity * 2.2) * breathe;

          const glow = ctx.createRadialGradient(px, py, 0, px, py, radius * 1.5);
          glow.addColorStop(0, `rgba(${tone}, ${tone}, ${tone}, ${alpha})`);
          glow.addColorStop(1, `rgba(${tone}, ${tone}, ${tone}, 0)`);

          ctx.fillStyle = glow;
          ctx.beginPath();
          ctx.arc(px, py, radius * 1.5, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Smaller accent dots
          const tone = 90 + intensity * 24;
          const alpha = 0.1 + intensity * 0.18;
          const radius = 0.8 + intensity * 1.2;

          const core = ctx.createRadialGradient(px, py, 0, px, py, radius);
          core.addColorStop(0, `rgba(${tone - 14}, ${tone - 14}, ${tone - 14}, ${alpha * 1.4})`);
          core.addColorStop(1, `rgba(${tone - 14}, ${tone - 14}, ${tone - 14}, 0)`);

          ctx.fillStyle = core;
          ctx.beginPath();
          ctx.arc(px, py, radius, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      // Draw flowing trails
      ctx.strokeStyle = 'rgba(95, 95, 95, 0.08)';
      ctx.lineWidth = 1;
      if (trails.length > 1) {
        ctx.beginPath();
        for (let i = 0; i < trails.length; i++) {
          const t = trails[i];
          const fade = 1 - t.age / 180;
          if (i === 0) {
            ctx.moveTo(t.x, t.y);
          } else {
            ctx.globalAlpha = fade * 0.15;
            ctx.lineTo(t.x, t.y);
          }
        }
        ctx.stroke();
        ctx.globalAlpha = 1;
      }

      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); ctx.clearRect(0, 0, width, height); };
  }, [width, height]);

  return <div style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6', overflow: 'hidden' }}>
    <canvas ref={ref} width={width} height={height} style={{ width: '100%', height: '100%' }} />
  </div>;
};

const metadata = {
  themes: 'hopalong map, flowing meadow, layered threads, dynamic rotation',
  visualisation: 'Hopalong meadow with flowing trails, varied glows, and gentle rotation',
  promptSuggestion: '1. Watch threads weave through meadow\n2. Notice layered tuft variations\n3. Follow the gentle rotation'
};
(HopalongMeadow as any).metadata = metadata;

export default HopalongMeadow;

// Differs from others by: Barry Martin Hopalong map’s sign-dependent sqrt step causing meadow-like tufts


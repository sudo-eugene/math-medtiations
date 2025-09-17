// Themes: gentle partition, breathing mosaic, spatial balance
// Visualisation: Slowly morphing Voronoi cells etched as soft ink polygons breathing together
// Unique mechanism: Animated centroidal Voronoi relaxation computed on a coarse lattice each frame
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Site {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const VoronoiBreathMap: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x6dd223a1);
    const siteCount = 24;
    const sites: Site[] = Array.from({ length: siteCount }).map(() => ({
      x: width * (0.2 + rng() * 0.6),
      y: height * (0.2 + rng() * 0.6),
      vx: (rng() - 0.5) * 0.08,
      vy: (rng() - 0.5) * 0.08,
    }));

    const cols = Math.max(32, Math.floor(width / 12));
    const rows = Math.max(32, Math.floor(height / 12));
    const labels = new Uint16Array(cols * rows);
    const accumX = new Float32Array(siteCount);
    const accumY = new Float32Array(siteCount);
    const accumCount = new Uint16Array(siteCount);

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      // Move sites with soft breathing velocities
      for (let i = 0; i < sites.length; i++) {
        const site = sites[i];
        site.vx += Math.sin(time * 0.0002 + i * 1.7) * 0.0003;
        site.vy += Math.cos(time * 0.0002 + i * 2.1) * 0.0003;
        site.x += site.vx;
        site.y += site.vy;
        if (site.x < width * 0.1 || site.x > width * 0.9) site.vx *= -1;
        if (site.y < height * 0.1 || site.y > height * 0.9) site.vy *= -1;
      }

      accumX.fill(0);
      accumY.fill(0);
      accumCount.fill(0);

      // Assign lattice points to nearest site
      const cellWidth = width / cols;
      const cellHeight = height / rows;
      for (let row = 0; row < rows; row++) {
        const y = row * cellHeight + cellHeight * 0.5;
        for (let col = 0; col < cols; col++) {
          const x = col * cellWidth + cellWidth * 0.5;

          let bestId = 0;
          let bestDist = Infinity;
          for (let i = 0; i < siteCount; i++) {
            const dx = x - sites[i].x;
            const dy = y - sites[i].y;
            const dist = dx * dx + dy * dy;
            if (dist < bestDist) {
              bestDist = dist;
              bestId = i;
            }
          }
          const idx = row * cols + col;
          labels[idx] = bestId;
          accumX[bestId] += x;
          accumY[bestId] += y;
          accumCount[bestId] += 1;
        }
      }

      // Draw cell edges softly by checking label changes
      ctx.lineWidth = 0.6;
      ctx.strokeStyle = 'rgba(30,30,30,0.18)';
      ctx.beginPath();
      for (let row = 1; row < rows; row++) {
        for (let col = 1; col < cols; col++) {
          const idx = row * cols + col;
          const id = labels[idx];
          if (id !== labels[idx - 1]) {
            const x = col * cellWidth;
            const y = row * cellHeight;
            ctx.moveTo(x, y - cellHeight);
            ctx.lineTo(x, y);
          }
          if (id !== labels[idx - cols]) {
            const x = col * cellWidth;
            const y = row * cellHeight;
            ctx.moveTo(x - cellWidth, y);
            ctx.lineTo(x, y);
          }
        }
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(50,50,50,0.25)';
      for (let i = 0; i < siteCount; i++) {
        if (accumCount[i] > 0) {
          // Lloyd relaxation step for gentle breathing
          const targetX = accumX[i] / accumCount[i];
          const targetY = accumY[i] / accumCount[i];
          sites[i].x += (targetX - sites[i].x) * 0.02;
          sites[i].y += (targetY - sites[i].y) * 0.02;
        }
        ctx.beginPath();
        ctx.arc(sites[i].x, sites[i].y, 2.5, 0, Math.PI * 2);
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
  themes: 'balance,partition,breath',
  visualisation: 'Voronoi tessellation relaxing and breathing as ink edges',
  promptSuggestion: '1. Sense territories softening at their borders\n2. Follow how shared space can breathe\n3. Let tessellations guide a meditative scan'
};
(VoronoiBreathMap as any).metadata = metadata;

export default VoronoiBreathMap;

// Differs from others by: Computes dynamic centroidal Voronoi diagrams on a lattice every frame producing breathing polygon edges unlike any other visual.

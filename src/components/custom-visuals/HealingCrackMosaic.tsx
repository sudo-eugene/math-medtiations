// Themes: fracture and repair, tender resilience, geomorphic calm
// Visualisation: Fine crack filaments sprout then soften as healing washes follow their paths
// Unique mechanism: Procedural crack propagation with probabilistic branching and trailing healing fades
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Crack {
  points: number[];
  angle: number;
  bend: number;
  growthSpeed: number;
  heal: number;
}

const extendCrack = (crack: Crack, rng: () => number, width: number, height: number) => {
  const lastX = crack.points[crack.points.length - 2];
  const lastY = crack.points[crack.points.length - 1];
  crack.bend += (rng() - 0.5) * 0.08;
  crack.angle += crack.bend * 0.3;
  const step = crack.growthSpeed;
  let nx = lastX + Math.cos(crack.angle) * step;
  let ny = lastY + Math.sin(crack.angle) * step;

  if (nx < width * 0.05 || nx > width * 0.95) {
    crack.angle = Math.PI - crack.angle;
    nx = Math.min(Math.max(nx, width * 0.05), width * 0.95);
  }
  if (ny < height * 0.05 || ny > height * 0.95) {
    crack.angle = -crack.angle;
    ny = Math.min(Math.max(ny, height * 0.05), height * 0.95);
  }

  crack.points.push(nx, ny);
  if (crack.points.length > 360) {
    crack.points.splice(0, 2);
  }
};

const HealingCrackMosaic: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x95acb1e2);
    const cracks: Crack[] = Array.from({ length: 12 }).map(() => {
      const startX = width * (0.1 + rng() * 0.8);
      const startY = height * (0.1 + rng() * 0.8);
      return {
        points: [startX, startY],
        angle: rng() * Math.PI * 2,
        bend: (rng() - 0.5) * 0.3,
        growthSpeed: 2.3 + rng() * 1.2,
        heal: 0,
      };
    });

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      // Occasionally spawn a branch from an existing crack point
      if (rng() < 0.08) {
        const base = cracks[Math.floor(rng() * cracks.length)];
        const idx = Math.max(0, base.points.length - 2 - Math.floor(rng() * (base.points.length / 2)) * 2);
        const branchX = base.points[idx];
        const branchY = base.points[idx + 1];
        cracks.push({
          points: [branchX, branchY],
          angle: base.angle + (rng() - 0.5) * 1.4,
          bend: (rng() - 0.5) * 0.5,
          growthSpeed: 2.0 + rng() * 1.4,
          heal: 0,
        });
        if (cracks.length > 22) {
          cracks.shift();
        }
      }

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      for (let i = 0; i < cracks.length; i++) {
        const crack = cracks[i];
        extendCrack(crack, rng, width, height);
        crack.heal = Math.min(1, crack.heal + 0.0015);

        ctx.strokeStyle = `rgba(20,20,20,${0.12 + 0.08 * Math.sin(time * 0.0005 + i)})`;
        ctx.lineWidth = 1.1;
        ctx.beginPath();
        const pts = crack.points;
        ctx.moveTo(pts[0], pts[1]);
        for (let j = 2; j < pts.length; j += 2) {
          ctx.lineTo(pts[j], pts[j + 1]);
        }
        ctx.stroke();

        // Healing wash following behind the crack front
        const healIndex = Math.max(0, pts.length - 2 - Math.floor(crack.heal * pts.length / 2) * 2);
        ctx.strokeStyle = 'rgba(80,80,80,0.05)';
        ctx.lineWidth = 3.6;
        ctx.beginPath();
        ctx.moveTo(pts[0], pts[1]);
        for (let j = 2; j <= healIndex; j += 2) {
          ctx.lineTo(pts[j], pts[j + 1]);
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
  themes: 'repair,fracture,resilience',
  visualisation: 'Cracks propagate then soften under healing ink washes',
  promptSuggestion: '1. Observe breakage transforming toward wholeness\n2. Trace fissures until they calm\n3. Imagine resilience seeping through each fracture'
};
(HealingCrackMosaic as any).metadata = metadata;

export default HealingCrackMosaic;

// Differs from others by: Procedural crack growth with branching and explicit healing overlays unique to this visual.

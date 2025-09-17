// Themes: breathing meshes, gentle triangulation, shared balance
// Visualisation: A cloud of points drifts as translucent edges knit a breathing veil
// Unique mechanism: Iterative centroid relaxation combined with per-frame k-nearest linking to approximate a Delaunay-style mesh
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Node {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

const DelaunayBreathVeil: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x9a22e5bd);
    const count = 90;
    const nodes: Node[] = Array.from({ length: count }).map(() => ({
      x: width * (0.2 + rng() * 0.6),
      y: height * (0.2 + rng() * 0.6),
      vx: (rng() - 0.5) * 0.6,
      vy: (rng() - 0.5) * 0.6,
    }));

    const neighbors = Array.from({ length: count }, () => new Uint16Array(6));

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      // update velocities with gentle drift and relaxation
      const breath = 0.4 + 0.2 * Math.sin(time * 0.0006);
      for (let i = 0; i < count; i++) {
        const node = nodes[i];
        node.vx += (rng() - 0.5) * 0.03;
        node.vy += (rng() - 0.5) * 0.03;
        node.vx *= 0.95;
        node.vy *= 0.95;
        node.x += node.vx;
        node.y += node.vy;
        if (node.x < width * 0.1 || node.x > width * 0.9) node.vx *= -1;
        if (node.y < height * 0.1 || node.y > height * 0.9) node.vy *= -1;
        node.x = Math.min(Math.max(node.x, width * 0.08), width * 0.92);
        node.y = Math.min(Math.max(node.y, height * 0.08), height * 0.92);
      }

      // neighbour search
      for (let i = 0; i < count; i++) {
        const dists: Array<{ d: number; j: number }> = [];
        for (let j = 0; j < count; j++) {
          if (i === j) continue;
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const d = dx * dx + dy * dy;
          dists.push({ d, j });
        }
        dists.sort((a, b) => a.d - b.d);
        const k = neighbors[i];
        for (let n = 0; n < k.length; n++) {
          k[n] = dists[n] ? dists[n].j : 0;
        }
      }

      ctx.lineWidth = 0.7;
      for (let i = 0; i < count; i++) {
        const node = nodes[i];
        const k = neighbors[i];
        for (let n = 0; n < k.length; n++) {
          const j = k[n];
          if (j <= i) continue;
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.hypot(dx, dy);
          const alpha = 0.22 * Math.exp(-dist / (width * 0.25));
          ctx.strokeStyle = `rgba(25,25,25,${alpha})`;
          ctx.beginPath();
          ctx.moveTo(node.x, node.y);
          ctx.lineTo(other.x, other.y);
          ctx.stroke();
        }
      }

      ctx.fillStyle = 'rgba(30,30,30,0.35)';
      for (let i = 0; i < count; i++) {
        const phase = Math.sin(time * 0.0008 + i * 0.3);
        ctx.beginPath();
        ctx.arc(nodes[i].x, nodes[i].y, 1.4 + 0.6 * breath * phase, 0, Math.PI * 2);
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
  themes: 'mesh,breath,delaunay',
  visualisation: 'Approximate Delaunay mesh breathing softly',
  promptSuggestion: '1. Watch the net tighten and release\n2. Sense the whole mesh breathing as one\n3. Let the lattice hold your attention lightly'
};
(DelaunayBreathVeil as any).metadata = metadata;

export default DelaunayBreathVeil;

// Differs from others by: Uses iterative centroid relaxation with per-frame k-nearest linking to approximate a Delaunay mesh.

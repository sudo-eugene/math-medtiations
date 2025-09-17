// Themes: combinatorial growth, branching calm, structural balance
// Visualisation: Branching curves grow according to Catalan number ratios, weaving a balanced canopy
// Unique mechanism: Uses Catalan number sequences to determine branching angles and lengths in iterative tree growth
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Branch {
  x: number;
  y: number;
  angle: number;
  depth: number;
}

const catalan = (n: number) => {
  let result = 1;
  for (let i = 0; i < n; i++) {
    result = (result * 2 * (2 * i + 1)) / (i + 2);
  }
  return result;
};

const CatalanBranchWeave: React.FC<VisualProps> = ({ width, height }) => {
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

    const maxDepth = 7;
    const catalans = Array.from({ length: maxDepth + 1 }, (_, i) => catalan(i));

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      const stack: Branch[] = [{ x: width / 2, y: height * 0.85, angle: -Math.PI / 2, depth: 0 }];

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      while (stack.length > 0) {
        const branch = stack.pop();
        if (!branch) break;
        const length = Math.min(width, height) * 0.22 * Math.pow(0.6, branch.depth) * (1 + 0.08 * Math.sin(t + branch.depth));
        const x2 = branch.x + Math.cos(branch.angle) * length;
        const y2 = branch.y + Math.sin(branch.angle) * length;
        const intensity = branch.depth / maxDepth;
        ctx.strokeStyle = `rgba(25,25,25,${0.08 + 0.15 * (1 - intensity)})`;
        ctx.lineWidth = 1.5 - 0.15 * branch.depth;
        ctx.beginPath();
        ctx.moveTo(branch.x, branch.y);
        ctx.lineTo(x2, y2);
        ctx.stroke();

        if (branch.depth < maxDepth) {
          const nextDepth = branch.depth + 1;
          const ratio = catalans[nextDepth] / catalans[branch.depth + 1];
          const spread = Math.PI / (3 + nextDepth) * (1 + 0.2 * Math.sin(t * 1.3 + nextDepth));
          stack.push({ x: x2, y: y2, angle: branch.angle + spread * ratio, depth: nextDepth });
          stack.push({ x: x2, y: y2, angle: branch.angle - spread * (1 - ratio), depth: nextDepth });
        }
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
  themes: 'catalan,branch,weave',
  visualisation: 'Catalan-based branching creates a balanced canopy',
  promptSuggestion: '1. Observe balanced branching guided by Catalan numbers\n2. Imagine combinatorics shaping growth\n3. Breathe with the woven canopy'
};
(CatalanBranchWeave as any).metadata = metadata;

export default CatalanBranchWeave;

// Differs from others by: Determines branching angles and lengths using Catalan number ratios in an iterative growth system.

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Hyperbolic geodesic web in Poincaré disk model (orthogonal circle arcs)
const PoincareWeb: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    let raf: number | null = null;
    let t = 0;

    const cx = width / 2;
    const cy = height / 2;
    const R = Math.min(width, height) * 0.45;

    const drawArcThrough = (a: number, b: number) => {
      // endpoints on unit circle at angles a, b
      const A = { x: Math.cos(a), y: Math.sin(a) };
      const B = { x: Math.cos(b), y: Math.sin(b) };
      // circle center C orthogonal to unit circle has |C|^2 - r^2 = 1
      // Perpendicular bisector approach
      const mid = { x: (A.x + B.x) / 2, y: (A.y + B.y) / 2 };
      const dir = { x: A.y - B.y, y: B.x - A.x }; // perpendicular to chord AB
      // Solve for center on line: C = mid + s * dir, with |C|^2 - r^2 = 1 and r = |C - A|
      // => |C|^2 - |C - A|^2 = 1 => 2 C·A - |A|^2 = 1
      // Substitute C = mid + s*dir
      const AdotAd = A.x * A.x + A.y * A.y; // =1
      const MdotA = mid.x * A.x + mid.y * A.y;
      const DdotA = dir.x * A.x + dir.y * A.y;
      // 2 (mid + s dir)·A - 1 = 1 => 2M·A + 2s D·A - 1 = 1
      // => 2s D·A = 2 - 2M·A => s = (1 - M·A) / (D·A)
      const s = (1 - MdotA) / (DdotA || 1e-6);
      const C = { x: mid.x + s * dir.x, y: mid.y + s * dir.y };
      const r = Math.hypot(C.x - A.x, C.y - A.y);

      // Map to screen
      const toScreen = (p: { x: number; y: number }) => ({ x: cx + p.x * R, y: cy + p.y * R });
      const Cs = toScreen(C);
      const rs = r * R;
      const As = toScreen(A);
      const Bs = toScreen(B);

      // Draw shorter arc between A and B
      const angA = Math.atan2(As.y - Cs.y, As.x - Cs.x);
      const angB = Math.atan2(Bs.y - Cs.y, Bs.x - Cs.x);

      // choose minor arc direction
      let d = angB - angA;
      while (d <= -Math.PI) d += Math.PI * 2;
      while (d > Math.PI) d -= Math.PI * 2;

      ctx.beginPath();
      ctx.arc(Cs.x, Cs.y, rs, angA, angA + d, d < 0);
      ctx.stroke();
    };

    const render = () => {
      t += 0.008;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(60,60,60,0.34)';
      ctx.lineWidth = 1;

      // Boundary circle
      ctx.beginPath();
      ctx.arc(cx, cy, R, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(60,60,60,0.5)';
      ctx.stroke();

      ctx.strokeStyle = 'rgba(60,60,60,0.26)';
      // web arcs from pairs of moving endpoints
      const n = 24;
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2 + 0.4 * Math.sin(t + i);
        const b = a + Math.PI * (0.3 + 0.2 * Math.sin(t * 0.7 + i * 0.3));
        drawArcThrough(a, b);
      }

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [width, height]);

  return (
    <div style={{ width, height, background: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default PoincareWeb;


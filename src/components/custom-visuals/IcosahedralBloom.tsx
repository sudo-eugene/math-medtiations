import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Rotating icosahedron wireframe with concentric scaled blooms
const IcosahedralBloom: React.FC<VisualProps> = ({ width, height }) => {
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

    // Icosahedron vertices (phi = golden ratio)
    const phi = (1 + Math.sqrt(5)) / 2;
    const verts = [
      [-1,  phi, 0], [1,  phi, 0], [-1, -phi, 0], [1, -phi, 0],
      [0, -1,  phi], [0, 1,  phi], [0, -1, -phi], [0, 1, -phi],
      [ phi, 0, -1], [ phi, 0, 1], [-phi, 0, -1], [-phi, 0, 1],
    ];
    const edges = new Set<string>();
    const faces = [
      [0,11,5],[0,5,1],[0,1,7],[0,7,10],[0,10,11],
      [1,5,9],[5,11,4],[11,10,2],[10,7,6],[7,1,8],
      [3,9,4],[3,4,2],[3,2,6],[3,6,8],[3,8,9],
      [4,9,5],[2,4,11],[6,2,10],[8,6,7],[9,8,1]
    ];
    for (const f of faces) {
      for (let i = 0; i < 3; i++) {
        const a = f[i], b = f[(i + 1) % 3];
        const key = a < b ? `${a}-${b}` : `${b}-${a}`;
        edges.add(key);
      }
    }
    const edgePairs = Array.from(edges).map(s => s.split('-').map(Number) as [number, number]);

    const project = (x: number, y: number, z: number) => {
      const f = 220 / (z + 400);
      return [x * f + width / 2, y * f + height / 2] as [number, number];
    };

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const rotX = t * 0.6;
      const rotY = t * 0.4 + 1.0;
      const scale = 70 + 10 * Math.sin(t);

      const rot = (v: number[]) => {
        let [x, y, z] = v.map(p => p * scale);
        let yy = y * Math.cos(rotX) - z * Math.sin(rotX);
        let zz = y * Math.sin(rotX) + z * Math.cos(rotX);
        let xx = x * Math.cos(rotY) + zz * Math.sin(rotY);
        zz = -x * Math.sin(rotY) + zz * Math.cos(rotY);
        return [xx, yy, zz];
      };

      const rv = verts.map(rot);

      // Draw several scaled blooms
      for (let m = 0; m < 4; m++) {
        const alpha = 0.34 - m * 0.06;
        ctx.strokeStyle = `rgba(60,60,60,${Math.max(0.06, alpha)})`;
        ctx.lineWidth = 1;
        for (const [a, b] of edgePairs) {
          const A = rv[a]; const B = rv[b];
          const s = 1 + m * 0.25;
          const [x1, y1] = project(A[0] * s, A[1] * s, A[2] * s);
          const [x2, y2] = project(B[0] * s, B[1] * s, B[2] * s);
          ctx.beginPath();
          ctx.moveTo(x1, y1);
          ctx.lineTo(x2, y2);
          ctx.stroke();
        }
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

export default IcosahedralBloom;


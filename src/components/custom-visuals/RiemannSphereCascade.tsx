// Themes: complex projection, rotating calm, spherical cascade
// Visualisation: Points on the Riemann sphere rotate and project stereographically onto the plane, forming cascading arcs
// Unique mechanism: Samples points on the sphere, rotates them, and stereographically projects to the plane producing analytic cascades
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface Point {
  phi: number;
  theta: number;
}

const RiemannSphereCascade: React.FC<VisualProps> = ({ width, height }) => {
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

    const count = 240;
    const points: Point[] = Array.from({ length: count }).map((_, i) => ({
      phi: Math.acos(1 - 2 * ((i + 0.5) / count)),
      theta: Math.PI * (1 + Math.sqrt(5)) * i,
    }));

    const project = (x: number, y: number, z: number) => {
      const denom = 1 - z;
      if (Math.abs(denom) < 1e-6) {
        return { x: width / 2, y: height / 2 };
      }
      const px = x / denom;
      const py = y / denom;
      const scale = Math.min(width, height) * 0.24;
      return {
        x: width / 2 + px * scale,
        y: height / 2 + py * scale,
      };
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0004;
      ctx.lineWidth = 0.8;
      ctx.strokeStyle = 'rgba(25,25,25,0.16)';
      for (let i = 0; i < points.length; i++) {
        const p = points[i];
        const phi = p.phi;
        const theta = p.theta + t * 1.2;
        const x = Math.sin(phi) * Math.cos(theta);
        const y = Math.sin(phi) * Math.sin(theta);
        const z = Math.cos(phi);
        const rotX = x * Math.cos(t * 0.7) - z * Math.sin(t * 0.7);
        const rotZ = x * Math.sin(t * 0.7) + z * Math.cos(t * 0.7);
        const pos = project(rotX, y, rotZ);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 1.6, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(25,25,25,0.18)';
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
  themes: 'riemann-sphere,projection,cascade',
  visualisation: 'Riemann sphere points cascade via stereographic projection',
  promptSuggestion: '1. Picture complex points unfolding\n2. Follow the stereographic drift\n3. Let the analytic cascade calm you'
};
(RiemannSphereCascade as any).metadata = metadata;

export default RiemannSphereCascade;

// Differs from others by: Rotates points on the Riemann sphere and stereographically projects them to the plane.

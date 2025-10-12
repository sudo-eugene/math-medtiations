// Themes: torus, quasiperiodic, thread
// Visualisation: A glimmering thread winds quasiperiodically over a torus
// Unique mechanism: Incommensurate-angle Lissajous trajectory projected into flowing canvas particles

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

interface TorusPoint {
  baseT: number;
  phase: number;
  jitter: number;
}

const QuasiTorusLissajous: React.FC<VisualProps> = ({ width, height }) => {
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

    const cx = width / 2;
    const cy = height / 2;
    const scale = Math.min(width, height) * 0.32;

    const R = 0.7; // major radius
    const r = 0.32; // minor radius
    const w1 = Math.PI * 2 * (1 / 3);
    const w2 = Math.PI * 2 * (Math.SQRT2 / 5);

    const pointCount = 1200;
    const points: TorusPoint[] = Array.from({ length: pointCount }).map((_, i) => ({
      baseT: i / pointCount,
      phase: (i * 0.6180339887) % 1,
      jitter: (Math.sin(i * 17.37) * 43758.5453) % 1
    }));

    const render = (t: number) => {
      const time = t * 0.001;

      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const rotY = time * 0.18;
      const rotX = Math.sin(time * 0.23) * 0.35;
      const sinY = Math.sin(rotY);
      const cosY = Math.cos(rotY);
      const sinX = Math.sin(rotX);
      const cosX = Math.cos(rotX);

      points.forEach((point, idx) => {
        const progress = point.baseT + time * 0.08;
        const u = progress * w1 * 2;
        const v = progress * w2 * 2 + point.phase * Math.PI * 2;

        const breathe = 1 + 0.04 * Math.sin(time * 0.6 + point.phase * Math.PI * 2);
        const localR = R * breathe;
        const localr = r * (1 + 0.05 * Math.cos(time * 0.8 + point.jitter * 5));

        let x = (localR + localr * Math.cos(v)) * Math.cos(u);
        let y = (localR + localr * Math.cos(v)) * Math.sin(u);
        let z = localr * Math.sin(v);

        // rotate around Y then X
        const zx = z * cosY - x * sinY;
        const xx = z * sinY + x * cosY;
        const yx = y;

        const zy = yx * sinX + zx * cosX;
        const yy = yx * cosX - zx * sinX;
        const xx2 = xx;

        const perspective = 1.4 / (1.6 + zy);
        const px = cx + xx2 * scale * perspective;
        const py = cy + yy * scale * perspective;

        const depth = Math.max(0.1, Math.min(1.0, 0.6 + perspective * 0.8));
        const pulse = Math.sin(time * 1.2 + point.phase * Math.PI * 8) * 0.15 + 0.85;
        const radius = 1.6 + perspective * 3 * pulse;

        const tone = 88 + depth * 22;
        const alpha = 0.08 + depth * 0.22;

        const gradient = ctx.createRadialGradient(px, py, 0, px, py, radius * 1.8);
        gradient.addColorStop(0, `rgba(${tone}, ${tone}, ${tone}, ${alpha})`);
        gradient.addColorStop(1, `rgba(${tone}, ${tone}, ${tone}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(px, py, radius * 1.8, 0, Math.PI * 2);
        ctx.fill();

        const coreGradient = ctx.createRadialGradient(px, py, 0, px, py, radius);
        coreGradient.addColorStop(0, `rgba(${tone - 10}, ${tone - 10}, ${tone - 10}, ${alpha * 1.6})`);
        coreGradient.addColorStop(1, `rgba(${tone - 10}, ${tone - 10}, ${tone - 10}, 0)`);

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(px, py, radius, 0, Math.PI * 2);
        ctx.fill();
      });

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
  themes: "torus, quasiperiodic, thread, gentle rotation",
  visualisation: "Glimmering thread winds quasiperiodically across a torus",
  promptSuggestion: "1. Adjust lattice density\n2. Vary winding frequencies\n3. Soften glow intensity"
};
(QuasiTorusLissajous as any).metadata = metadata;

export default QuasiTorusLissajous;

// Differs from others by: Simulates Lissajous motion over a torus using canvas-projected quasi-periodic points

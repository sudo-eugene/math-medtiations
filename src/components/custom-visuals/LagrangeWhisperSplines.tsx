// Themes: interpolated calm, whispering splines, quiet anchors
// Visualisation: Smooth splines pass through drifting anchor points using Lagrange interpolation, creating whispering ribbons
// Unique mechanism: Evaluates Lagrange polynomial interpolation over moving anchors to draw continuous spline ribbons
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Anchor {
  x: number;
  y: number;
  phase: number;
}

const LagrangeWhisperSplines: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(0x7ac1d3f2);
    const splineCount = 5;
    const anchorCount = 5;
    const anchors: Anchor[][] = Array.from({ length: splineCount }).map(() =>
      Array.from({ length: anchorCount }).map(() => ({
        x: width * (0.2 + rng() * 0.6),
        y: height * (0.2 + rng() * 0.6),
        phase: rng() * Math.PI * 2,
      }))
    );

    const evaluateLagrange = (control: Anchor[], t: number) => {
      let x = 0;
      let y = 0;
      const n = control.length;
      for (let i = 0; i < n; i++) {
        let basis = 1;
        for (let j = 0; j < n; j++) {
          if (i === j) continue;
          basis *= (t - j) / (i - j);
        }
        x += control[i].x * basis;
        y += control[i].y * basis;
      }
      return { x, y };
    };

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      for (let s = 0; s < splineCount; s++) {
        const control = anchors[s];
        for (let i = 0; i < control.length; i++) {
          const anchor = control[i];
          anchor.x = width * (0.5 + 0.28 * Math.sin(t * 0.6 + anchor.phase + i * 0.5 + s));
          anchor.y = height * (0.5 + 0.22 * Math.cos(t * 0.7 + anchor.phase * 1.2 + i * 0.4 - s));
        }

        ctx.strokeStyle = `rgba(25,25,25,${0.06 + s * 0.05})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        const resolution = 160;
        for (let k = 0; k <= resolution; k++) {
          const param = (k / resolution) * (anchorCount - 1);
          const { x, y } = evaluateLagrange(control, param);
          if (k === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
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
  themes: 'lagrange,splines,whisper',
  visualisation: 'Lagrange-interpolated splines whisper through anchors',
  promptSuggestion: '1. Follow the curve passing each anchor\n2. Hear a whisper as points align\n3. Let the smooth interpolation settle you'
};
(LagrangeWhisperSplines as any).metadata = metadata;

export default LagrangeWhisperSplines;

// Differs from others by: Uses Lagrange polynomial interpolation over moving anchors to draw flowing spline ribbons.

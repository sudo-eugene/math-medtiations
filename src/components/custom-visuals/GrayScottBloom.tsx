// Themes: organic chemistry, blooming ink, meditative diffusion
// Visualisation: Soft cellular labyrinths bloom and dissolve in greyscale ripples
// Unique mechanism: Discrete Gray-Scott reaction–diffusion simulation rendered through a scaled buffer
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const GrayScottBloom: React.FC<VisualProps> = ({ width, height }) => {
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

    const gridW = Math.max(90, Math.floor(width / 8));
    const gridH = Math.max(60, Math.floor(height / 8));
    const Du = 0.18;
    const Dv = 0.08;
    const feed = 0.046;
    const kill = 0.065;
    const dt = 1;

    const u = new Float32Array(gridW * gridH);
    const v = new Float32Array(gridW * gridH);
    const nextU = new Float32Array(gridW * gridH);
    const nextV = new Float32Array(gridW * gridH);

    const rng = createRng(0xc13102ee);
    for (let i = 0; i < gridW * gridH; i++) {
      u[i] = 1;
      v[i] = 0;
      if (rng() < 0.02) {
        v[i] = 1;
      }
    }

    const offscreen = document.createElement('canvas');
    offscreen.width = gridW;
    offscreen.height = gridH;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    const imageData = offCtx.createImageData(gridW, gridH);

    const laplace = (arr: Float32Array, x: number, y: number) => {
      const xm = (x - 1 + gridW) % gridW;
      const xp = (x + 1) % gridW;
      const ym = (y - 1 + gridH) % gridH;
      const yp = (y + 1) % gridH;
      const center = arr[y * gridW + x] * -1;
      const sum =
        center +
        arr[y * gridW + xm] * 0.2 +
        arr[y * gridW + xp] * 0.2 +
        arr[ym * gridW + x] * 0.2 +
        arr[yp * gridW + x] * 0.2 +
        arr[ym * gridW + xm] * 0.05 +
        arr[ym * gridW + xp] * 0.05 +
        arr[yp * gridW + xm] * 0.05 +
        arr[yp * gridW + xp] * 0.05;
      return sum;
    };

    const render = () => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      for (let y = 0; y < gridH; y++) {
        for (let x = 0; x < gridW; x++) {
          const idx = y * gridW + x;
          const uVal = u[idx];
          const vVal = v[idx];
          const dudt = Du * laplace(u, x, y) - uVal * vVal * vVal + feed * (1 - uVal);
          const dvdt = Dv * laplace(v, x, y) + uVal * vVal * vVal - (feed + kill) * vVal;
          nextU[idx] = uVal + dudt * dt;
          nextV[idx] = vVal + dvdt * dt;
        }
      }

      for (let i = 0; i < gridW * gridH; i++) {
        u[i] = Math.min(1, Math.max(0, nextU[i]));
        v[i] = Math.min(1, Math.max(0, nextV[i]));
        const val = Math.max(0, Math.min(1, v[i] - u[i] * 0.3));
        const shade = 200 - val * 160;
        const alpha = 255;
        const baseIndex = i * 4;
        imageData.data[baseIndex] = shade;
        imageData.data[baseIndex + 1] = shade;
        imageData.data[baseIndex + 2] = shade;
        imageData.data[baseIndex + 3] = alpha;
      }

      offCtx.putImageData(imageData, 0, 0);
      ctx.save();
      ctx.globalAlpha = 0.76;
      ctx.drawImage(offscreen, 0, 0, width, height);
      ctx.restore();

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
  themes: 'diffusion,bloom,chemistry',
  visualisation: 'Reaction–diffusion ink blooms evolving gently',
  promptSuggestion: '1. Witness chemistry balancing itself\n2. Breathe with the slow blooming labyrinth\n3. Sense reaction and diffusion finding harmony'
};
(GrayScottBloom as any).metadata = metadata;

export default GrayScottBloom;

// Differs from others by: Implements an in-place Gray-Scott reaction–diffusion solver rendered via a scaled buffer.

// Themes: diffusion calm, kernel bloom, temporal balance
// Visualisation: Ripples emanate from heat kernel sources, diffusing evenly across the canvas
// Unique mechanism: Convolves a heat kernel with moving impulse sources on a grid to update intensity
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const HeatKernelRipples: React.FC<VisualProps> = ({ width, height }) => {
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

    const cols = 100;
    const rows = 70;
    const grid = new Float32Array(cols * rows);

    const sources = Array.from({ length: 3 }).map((_, i) => ({
      x: Math.random() * cols,
      y: Math.random() * rows,
      phase: i * 2,
    }));

    const kernelSize = 9;
    const kernelSigma = 1.6;
    const kernel: number[][] = [];
    let kernelSum = 0;
    for (let y = -kernelSize; y <= kernelSize; y++) {
      const rowValues: number[] = [];
      for (let x = -kernelSize; x <= kernelSize; x++) {
        const value = Math.exp(-(x * x + y * y) / (2 * kernelSigma * kernelSigma));
        rowValues.push(value);
        kernelSum += value;
      }
      kernel.push(rowValues);
    }

    const cellW = width / cols;
    const cellH = height / rows;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      grid.fill(0);
      const t = time * 0.0004;
      sources.forEach((source, idx) => {
        source.x = (cols / 2) + Math.cos(t + source.phase + idx) * cols * 0.2;
        source.y = (rows / 2) + Math.sin(t * 1.2 + source.phase) * rows * 0.2;
        const gx = Math.floor(source.x);
        const gy = Math.floor(source.y);
        if (gx >= 0 && gx < cols && gy >= 0 && gy < rows) {
          grid[gy * cols + gx] += 1.0;
        }
      });

      const result = new Float32Array(cols * rows);
      for (let y = kernelSize; y < rows - kernelSize; y++) {
        for (let x = kernelSize; x < cols - kernelSize; x++) {
          let sum = 0;
          for (let ky = -kernelSize; ky <= kernelSize; ky++) {
            for (let kx = -kernelSize; kx <= kernelSize; kx++) {
              sum += grid[(y + ky) * cols + (x + kx)] * kernel[ky + kernelSize][kx + kernelSize];
            }
          }
          result[y * cols + x] = sum / kernelSum;
        }
      }

      ctx.fillStyle = 'rgba(25,25,25,0.18)';
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          const value = result[y * cols + x];
          const alpha = Math.min(0.2, value * 0.4);
          if (alpha < 0.02) continue;
          ctx.globalAlpha = alpha;
          ctx.fillRect(x * cellW, y * cellH, cellW, cellH);
        }
      }
      ctx.globalAlpha = 1;

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
  themes: 'heat-kernel,ripples,diffusion',
  visualisation: 'Heat kernels with moving sources create rippling gradients',
  promptSuggestion: '1. Picture warmth spreading evenly\n2. Follow ripples as they overlap\n3. Let the diffusing glow calm you'
};
(HeatKernelRipples as any).metadata = metadata;

export default HeatKernelRipples;

// Differs from others by: Convolves moving impulses with a heat kernel to create evolving ripple intensity.

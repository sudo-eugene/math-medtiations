// Themes: fluid scrolls, shear harmony, layered motion
// Visualisation: Layered ribbons curl like Kelvin–Helmholtz billows across the parchment
// Unique mechanism: Advects streamline samples through an analytic two-layer shear field with oscillatory vorticity to emulate Kelvin–Helmholtz roll-up
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const KelvinShearScrolls: React.FC<VisualProps> = ({ width, height }) => {
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

    const rows = 14;
    const cols = 110;
    const points = new Float32Array(rows * cols * 2);
    const baseSpacingX = width / (cols - 1);
    const baseSpacingY = height / (rows + 1);

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const idx = (r * cols + c) * 2;
        points[idx] = c * baseSpacingX;
        points[idx + 1] = (r + 1) * baseSpacingY;
      }
    }

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.001;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const idx = (r * cols + c) * 2;
          let x = points[idx];
          let y = points[idx + 1];
          const yNorm = (y / height - 0.5) * 2;
          const baseShear = yNorm >= 0 ? 0.7 : -0.7;
          const shearOsc = Math.sin(yNorm * Math.PI * 0.8 + t * 1.1) * 0.45;
          const vortAmp = Math.exp(-Math.pow(yNorm * 1.8, 2));
          const vortX = Math.sin((x / width) * 6 + t * 1.6) * vortAmp * 0.9;
          const vortY = Math.cos((x / width) * 3.5 - t * 1.2) * vortAmp * 0.45;
          const drift = Math.sin(t * 0.6 + r * 0.2) * 0.25;

          x += (baseShear + shearOsc + vortX + drift) * 0.8;
          y += vortY * 0.7;
          if (x < 0) x += width;
          if (x > width) x -= width;
          if (y < height * 0.1 || y > height * 0.9) {
            y = Math.min(Math.max(y, height * 0.12), height * 0.88);
          }
          points[idx] = x;
          points[idx + 1] = y;
        }
      }

      ctx.lineWidth = 1.1;
      for (let r = 0; r < rows; r++) {
        ctx.strokeStyle = `rgba(25,25,25,${0.08 + 0.02 * Math.sin(t + r)})`;
        ctx.beginPath();
        for (let c = 0; c < cols; c++) {
          const idx = (r * cols + c) * 2;
          const x = points[idx];
          const y = points[idx + 1];
          if (c === 0) ctx.moveTo(x, y);
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
  themes: 'shear,fluid,ribbons',
  visualisation: 'Kelvin–Helmholtz-like billows form layered scrolls',
  promptSuggestion: '1. Follow the billows curling softly\n2. Feel opposing layers resolving turbulence\n3. Let each ribbon guide a calming breath'
};
(KelvinShearScrolls as any).metadata = metadata;

export default KelvinShearScrolls;

// Differs from others by: Advects streamline samples through a two-layer shear field with oscillatory vorticity to mimic Kelvin–Helmholtz roll-ups.

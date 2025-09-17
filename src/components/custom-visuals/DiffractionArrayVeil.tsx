// Themes: optical meditation, interference calm, wave lattices
// Visualisation: Quasi-static interference caustics drift as overlapping ink veils
// Unique mechanism: Computes wave interference from animated slit array on a coarse lattice each frame
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const DiffractionArrayVeil: React.FC<VisualProps> = ({ width, height }) => {
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

    const cols = Math.max(180, Math.floor(width / 4));
    const rows = Math.max(120, Math.floor(height / 4));
    const offscreen = document.createElement('canvas');
    offscreen.width = cols;
    offscreen.height = rows;
    const offCtx = offscreen.getContext('2d');
    if (!offCtx) return;
    const imageData = offCtx.createImageData(cols, rows);

    const slits = [
      { x: -0.4, phase: 0, speed: 0.0004 },
      { x: -0.15, phase: 2.1, speed: 0.0005 },
      { x: 0, phase: 4.2, speed: -0.0003 },
      { x: 0.2, phase: 1.2, speed: 0.00042 },
      { x: 0.42, phase: 5.3, speed: -0.00036 }
    ];

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const t = time;
      for (let i = 0; i < slits.length; i++) {
        slits[i].phase += slits[i].speed * 60;
      }

      const wavelength = 16;
      const focusDepth = 0.6;
      for (let row = 0; row < rows; row++) {
        const ny = (row / rows - 0.5) * 2;
        for (let col = 0; col < cols; col++) {
          const nx = (col / cols - 0.5) * 2;
          let wave = 0;
          for (let k = 0; k < slits.length; k++) {
            const slit = slits[k];
            const dx = nx - slit.x;
            const dist = Math.sqrt(dx * dx + focusDepth * focusDepth);
            wave += Math.sin(dist * wavelength + slit.phase + t * 0.00018 * (k + 1));
          }
          const intensity = Math.pow(Math.abs(wave) / slits.length, 1.4);
          const shade = 200 - intensity * 140;
          const idx = (row * cols + col) * 4;
          imageData.data[idx] = shade;
          imageData.data[idx + 1] = shade;
          imageData.data[idx + 2] = shade;
          imageData.data[idx + 3] = 255;
        }
      }

      offCtx.putImageData(imageData, 0, 0);
      ctx.globalAlpha = 0.72;
      ctx.drawImage(offscreen, 0, 0, width, height);
      ctx.globalAlpha = 1;

      ctx.strokeStyle = 'rgba(30,30,30,0.18)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i < slits.length; i++) {
        const x = width * 0.5 + slits[i].x * width * 0.45;
        ctx.moveTo(x, height * 0.1);
        ctx.lineTo(x, height * 0.3);
      }
      ctx.stroke();

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
  themes: 'interference,optics,veil',
  visualisation: 'Drifting multi-slit diffraction caustics',
  promptSuggestion: '1. Imagine light weaving through narrow gates\n2. Follow interference fringes as a breathing exercise\n3. Sense gentle optics soothing the scene'
};
(DiffractionArrayVeil as any).metadata = metadata;

export default DiffractionArrayVeil;

// Differs from others by: Computes multi-slit interference intensities across a grid for every frame.

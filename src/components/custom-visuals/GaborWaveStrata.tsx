// Themes: textured calm, analytic stripes, harmonic strata
// Visualisation: Horizontal strata pulse with Gabor-filtered waves, creating textured calm layers
// Unique mechanism: Evaluates Gabor functions (Gaussian-windowed cosines) per strip to modulate opacity and offset
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const gabor = (x: number, sigma: number, freq: number, phase: number) => {
  return Math.exp(-x * x / (2 * sigma * sigma)) * Math.cos(freq * x + phase);
};

const GaborWaveStrata: React.FC<VisualProps> = ({ width, height }) => {
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

    const layers = 80;
    const layerHeight = height / layers;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0005;
      ctx.fillStyle = '#1f1f1f';
      for (let i = 0; i < layers; i++) {
        const y = i * layerHeight;
        const normalized = i / layers;
        const value = gabor(normalized - 0.5, 0.2 + 0.1 * Math.sin(t + normalized * 3), 12 + 6 * Math.sin(t * 0.7), t + i);
        const alpha = 0.05 + Math.min(0.2, Math.abs(value) * 0.18);
        const offset = 8 * Math.sin(t * 0.8 + normalized * 5);
        ctx.fillStyle = `rgba(25,25,25,${alpha})`;
        ctx.fillRect(offset, y, width - 2 * offset, layerHeight * 0.9);
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
  themes: 'gabor,strata,texture',
  visualisation: 'Gabor-filtered strata create textured calm',
  promptSuggestion: '1. Observe Gaussian-windowed waves breathing\n2. Imagine textured layers aligning\n3. Let the analytic strata relax you'
};
(GaborWaveStrata as any).metadata = metadata;

export default GaborWaveStrata;

// Differs from others by: Uses Gabor functions to modulate horizontal strata opacity and offsets.

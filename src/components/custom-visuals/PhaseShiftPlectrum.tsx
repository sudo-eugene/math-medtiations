// Themes: resonant strum, radial calm, phased motion
// Visualisation: Radial plectrum lines oscillate with phase-shifted amplitudes, like a meditation string instrument
// Unique mechanism: Applies phase-shifted sine envelopes to radial spokes to emulate plucked strings on a circular layout
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const PhaseShiftPlectrum: React.FC<VisualProps> = ({ width, height }) => {
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

    const spokes = 96;
    const cx = width / 2;
    const cy = height / 2;
    const baseRadius = Math.min(width, height) * 0.42;

    const render = (time: number) => {
      ctx.fillStyle = 'rgba(240,238,230,0.045)';
      ctx.fillRect(0, 0, width, height);

      const t = time * 0.0006;
      ctx.lineWidth = 0.85;
      for (let i = 0; i < spokes; i++) {
        const angle = (i / spokes) * Math.PI * 2;
        const wave = Math.sin(t * 1.5 + i * 0.2);
        const vibrato = Math.sin((t + i * 0.1) * 2.1) * 0.15;
        const length = baseRadius * (0.7 + 0.2 * wave + 0.1 * vibrato);
        const x1 = cx + Math.cos(angle) * length;
        const y1 = cy + Math.sin(angle) * length;
        const innerLength = baseRadius * (0.2 + 0.1 * Math.cos(t * 0.8 + i * 0.3));
        const x0 = cx + Math.cos(angle) * innerLength;
        const y0 = cy + Math.sin(angle) * innerLength;
        ctx.strokeStyle = `rgba(25,25,25,${0.06 + 0.14 * Math.abs(wave)})`;
        ctx.beginPath();
        ctx.moveTo(x0, y0);
        ctx.lineTo(x1, y1);
        ctx.stroke();
      }

      ctx.strokeStyle = 'rgba(20,20,20,0.12)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(cx, cy, baseRadius * 0.22, 0, Math.PI * 2);
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
  themes: 'phase,plectrum,resonance',
  visualisation: 'Radial spokes vibrate with phase-shifted envelopes',
  promptSuggestion: '1. Imagine a circular instrument being plucked\n2. Follow each spoke’s vibration\n3. Sync breath with the phased strums'
};
(PhaseShiftPlectrum as any).metadata = metadata;

export default PhaseShiftPlectrum;

// Differs from others by: Applies phase-shifted sine envelopes to radial spokes to emulate a plucked circular instrument.

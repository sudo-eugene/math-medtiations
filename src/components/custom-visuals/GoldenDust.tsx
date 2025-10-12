import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Phyllotaxis dust breathing in and out with layered glow
const GoldenDust: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const particleCount = 4200;

    type Particle = {
      index: number;
      radialFactor: number;
      jitterPhase: number;
      hueOffset: number;
    };

    const particles: Particle[] = Array.from({ length: particleCount }, (_, index) => ({
      index,
      radialFactor: Math.sqrt(index / particleCount),
      jitterPhase: Math.random() * Math.PI * 2,
      hueOffset: (Math.random() - 0.5) * 6,
    }));

    let raf: number | null = null;
    let t = 0;

    const render = () => {
      t += 0.008;

      const cx = width / 2;
      const cy = height / 2;
      const minDim = Math.min(width, height);

      // Background layers for gentle glow
      const bgGradient = ctx.createRadialGradient(cx, cy, minDim * 0.12, cx, cy, minDim * 0.7);
      bgGradient.addColorStop(0, '#F7F3E7');
      bgGradient.addColorStop(0.6, '#F1E9D9');
      bgGradient.addColorStop(1, '#E5DCCB');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      const veil = ctx.createLinearGradient(0, 0, width, height);
      veil.addColorStop(0, 'rgba(228, 204, 153, 0.12)');
      veil.addColorStop(0.5, 'rgba(255, 232, 189, 0.08)');
      veil.addColorStop(1, 'rgba(206, 181, 140, 0.12)');
      ctx.fillStyle = veil;
      ctx.fillRect(0, 0, width, height);

      const breathing = 0.82 + 0.18 * Math.sin(t * 0.6);

      ctx.save();
      ctx.globalCompositeOperation = 'source-over';

      particles.forEach((particle) => {
        const angle =
          particle.index * goldenAngle +
          0.28 * Math.sin(t * 0.7 + particle.jitterPhase * 0.6);

        const radius =
          breathing * (0.32 + particle.radialFactor * 0.65) * minDim * 0.45;

        const swirl = 0.015 * Math.sin(particle.index * 0.004 + t * 1.4);
        const x = cx + radius * Math.cos(angle + swirl);
        const y = cy + radius * Math.sin(angle + swirl * 0.8);

        const size =
          0.7 +
          (1 - particle.radialFactor) * 0.9 +
          0.45 * Math.sin(t * 1.35 + particle.jitterPhase);
        const alpha = 0.5 + 0.35 * Math.sin(t * 1.1 + particle.jitterPhase * 1.2);

        const depth = 1 - particle.radialFactor;
        const hue = 32 + particle.hueOffset * 0.6;
        const saturation = 16 + depth * 10;
        const lightness = 22 + depth * 18;

        ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${lightness}%, ${Math.max(0.18, alpha)})`;
        ctx.shadowColor = `hsla(${hue}, ${Math.min(24, saturation + 6)}%, ${Math.min(40, lightness + 6)}%, 0.45)`;
        ctx.shadowBlur = 8 + depth * 10;
        ctx.beginPath();
        ctx.arc(x, y, Math.max(0.45, size * 0.45), 0, Math.PI * 2);
        ctx.fill();

        if (depth > 0.65) {
          const highlightSize = Math.max(0.6, size * 0.2);
          ctx.fillStyle = `hsla(${hue}, ${saturation}%, ${Math.min(46, lightness + 12)}%, ${Math.max(0.08, alpha * 0.25)})`;
          ctx.beginPath();
          ctx.arc(x, y, highlightSize, 0, Math.PI * 2);
          ctx.fill();
        }
      });

      ctx.restore();

      // Soft vignette
      const vignette = ctx.createRadialGradient(cx, cy, minDim * 0.2, cx, cy, minDim * 0.9);
      vignette.addColorStop(0, 'rgba(0, 0, 0, 0)');
      vignette.addColorStop(1, 'rgba(88, 60, 20, 0.12)');
      ctx.fillStyle = vignette;
      ctx.fillRect(0, 0, width, height);

      raf = requestAnimationFrame(render);
    };

    raf = requestAnimationFrame(render);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [width, height]);

  return (
    <div style={{ width, height, background: '#F6F1E4' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default GoldenDust;

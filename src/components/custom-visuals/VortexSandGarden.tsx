import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: swirling particles settling into raked zen patterns
const VortexSandGarden: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);

  const easeInOut = (t: number) => t * t * (3 - 2 * t);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    let time = 0;

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      const cycleLength = 12;
      const normalizedPhase = (time % cycleLength) / cycleLength;
      const swirlStrength = normalizedPhase < 0.6 ? easeInOut(1 - normalizedPhase / 0.6) : 0;
      const rakeStrength = normalizedPhase > 0.25 ? easeInOut(Math.min(1, (normalizedPhase - 0.25) / 0.75)) : 0;
      const cx = width / 2;
      const cy = height / 2;
      const maxRadius = Math.min(cx, cy) * 0.88;

      if (swirlStrength > 0.01) {
        const particles = 450;
        ctx.save();
        ctx.fillStyle = `rgba(50, 50, 50, ${0.15 + 0.25 * swirlStrength})`;
        for (let i = 0; i < particles; i++) {
          const progress = i / particles;
          const spiralTurns = 8;
          const baseRadius = maxRadius * Math.pow(progress, 0.75) * (0.35 + 0.65 * swirlStrength);
          const jitter = Math.sin(progress * 40 + time * 0.8) * 6 * swirlStrength;
          const radius = baseRadius + jitter;
          const angle = spiralTurns * progress * Math.PI * 2 + time * (0.4 + swirlStrength * 0.4);
          const drift = Math.sin(time * 0.6 + progress * 12) * 8 * swirlStrength;
          const x = cx + radius * Math.cos(angle);
          const y = cy + radius * Math.sin(angle) + drift;
          ctx.fillRect(x, y, 1.2, 1.2);
        }
        ctx.restore();
      }

      if (rakeStrength > 0.01) {
        ctx.save();
        ctx.strokeStyle = `rgba(60, 55, 50, ${0.15 + 0.35 * rakeStrength})`;
        ctx.lineWidth = 0.8;
        const rippleCount = Math.floor(maxRadius / 8);
        for (let i = 1; i <= rippleCount; i++) {
          const r = (i / rippleCount) * maxRadius;
          const wobble = Math.sin(time * 0.3 + i * 0.6) * 2 * (1 - Math.pow(i / rippleCount, 2));
          ctx.beginPath();
          ctx.arc(cx, cy + 24 * (1 - rakeStrength), r + wobble, 0, Math.PI * 2);
          ctx.stroke();
        }
        ctx.restore();
      }

      time += 0.02;
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);
    return () => {
      if (animationFrameRef.current !== null) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [width, height]);

  return (
    <div
      className="flex justify-center items-center shadow-lg rounded-lg"
      style={{ width: `${width}px`, height: `${height}px`, backgroundColor: '#F0EEE6' }}
    >
      <canvas ref={canvasRef} className="max-w-full max-h-full" />
    </div>
  );
};

export default VortexSandGarden;

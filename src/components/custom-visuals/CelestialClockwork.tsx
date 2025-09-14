import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Theme: cosmic timing and harmony
// Visualization: Orbiting circles with varied speeds that briefly glow when aligned

const CelestialClockwork: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    const count = 5;
    const maxRadius = Math.min(width, height) * 0.4;
    const radii = Array.from({ length: count }, (_, i) => (maxRadius * (i + 1)) / count);
    const angularVelocities = Array.from({ length: count }, (_, i) => 0.01 + i * 0.003);
    const angles = Array.from({ length: count }, () => Math.random() * Math.PI * 2);
    const glows = Array(count).fill(0);

    let animationFrameId: number;
    const draw = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      // detect alignments
      for (let i = 0; i < count; i++) {
        for (let j = i + 1; j < count; j++) {
          const diff = Math.abs(angles[i] - angles[j]);
          const alignment = Math.min(diff, Math.PI * 2 - diff);
          if (alignment < 0.05) {
            glows[i] = 1;
            glows[j] = 1;
          }
        }
      }

      for (let i = 0; i < count; i++) {
        const x = centerX + Math.cos(angles[i]) * radii[i];
        const y = centerY + Math.sin(angles[i]) * radii[i];

        if (glows[i] > 0) {
          const glowRadius = 8;
          ctx.beginPath();
          ctx.arc(x, y, glowRadius, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(255, 200, 0, ${glows[i]})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fillStyle = '#333333';
        ctx.fill();

        angles[i] += angularVelocities[i];
        glows[i] *= 0.92;
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default CelestialClockwork;


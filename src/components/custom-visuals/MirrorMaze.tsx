import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Theme: seeing oneself in every direction through endless reflection
// Visualization: Nested rectangles with alternating mirrored transforms creating an infinite maze effect
// Reference: https://en.wikipedia.org/wiki/Infinity_mirror

const MirrorMaze: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

      ctx.save();
      ctx.translate(width / 2, height / 2);

      // Global animation for rotation and scale
      const scaleAnim = 1 + Math.sin(time * 0.5) * 0.2;
      ctx.scale(scaleAnim, scaleAnim);
      ctx.rotate(time * 0.2);

      const baseSize = Math.min(width, height) * 0.8;

      // Draw nested rectangles with alternating mirroring
      for (let i = 0; i < 20; i++) {
        ctx.strokeStyle = `rgba(80, 80, 80, ${0.8 - i * 0.04})`;
        ctx.lineWidth = 1;
        ctx.strokeRect(-baseSize / 2, -baseSize / 2, baseSize, baseSize);

        // Mirror horizontally and scale down for next rectangle
        ctx.scale(-0.85, 0.85);
        ctx.rotate(0.1);
      }

      ctx.restore();

      time += 0.01;
      animationFrameId = requestAnimationFrame(animate);
    };

    let animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height]);

  return (
    <div
      className="flex justify-center items-center shadow-lg rounded-lg"
      style={{ width: `${width}px`, height: `${height}px`, backgroundColor: '#F0EEE6' }}
    >
      <canvas ref={canvasRef} width={width} height={height} className="max-w-full max-h-full" />
    </div>
  );
};

export default MirrorMaze;


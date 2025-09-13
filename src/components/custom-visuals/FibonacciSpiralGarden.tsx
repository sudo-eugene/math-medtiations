import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: harmonious growth, natural expansion, creative unfolding
// Visualization: Fibonacci spiral garden blooming with ASCII petals following the golden angle

const FibonacciSpiralGarden: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    const goldenAngle = Math.PI * (3 - Math.sqrt(5));
    const points: { x: number; y: number; angle: number }[] = [];
    const density = ' .:-=+*#%@';
    let frame = 0;
    let animationId: number;

    const draw = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const spacing = 6;

      // Add new petal
      const angle = frame * goldenAngle;
      const radius = spacing * Math.sqrt(frame);
      const x = centerX + radius * Math.cos(angle);
      const y = centerY + radius * Math.sin(angle);
      points.push({ x, y, angle });
      frame++;

      const maxPoints = 800;
      if (points.length > maxPoints) {
        points.shift();
      }

      ctx.font = '12px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';

      points.forEach((p, i) => {
        const t = i / points.length;
        const charIndex = Math.floor(t * (density.length - 1));
        const char = density[charIndex];
        ctx.fillStyle = '#333333';

        ctx.fillText(char, p.x, p.y);

        // Petal extending outward
        const petalRadius = 3;
        const px = p.x + Math.cos(p.angle) * petalRadius;
        const py = p.y + Math.sin(p.angle) * petalRadius;
        ctx.fillText(char, px, py);
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height]);

  return (
    <div
      className="flex items-center justify-center bg-[#F0EEE6]"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <canvas ref={canvasRef} width={width} height={height} className="w-full h-full" />
    </div>
  );
};

export default FibonacciSpiralGarden;

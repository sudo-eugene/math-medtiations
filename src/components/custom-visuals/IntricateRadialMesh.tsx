import React, { useEffect, useRef, useState } from 'react';

// Themes: true contentment vs. attachment, value of inner wealth, freedom through acceptance
// Visualization: A radial pattern that finds harmony in simplicity, showing how contentment emerges from accepting what is

const IntricateRadialMesh = () => {
  const [dimensions, setDimensions] = useState({ width: 600, height: 600 });
  const { width, height } = dimensions;
  const radius = Math.min(width, height) * 0.25;
  const numRings = 12;
  const numSegments = 36;
  const animationRef = useRef<number>();
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;

      // Draw rings
      for (let i = 1; i <= numRings; i++) {
        const ringRadius = (radius / numRings) * i;
        ctx.beginPath();
        ctx.arc(centerX, centerY, ringRadius, 0, 2 * Math.PI);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.stroke();
      }

      // Draw segments
      for (let i = 0; i < numSegments; i++) {
        const angle = (i / numSegments) * 2 * Math.PI;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(centerX + Math.cos(angle) * radius, centerY + Math.sin(angle) * radius);
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
        ctx.stroke();
      }

      // Draw weaving pattern
      for (let i = 1; i <= numRings; i++) {
        const ringRadius = (radius / numRings) * i;
        ctx.beginPath();
        for (let j = 0; j <= numSegments; j++) {
          const angle = (j / numSegments) * 2 * Math.PI;
          const offset = Math.sin(time * 0.5 + i * 0.5) * (radius / numRings) * 0.4;
          const currentRadius = ringRadius + offset;

          const x = centerX + Math.cos(angle) * currentRadius;
          const y = centerY + Math.sin(angle) * currentRadius;

          if (j === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
        ctx.stroke();
      }

      time += 0.01;
      animationRef.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, [width, height, radius]);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default IntricateRadialMesh;

import React, { useEffect, useRef } from 'react';

// Themes: inner knowing, direct perception, effortless understanding
// Visualization: A shell pattern that reveals the universe's structure through its simple, repeating forms

const ShellRidgePattern = () => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef<number>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 550;
    const height = 550;
    canvas.width = width;
    canvas.height = height;

    let time = 0;

    const draw = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const centerX = width / 2;
      const centerY = height / 2;
      const maxRadius = Math.min(width, height) * 0.4;

      for (let i = 0; i < 100; i++) {
        const radius = (i / 100) * maxRadius;
        const angle = i * 0.2 + time;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;

        ctx.beginPath();
        ctx.arc(x, y, radius * 0.2, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 + (i / 100) * 0.2})`;
        ctx.stroke();
      }

      time += 0.01;
      animationFrameId.current = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default ShellRidgePattern;

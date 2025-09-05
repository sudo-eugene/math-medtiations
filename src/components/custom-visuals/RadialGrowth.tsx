import React, { useEffect, useRef } from 'react';

// Themes: effortless action, natural development, finding strength in yielding
// Visualization: A radial pattern that grows and unfolds effortlessly, demonstrating how natural development occurs without force

const RadialGrowth = () => {
  const canvasRef = useRef(null);

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

      for (let i = 0; i < 50; i++) {
        const radius = (i / 50) * maxRadius * (Math.sin(time + i * 0.1) * 0.2 + 1);
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        ctx.strokeStyle = `rgba(0, 0, 0, ${0.1 + (i / 50) * 0.2})`;
        ctx.stroke();
      }

      time += 0.01;
      requestAnimationFrame(draw);
    };

    draw();

  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default RadialGrowth;

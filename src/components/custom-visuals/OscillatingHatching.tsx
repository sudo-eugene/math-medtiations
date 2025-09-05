import React, { useEffect, useRef } from 'react';

// Themes: subtle influence, underlying rhythm, harmony in simplicity
// Visualization: A hatching pattern that oscillates with a subtle rhythm, revealing the underlying harmony in simple forms

const OscillatingHatching = () => {
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

      const spacing = 20;
      for (let i = 0; i < width; i += spacing) {
        for (let j = 0; j < height; j += spacing) {
          const angle = Math.sin(i * 0.01 + time) + Math.cos(j * 0.01 + time);
          ctx.beginPath();
          ctx.moveTo(i, j);
          ctx.lineTo(i + Math.cos(angle) * 10, j + Math.sin(angle) * 10);
          ctx.strokeStyle = 'rgba(0, 0, 0, 0.3)';
          ctx.stroke();
        }
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

export default OscillatingHatching;

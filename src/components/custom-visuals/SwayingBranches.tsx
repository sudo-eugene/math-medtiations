import React, { useEffect, useRef } from 'react';

// Themes: simplicity through non-action, natural unfolding, letting things take their course
// Visualization: A tree that grows through simple rules, demonstrating how complexity naturally emerges when we step back and let things develop

const SwayingBranches = () => {
  const canvasRef = React.useRef(null);
  
  React.useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = 550;
    const height = 550;
    canvas.width = width;
    canvas.height = height;

    let time = 0;

    const drawBranch = (x, y, length, angle, depth) => {
      if (depth > 8) return;

      const endX = x + Math.cos(angle) * length;
      const endY = y + Math.sin(angle) * length;

      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(endX, endY);
      ctx.strokeStyle = `rgba(0, 0, 0, ${0.5 - depth * 0.05})`;
      ctx.lineWidth = 10 - depth;
      ctx.stroke();

      const sway = Math.sin(time + depth) * 0.1;
      drawBranch(endX, endY, length * 0.8, angle - 0.3 + sway, depth + 1);
      drawBranch(endX, endY, length * 0.8, angle + 0.3 + sway, depth + 1);
    };

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      drawBranch(width / 2, height, 100, -Math.PI / 2, 0);

      time += 0.02;
      requestAnimationFrame(animate);
    };

    animate();

  }, []);

  return (
    <div style={{ width: '100%', height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} />
    </div>
  );
};

export default SwayingBranches;

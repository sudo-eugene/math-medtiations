import React, { useEffect, useRef } from 'react';

// Themes: harmony in complexity, underlying unity, patterns in chaos
// Visualization: Multiple wave sources interfering to create complex patterns, revealing the underlying unity that governs them

const WaveInterferenceV4 = () => {
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
    const sources = [
      { x: width * 0.2, y: height * 0.2, phase: 0 },
      { x: width * 0.8, y: height * 0.2, phase: Math.PI },
      { x: width * 0.5, y: height * 0.8, phase: Math.PI / 2 },
    ];

    const draw = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let x = 0; x < width; x++) {
        for (let y = 0; y < height; y++) {
          let value = 0;
          sources.forEach(source => {
            const dx = x - source.x;
            const dy = y - source.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            value += Math.sin(dist * 0.1 - time + source.phase);
          });

          const color = (value + sources.length) / (sources.length * 2) * 255;
          const index = (y * width + x) * 4;
          data[index] = color;
          data[index + 1] = color;
          data[index + 2] = color;
          data[index + 3] = 255;
        }
      }

      ctx.putImageData(imageData, 0, 0);

      time += 0.05;
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

export default WaveInterferenceV4;

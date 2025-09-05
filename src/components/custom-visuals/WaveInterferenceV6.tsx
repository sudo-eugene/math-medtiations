import React, { useEffect, useRef } from 'react';

// themes: profound watchfulness, remaining still, presence in the moment
// visualization: Waves ripple outward from still points, creating patterns of watchful awareness

const WaveInterferenceV6 = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const width = 550;
    const height = 550;
    canvas.width = width;
    canvas.height = height;

    // Higher resolution for finer detail
    const resolution = 2;
    const gridWidth = Math.floor(width / resolution);
    const gridHeight = Math.floor(height / resolution);

    // Define still points of watchful awareness
    const sources = [
      { x: width/2, y: height/2 },
      { x: width/4, y: height/4 },
      { x: 3*width/4, y: height/4 },
      { x: width/4, y: 3*height/4 },
      { x: 3*width/4, y: 3*height/4 },
    ];

    const wavelength = 35; // Longer wavelength for gentler waves
    let time = 0;
    
    // Pre-create canvas for offscreen rendering
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = gridWidth;
    offscreenCanvas.height = gridHeight;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    
    // Pre-calculate constants
    const twoPI = Math.PI * 2;
    const waveConstant = twoPI / wavelength;

    let animationFrameId = null;
    
    const animate = () => {
      // Clear with background color
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      // Work on lower resolution grid
      const imageData = offscreenCtx.createImageData(gridWidth, gridHeight);
      const data = imageData.data;

      // Calculate ripples of presence emanating from stillness
      for (let y = 0; y < gridHeight; y++) {
        for (let x = 0; x < gridWidth; x++) {
          const pixelX = x * resolution + resolution/2;
          const pixelY = y * resolution + resolution/2;
          let amplitude = 0;

          // Unrolled loop for better performance
          for (let i = 0; i < sources.length; i++) {
            const dx = pixelX - sources[i].x;
            const dy = pixelY - sources[i].y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            amplitude += Math.sin(distance * waveConstant - time * twoPI);
          }

          // More subtle threshold with gradient
          const index = (y * gridWidth + x) * 4;
          const threshold = Math.abs(amplitude);
          if (threshold < 0.6) {
            // Lighter gray lines with variable opacity
            const opacity = (0.6 - threshold) * 0.4 * 255; // More transparent
            data[index] = 160;     // Lighter gray
            data[index + 1] = 160;
            data[index + 2] = 160;
            data[index + 3] = opacity;
          } else {
            // Background color
            data[index] = 240;
            data[index + 1] = 238;
            data[index + 2] = 230;
            data[index + 3] = 255;
          }
        }
      }

      // Draw to offscreen canvas
      offscreenCtx.putImageData(imageData, 0, 0);
      
      // Scale up to main canvas
      ctx.imageSmoothingEnabled = false;
      ctx.drawImage(offscreenCanvas, 0, 0, width, height);

      time += 0.0008; // Even slower for more graceful movement
      animationFrameId = requestAnimationFrame(animate);
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (offscreenCanvas) {
        offscreenCanvas.width = 0;
        offscreenCanvas.height = 0;
      }
    };
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      width: '100%', 
      height: '100%', 
      backgroundColor: '#F0EEE6' 
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '550px',
          height: '550px'
        }} 
      />
    </div>
  );
};

export default WaveInterferenceV6;

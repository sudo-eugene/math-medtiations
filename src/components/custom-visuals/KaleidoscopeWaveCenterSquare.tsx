import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: emergence from emptiness, form from formless, essence within
// visualization: Patterns emerge from an empty center, revealing the essence that gives rise to all form

const KaleidoscopeWaveCenterSquare: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    
    let time = 0;
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    
    // Create an off-screen canvas for the segment
    const segmentCanvas = document.createElement('canvas');
    const segmentCtx = segmentCanvas.getContext('2d');
    segmentCanvas.width = canvas.width;
    segmentCanvas.height = canvas.height;
    
    let animationFrameId;
    
    const animate = () => {
      time += 0.007;
      
      // Clear the main canvas
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear the segment canvas
      segmentCtx.clearRect(0, 0, segmentCanvas.width, segmentCanvas.height);
      
      // Create pattern emerging from the formless center
      const resolution = 2;
      const squareSize = 200;
      const squareX = centerX - squareSize/2;
      const squareY = centerY - squareSize/2;
      
      for (let x = squareX; x < squareX + squareSize; x += resolution) {
        for (let y = squareY; y < squareY + squareSize; y += resolution) {
          // Convert to polar coordinates relative to center
          const dx = x - centerX;
          const dy = y - centerY;
          const r = Math.sqrt(dx * dx + dy * dy);
          const theta = Math.atan2(dy, dx);
          
          // Essence manifests through multiple waves
          let wave1 = Math.sin(r * 0.1 - time);  // Halved from time * 2
          let wave2 = Math.cos(theta * 8 + time * 0.5);  // Halved from time
          let wave3 = Math.sin((r - theta * 100) * 0.05 + time * 1.5);  // Halved from time * 3
          
          // Combine waves
          let value = (wave1 + wave2 + wave3) / 3;
          
          // Add some noise for texture
          value += (Math.random() - 0.5) * 0.2;
          
          // Map to opacity
          const opacity = Math.abs(value) * 0.8;
          
          segmentCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
          segmentCtx.fillRect(x, y, resolution, resolution);
        }
      }
      
      // Create kaleidoscope effect
      const numSegments = 8;
      for (let i = 0; i < numSegments; i++) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate((i * Math.PI * 2) / numSegments);
        
        if (i % 2 === 1) {
          ctx.scale(1, -1);
        }
        
        ctx.translate(-centerX, -centerY);
        ctx.drawImage(segmentCanvas, 0, 0);
        ctx.restore();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      
      // Clear both canvas contexts
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      if (segmentCtx) {
        segmentCtx.clearRect(0, 0, segmentCanvas.width, segmentCanvas.height);
      }
      
      // Reset canvas dimensions to free memory
      segmentCanvas.width = 0;
      segmentCanvas.height = 0;
    };
  }, [width, height]);

  return (
    <div style={{ 
      width: `${width}px`, 
      height: `${height}px`, 
      backgroundColor: '#F0EEE6' 
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default KaleidoscopeWaveCenterSquare;

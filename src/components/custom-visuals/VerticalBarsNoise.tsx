import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: power of softness, water's way, universal truth
// Visualization: Bars that yield and flow like water, demonstrating how gentleness overcomes the rigid

const VerticalBarsNoise: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  const timeRef = useRef(0);
  const animationFrameId = useRef(null);

  // Simple noise function
  const noise = (x, y, t) => {
    const n = Math.sin(x * 0.01 + t) * Math.cos(y * 0.01 + t) + 
             Math.sin(x * 0.015 - t) * Math.cos(y * 0.005 + t);
    return (n + 1) / 2;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    
    const numLines = 50;
    const lineSpacing = canvas.height / numLines;
    
    const animate = () => {
      timeRef.current += 0.0005; // Reduced from 0.001 to 0.0005
      
      // Clear canvas
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw lines and noise-based bars
      for (let i = 0; i < numLines; i++) {
        const y = i * lineSpacing + lineSpacing / 2;
        
        // Draw horizontal line
        ctx.beginPath();
        ctx.strokeStyle = '#444';
        ctx.lineWidth = 1;
        ctx.moveTo(0, y);
        ctx.lineTo(canvas.width, y);
        ctx.stroke();
        
        // Draw bars based on noise
        for (let x = 0; x < canvas.width; x += 8) {
          const noiseVal = noise(x, y, timeRef.current);
          
          if (noiseVal > 0.5) {
            const barWidth = 3 + noiseVal * 10;
            const barHeight = 2 + noiseVal * 3;
            const animatedX = x + Math.sin(timeRef.current + y * 0.0375) * 20 * noiseVal; // Halved wave frequency for smoother movement
            
            // Use solid black color without opacity variation
            ctx.fillStyle = '#000000';
            ctx.fillRect(animatedX - barWidth/2, y - barHeight/2, barWidth, barHeight);
          }
        }
      }
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, backgroundColor: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ display: 'block' }} />
    </div>
  );
};

export default VerticalBarsNoise;
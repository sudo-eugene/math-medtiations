import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: inexhaustible source, smoothing complexity, effortless flow
// visualization: Vertical patterns that endlessly transform, showing how complexity resolves into fluid motion

const ScrollingVerticalBars: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  const scrollPositionRef = useRef(0);
  const animationFrameId = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    
    const numLines = 60;
    const lineSpacing = canvas.width / numLines;
    
    // Create two different patterns - complexity arising from the inexhaustible source
    const createPattern = (offset) => {
      const pattern = [];
      for (let i = 0; i < numLines; i++) {
        const bars = [];
        const numBars = 10 + Math.sin(i * 0.3 + offset) * 5;
        
        for (let j = 0; j < numBars; j++) {
          bars.push({
            y: (j / numBars) * canvas.height + Math.sin(i * 0.5 + j * 0.3 + offset) * 30,
            height: 5 + Math.sin(i * 0.2 + j * 0.4) * 3,
            width: 2 + Math.cos(i * 0.3) * 2
          });
        }
        pattern.push(bars);
      }
      return pattern;
    };
    
    const pattern1 = createPattern(0);
    const pattern2 = createPattern(Math.PI);
    
    const animate = () => {
      
      scrollPositionRef.current += 0.0025;
      const scrollFactor = (Math.sin(scrollPositionRef.current) + 1) / 2;
      
      // Clear canvas
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw lines and interpolated bars - smoothing sharp edges into gentle flow
      for (let i = 0; i < numLines; i++) {
        const x = i * lineSpacing + lineSpacing / 2;
        
        // Draw vertical line
        ctx.beginPath();
        ctx.strokeStyle = '#666';
        ctx.lineWidth = 1;
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
        
        // Interpolate between patterns - effortless transformation
        const bars1 = pattern1[i];
        const bars2 = pattern2[i];
        const maxBars = Math.max(bars1.length, bars2.length);
        
        for (let j = 0; j < maxBars; j++) {
          const bar1 = bars1[j] || bars2[j];
          const bar2 = bars2[j] || bars1[j];
          
          const y = bar1.y + (bar2.y - bar1.y) * scrollFactor;
          const height = bar1.height + (bar2.height - bar1.height) * scrollFactor;
          const width = bar1.width + (bar2.width - bar1.width) * scrollFactor;
          
          ctx.fillStyle = '#222';
          ctx.fillRect(x - width/2, y - height/2, width, height);
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

export default ScrollingVerticalBars;

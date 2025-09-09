import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: leadership through non-control, natural organization, peace through letting go
// Visualization: Circles that organize themselves into complex patterns, demonstrating how order emerges without force

const MoireMandalaPattern: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    
    const drawPattern = (time = 0) => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.6;
      
      // Center of the canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Each layer finds its natural place in the whole
      const layers = [
        { count: 1, radius: 0, circleSize: 60 },        // The still center
        { count: 6, radius: 60, circleSize: 60 },       // First emanation
        { count: 12, radius: 110, circleSize: 50 },     // Growing outward
        { count: 18, radius: 160, circleSize: 45 },     // Expanding freely
        { count: 24, radius: 205, circleSize: 40 }      // Reaching completion
      ];
      
      layers.forEach((layer, layerIndex) => {
        for (let i = 0; i < layer.count; i++) {
          const angle = (i / layer.count) * Math.PI * 2;
          
          // Add subtle animation
          const breathingEffect = Math.sin(time * 0.0015 + layerIndex * 0.5) * 2;  // Halved speed
          const rotation = time * 0.00025 * (layerIndex % 2 === 0 ? 1 : -1);  // Halved speed
          
          // Position each circle
          const circleX = centerX + Math.cos(angle + rotation) * layer.radius;
          const circleY = centerY + Math.sin(angle + rotation) * layer.radius;
          
          // Draw concentric circles for each position
          for (let r = 3; r < layer.circleSize; r += 3) {
            ctx.beginPath();
            
            // Subtle distortion for moiré effect
            for (let theta = 0; theta <= Math.PI * 2; theta += 0.1) {
              const distortion = Math.sin(theta * 8 + time * 0.0025 + angle) * (r * 0.01);  // Halved speed
              const x = circleX + (r + distortion + breathingEffect) * Math.cos(theta);
              const y = circleY + (r + distortion + breathingEffect) * Math.sin(theta);
              
              if (theta === 0) {
                ctx.moveTo(x, y);
              } else {
                ctx.lineTo(x, y);
              }
            }
            
            ctx.closePath();
            ctx.stroke();
          }
        }
      });
      
      // Add a central decorative pattern
      const centralSize = 80;
      for (let r = 3; r < centralSize; r += 3) {
        ctx.beginPath();
        
        for (let theta = 0; theta <= Math.PI * 2; theta += 0.05) {
          const distortion = Math.sin(theta * 6 + time * 0.0025) * (r * 0.015);  // Halved speed
          const breathing = Math.sin(time * 0.002) * 1.5;  // Halved speed
          
          const x = centerX + (r + distortion + breathing) * Math.cos(theta);
          const y = centerY + (r + distortion + breathing) * Math.sin(theta);
          
          if (theta === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        ctx.stroke();
      }
      
      animationFrameId.current = requestAnimationFrame(() => drawPattern(time + 1));
    };
    
    drawPattern();

    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      
      // Clear canvas context
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Reset animation frame ref
      animationFrameId.current = null;
    };

  }, [width, height]);
  
  return (
    <div 
      className="flex justify-center items-center bg-[#F0EEE6]"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
        className="shadow-lg"
      />
    </div>
  );
};

export default MoireMandalaPattern;

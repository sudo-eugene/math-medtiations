import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: contentment in simplicity, community wisdom, natural satisfaction
// Visualization: Circles that create complex patterns through simple overlapping, showing beauty in basic forms

const MoireSixCircles: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    // Set initial size
    canvas.width = width;
    canvas.height = height;
    
    const drawPattern = (time = 0) => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = '#000';
      ctx.lineWidth = 0.8;
      
      // Center of the canvas
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Create six circles in a circular arrangement
      const numClusters = 6;
      // Scale radius based on canvas size
      const radius = Math.min(canvas.width, canvas.height) * 0.18;
      
      for (let i = 0; i < numClusters; i++) {
        const angle = (i / numClusters) * Math.PI * 2;
        
        // Enhanced oscillation for more noticeable animation
        const oscillation = Math.sin(time * 0.005 + angle) * (radius * 0.25);
        const pulseEffect = Math.sin(time * 0.003) * (radius * 0.05);
        
        // Position each circle around the center with animation
        const circleX = centerX + Math.cos(angle) * (radius + oscillation);
        const circleY = centerY + Math.sin(angle) * (radius + oscillation);
        
        // Draw concentric circles for each position
        const maxRadius = radius * 0.9;
        for (let r = 5; r < maxRadius; r += maxRadius / 25) {
          ctx.beginPath();
          
          // Enhanced distortion for more visible animation
          for (let theta = 0; theta <= Math.PI * 2; theta += 0.05) {
            const waveDistortion = Math.sin(theta * 6 + time * 0.01 + angle) * (r * 0.03);
            const radiusDistortion = Math.sin(time * 0.005 + r * 0.1) * 2;
            
            const x = circleX + (r + waveDistortion + radiusDistortion + pulseEffect) * Math.cos(theta);
            const y = circleY + (r + waveDistortion + radiusDistortion + pulseEffect) * Math.sin(theta);
            
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
    };
    
    // Animation loop
    let time = 0;
    let animationFrameId;
    
    const animate = () => {
      time += 1;
      drawPattern(time);
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height]);
  
  return (
    <div 
      style={{ 
        margin: 0,
        background: '#F0EEE6',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        height: `${height}px`,
        width: `${width}px`,
        position: 'relative'
      }}
    >
      <canvas 
        ref={canvasRef} 
        width={width}
        height={height}
        style={{ 
          display: 'block',
          width: `${width}px`,
          height: `${height}px`
        }} 
      />
    </div>
  );
};

export default MoireSixCircles;
import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: silent leadership, trust in the team, working unseen
// visualization: Each segment silently guides the others, creating harmony through invisible influence

const KaleidoscopeVariation3: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  const animationFrameId = useRef<number>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    // Set higher DPI for sharper rendering
    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    ctx.scale(dpr, dpr);
    
    let time = 0;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create an off-screen canvas for the segment
    const segmentCanvas = document.createElement('canvas');
    const segmentCtx = segmentCanvas.getContext('2d');
    segmentCanvas.width = canvas.width;
    segmentCanvas.height = canvas.height;
    
    const animate = () => {
      time += 0.005;
      
      // Clear the main canvas
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear the segment canvas
      segmentCtx.clearRect(0, 0, segmentCanvas.width, segmentCanvas.height);
      
      // Create pattern - silent influence rippling outward
      const resolution = 1;
      for (let x = 0; x < centerX + 250; x += resolution) {
        for (let y = 0; y < centerY + 250; y += resolution) {
          // Convert to polar coordinates
          const dx = x - centerX;
          const dy = y - centerY;
          const r = Math.sqrt(dx * dx + dy * dy);
          const theta = Math.atan2(dy, dx);
          
          // Only draw in the 45-degree segment with rounded corners
          if (theta >= 0 && theta <= Math.PI / 4 && r < 250) {
            // Add rounded corners by fading out near the edges
            const cornerRadius = 20;
            const edgeDistance = Math.min(
              250 - r, // Distance from outer edge
              r * Math.abs(Math.PI/4 - theta) * 2.5 // Distance from angle edges
            );
            const edgeFade = Math.min(1, edgeDistance / cornerRadius);

            // Multiple wave sources
            let wave1 = Math.sin(r * 0.1 - time * 2);
            let wave2 = Math.cos(theta * 8 + time);
            let wave3 = Math.sin((r - theta * 100) * 0.05 + time * 3);
            
            // Combine waves
            let value = (wave1 + wave2 + wave3) / 3;
            
            // Add some noise for texture
            value += (Math.random() - 0.5) * 0.2;
            
            // Map to opacity, incorporating edge fade
            const opacity = Math.abs(value) * 0.8 * edgeFade;
            
            segmentCtx.fillStyle = `rgba(0, 0, 0, ${opacity})`;
            segmentCtx.fillRect(x, y, resolution, resolution);
          }
        }
      }
      
      // Create kaleidoscope - each segment trusting and following the others
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
      
      animationFrameId.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameId.current) {
        cancelAnimationFrame(animationFrameId.current);
      }
      if (segmentCanvas) {
        segmentCanvas.width = 0;
        segmentCanvas.height = 0;
      }
    };
  }, [width, height]);

  return (
    <div style={{ 
      width: `${width}px`,
      height: `${height}px`,
      margin: 0,
      background: '#F0EEE6',
      overflow: 'hidden',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ backgroundColor: '#F0EEE6', borderRadius: '8px' }} />
    </div>
  );
};

export default KaleidoscopeVariation3;

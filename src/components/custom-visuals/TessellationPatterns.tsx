import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: duality of opposites, quiet example, cycles of creation/dissolution
// visualization: Geometric patterns that emerge and dissolve naturally, illustrating how opposites define and transform each other

const TessellationPatterns: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    
    let time = 0;
    const SCALE = 60;
    let animationFrameId = null;
    
    // Draw hexagonal tile - where elegance emerges from simple geometry
    function drawTile(cx, cy, size, rotation, phase, morph) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(rotation);
      
      // Draw outer hexagon - the form that contains opposites
      ctx.beginPath();
      const points = 6;
      for (let i = 0; i <= points; i++) {
        const angle = (i / points) * Math.PI * 2;
        const r = size * (1 + Math.sin(phase + i) * 0.1);
        const x = Math.cos(angle) * r;
        const y = Math.sin(angle) * r;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = 'rgba(51, 51, 51, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Draw internal structure - the quiet example within
      for (let i = 0; i < points; i += 2) {
        const angle1 = (i / points) * Math.PI * 2;
        const angle2 = ((i + 2) / points) * Math.PI * 2;
        const r1 = size * (1 + Math.sin(phase + i) * 0.1);
        const r2 = size * (1 + Math.sin(phase + i + 2) * 0.1);
        
        // Outer points
        const x1 = Math.cos(angle1) * r1;
        const y1 = Math.sin(angle1) * r1;
        const x2 = Math.cos(angle2) * r2;
        const y2 = Math.sin(angle2) * r2;
        
        // Inner point with morph
        const midAngle = (angle1 + angle2) / 2;
        const innerR = size * 0.5 * (1 + morph * 0.5);
        const xi = Math.cos(midAngle) * innerR;
        const yi = Math.sin(midAngle) * innerR;
        
        // Draw connection lines
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(xi, yi);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.moveTo(x2, y2);
        ctx.lineTo(xi, yi);
        ctx.stroke();
      }
      
      ctx.restore();
    }
    
    // Create hexagonal grid - a field where creation and dissolution dance
    function createTessellationField(offsetX, offsetY, fieldScale, timeOffset) {
      const gridSize = 4;
      const spacing = SCALE * fieldScale * 0.8;
      
      for (let row = -gridSize; row <= gridSize; row++) {
        const rowOffset = (row % 2) * spacing * 0.5;
        for (let col = -gridSize; col <= gridSize; col++) {
          const x = (col * spacing * 0.866) + rowOffset + offsetX;
          const y = row * spacing * 0.75 + offsetY;
          const dist = Math.sqrt(x * x + y * y);
          
          // Skip tiles that are too far from center
          if (dist > SCALE * fieldScale * 2.5) continue;
          
          // Calculate tile properties
          const angle = Math.atan2(y - offsetY, x - offsetX);
          const phase = (time + timeOffset) + dist * 0.01;
          const morph = Math.sin(phase + angle) * 0.5 + 0.5;
          
          drawTile(
            width/2 + x,
            height/2 + y,
            SCALE * fieldScale * 0.4 * (1 - dist/(SCALE * fieldScale * 3) * 0.3),
            angle + (time + timeOffset) * 0.2,
            phase,
            morph
          );
        }
      }
    }
    
    // The eternal cycle of creation and letting go
    function animate() {
      
      time += 0.01;
      
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      // Main tessellation field
      createTessellationField(0, 0, 1.5, 0);
      
      // Upper field with rotation
      ctx.save();
      ctx.translate(width/2, height/2);
      ctx.rotate(Math.PI/6);
      ctx.translate(-width/2, -height/2);
      createTessellationField(0, -100, 0.8, time * 0.2 + Math.PI/3);
      ctx.restore();
      
      // Lower field with rotation
      ctx.save();
      ctx.translate(width/2, height/2);
      ctx.rotate(-Math.PI/6);
      ctx.translate(-width/2, -height/2);
      createTessellationField(0, 100, 0.8, time * 0.2 - Math.PI/3);
      ctx.restore();
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
    };
  }, [width, height]);
  
  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      margin: 'auto',
      backgroundColor: '#F0EEE6',
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
        }}
      />
    </div>
  );
};

export default TessellationPatterns;

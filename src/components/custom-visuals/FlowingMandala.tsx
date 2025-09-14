import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: sacred geometry in motion, eternal patterns, centered awareness
// visualization: Traditional mandala patterns that flow and transform, representing the dynamic nature of consciousness

const FlowingMandala: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;
    
    let time = 0;
    let animationId;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.4;
    
    const drawMandalaLayer = (radius, segments, rotation, opacity, lineWidth) => {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      
      ctx.strokeStyle = `rgba(60, 60, 60, ${opacity})`;
      ctx.lineWidth = lineWidth;
      
      // Outer circle
      ctx.beginPath();
      ctx.arc(0, 0, radius, 0, Math.PI * 2);
      ctx.stroke();
      
      // Radiating lines
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * radius, Math.sin(angle) * radius);
        ctx.stroke();
      }
      
      // Petal patterns
      for (let i = 0; i < segments; i++) {
        const angle = (i / segments) * Math.PI * 2;
        const petalRadius = radius * 0.3;
        const x = Math.cos(angle) * radius * 0.7;
        const y = Math.sin(angle) * radius * 0.7;
        
        ctx.beginPath();
        ctx.arc(x, y, petalRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner petal detail
        ctx.beginPath();
        for (let j = 0; j < 6; j++) {
          const pettalAngle = (j / 6) * Math.PI * 2;
          const px = x + Math.cos(pettalAngle) * petalRadius * 0.5;
          const py = y + Math.sin(pettalAngle) * petalRadius * 0.5;
          if (j === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        ctx.stroke();
      }
      
      ctx.restore();
    };
    
    const drawFlowingPatterns = () => {
      // Flowing connecting curves between layers
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.15)';
      ctx.lineWidth = 1;
      
      const numCurves = 12;
      for (let i = 0; i < numCurves; i++) {
        const angle1 = (i / numCurves) * Math.PI * 2 + time * 0.01;
        const angle2 = angle1 + Math.PI / 6;
        
        const r1 = maxRadius * 0.3;
        const r2 = maxRadius * 0.8;
        
        const x1 = centerX + Math.cos(angle1) * r1;
        const y1 = centerY + Math.sin(angle1) * r1;
        const x2 = centerX + Math.cos(angle2) * r2;
        const y2 = centerY + Math.sin(angle2) * r2;
        
        const cpx = centerX + Math.cos((angle1 + angle2) / 2) * maxRadius * 0.6;
        const cpy = centerY + Math.sin((angle1 + angle2) / 2) * maxRadius * 0.6;
        
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.quadraticCurveTo(cpx, cpy, x2, y2);
        ctx.stroke();
      }
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Draw flowing background patterns
      drawFlowingPatterns();
      
      // Multiple mandala layers with different rotations and scales
      drawMandalaLayer(maxRadius * 0.9, 12, time * 0.005, 0.4, 1.5);
      drawMandalaLayer(maxRadius * 0.7, 8, -time * 0.008, 0.5, 1.2);
      drawMandalaLayer(maxRadius * 0.5, 6, time * 0.012, 0.6, 1.0);
      drawMandalaLayer(maxRadius * 0.3, 4, -time * 0.015, 0.7, 0.8);
      
      // Central flowing pattern
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.02);
      
      const innerRadius = maxRadius * 0.15;
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.8)';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const waveRadius = innerRadius + Math.sin(time * 0.03 + i) * 10;
        
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * waveRadius, Math.sin(angle) * waveRadius);
        ctx.stroke();
      }
      
      ctx.restore();
      
      // Central meditation point
      const pulseSize = 6 + Math.sin(time * 0.04) * 2;
      ctx.fillStyle = 'rgba(70, 70, 70, 0.9)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [width, height]);
  
  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: '#F0EEE6',
      overflow: 'hidden'
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default FlowingMandala;

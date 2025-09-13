import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: platonic solids breathing, geometry as living consciousness, sacred forms in motion
// visualization: Sacred geometric shapes that pulse and breathe as if alive, showing mathematics as living consciousness

const LivingGeometry: React.FC<VisualProps> = ({ width, height }) => {
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
    
    class LivingShape {
      constructor(type, x, y, baseSize, breathingRate) {
        this.type = type; // 'triangle', 'square', 'pentagon', 'hexagon', 'circle'
        this.x = x;
        this.y = y;
        this.baseSize = baseSize;
        this.breathingRate = breathingRate;
        this.phase = Math.random() * Math.PI * 2;
        this.rotation = 0;
        this.rotationSpeed = 0.005 + Math.random() * 0.01;
      }
      
      update(time) {
        this.rotation += this.rotationSpeed;
        // Each shape breathes at its own rate
        this.currentSize = this.baseSize * (1 + Math.sin(time * this.breathingRate + this.phase) * 0.3);
      }
      
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const alpha = 0.4 + Math.sin(time * 0.02 + this.phase) * 0.2;
        ctx.strokeStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        
        if (this.type === 'circle') {
          ctx.arc(0, 0, this.currentSize, 0, Math.PI * 2);
        } else {
          const sides = this.type === 'triangle' ? 3 : 
                      this.type === 'square' ? 4 : 
                      this.type === 'pentagon' ? 5 : 6;
          
          for (let i = 0; i <= sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            const x = Math.cos(angle) * this.currentSize;
            const y = Math.sin(angle) * this.currentSize;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
        
        // Inner energy lines
        if (this.type !== 'circle') {
          ctx.strokeStyle = `rgba(80, 80, 80, ${alpha * 0.3})`;
          ctx.lineWidth = 0.8;
          
          const sides = this.type === 'triangle' ? 3 : 
                      this.type === 'square' ? 4 : 
                      this.type === 'pentagon' ? 5 : 6;
          
          for (let i = 0; i < sides; i++) {
            const angle = (i / sides) * Math.PI * 2;
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(Math.cos(angle) * this.currentSize * 0.7, 
                      Math.sin(angle) * this.currentSize * 0.7);
            ctx.stroke();
          }
        }
        
        ctx.restore();
      }
    }
    
    // Create living shapes in sacred arrangement
    const shapes = [];
    
    // Center circle
    shapes.push(new LivingShape('circle', centerX, centerY, 40, 0.02));
    
    // Ring of triangles
    for (let i = 0; i < 3; i++) {
      const angle = (i / 3) * Math.PI * 2;
      const radius = 80;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      shapes.push(new LivingShape('triangle', x, y, 25, 0.025));
    }
    
    // Ring of squares
    for (let i = 0; i < 4; i++) {
      const angle = (i / 4) * Math.PI * 2 + Math.PI / 4;
      const radius = 120;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      shapes.push(new LivingShape('square', x, y, 20, 0.03));
    }
    
    // Ring of pentagons
    for (let i = 0; i < 5; i++) {
      const angle = (i / 5) * Math.PI * 2;
      const radius = 160;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      shapes.push(new LivingShape('pentagon', x, y, 18, 0.035));
    }
    
    // Ring of hexagons
    for (let i = 0; i < 6; i++) {
      const angle = (i / 6) * Math.PI * 2 + Math.PI / 6;
      const radius = 200;
      const x = centerX + Math.cos(angle) * radius;
      const y = centerY + Math.sin(angle) * radius;
      shapes.push(new LivingShape('hexagon', x, y, 15, 0.04));
    }
    
    const drawConnections = () => {
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.1)';
      ctx.lineWidth = 0.5;
      
      // Connect center to all others
      const centerShape = shapes[0];
      for (let i = 1; i < shapes.length; i++) {
        const shape = shapes[i];
        const breathe = Math.sin(time * 0.015 + i) * 0.3 + 0.7;
        
        ctx.globalAlpha = breathe * 0.2;
        ctx.beginPath();
        ctx.moveTo(centerShape.x, centerShape.y);
        ctx.lineTo(shape.x, shape.y);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Draw breathing connections
      drawConnections();
      
      // Update and draw all shapes
      shapes.forEach(shape => {
        shape.update(time);
        shape.draw(ctx);
      });
      
      // Draw pulsing energy field
      ctx.save();
      ctx.translate(centerX, centerY);
      
      const fieldRadius = 250 + Math.sin(time * 0.01) * 30;
      const gradient = ctx.createRadialGradient(0, 0, 0, 0, 0, fieldRadius);
      gradient.addColorStop(0, 'rgba(60, 60, 60, 0)');
      gradient.addColorStop(0.7, 'rgba(60, 60, 60, 0.05)');
      gradient.addColorStop(1, 'rgba(60, 60, 60, 0)');
      
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(0, 0, fieldRadius, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.restore();
      
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

export default LivingGeometry;

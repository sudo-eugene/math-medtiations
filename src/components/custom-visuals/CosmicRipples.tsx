import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: interconnectedness, ripple effects of consciousness, universal resonance
// visualization: Expanding circles create interference patterns, showing how every action ripples through the cosmos

const CosmicRipples: React.FC<VisualProps> = ({ width, height }) => {
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
    let ripples = [];
    
    class CosmicRipple {
      constructor(x, y, birthTime) {
        this.x = x;
        this.y = y;
        this.birthTime = birthTime;
        this.maxRadius = Math.min(width, height) * 0.6;
        this.speed = 0.8;
        this.frequency = 0.05 + Math.random() * 0.03;
        this.amplitude = 15 + Math.random() * 10;
        this.phase = Math.random() * Math.PI * 2;
        this.lifespan = this.maxRadius / this.speed;
      }
      
      update(currentTime) {
        this.age = currentTime - this.birthTime;
        this.radius = this.age * this.speed;
      }
      
      draw(ctx) {
        if (this.age < 0 || this.radius > this.maxRadius) return;
        
        const alpha = Math.max(0, 1 - (this.radius / this.maxRadius));
        const numPoints = 60;
        
        ctx.beginPath();
        for (let i = 0; i <= numPoints; i++) {
          const angle = (i / numPoints) * Math.PI * 2;
          const distortion = Math.sin(angle * 8 + time * 0.02 + this.phase) * this.amplitude * (alpha * 0.3);
          const rippleRadius = this.radius + distortion;
          
          const x = this.x + Math.cos(angle) * rippleRadius;
          const y = this.y + Math.sin(angle) * rippleRadius;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = `rgba(60, 60, 60, ${alpha * 0.4})`;
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // Inner interference pattern
        if (this.radius > 50) {
          ctx.beginPath();
          for (let i = 0; i <= numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const innerDistortion = Math.sin(angle * 12 - time * 0.03 + this.phase) * this.amplitude * 0.2;
            const innerRadius = this.radius * 0.6 + innerDistortion;
            
            const x = this.x + Math.cos(angle) * innerRadius;
            const y = this.y + Math.sin(angle) * innerRadius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          
          ctx.strokeStyle = `rgba(80, 80, 80, ${alpha * 0.2})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
      
      isDead() {
        return this.radius > this.maxRadius;
      }
    }
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Spawn new ripples at sacred geometry points
      if (Math.random() < 0.03) {
        const centerX = width / 2;
        const centerY = height / 2;
        const angle = (time * 0.01) % (Math.PI * 2);
        const radius = 80 + Math.sin(time * 0.005) * 40;
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        ripples.push(new CosmicRipple(x, y, time));
      }
      
      // Update and draw ripples
      ripples.forEach(ripple => {
        ripple.update(time);
        ripple.draw(ctx);
      });
      
      // Remove dead ripples
      ripples = ripples.filter(ripple => !ripple.isDead());
      
      // Draw interference patterns between nearby ripples
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < ripples.length; i++) {
        for (let j = i + 1; j < ripples.length; j++) {
          const r1 = ripples[i];
          const r2 = ripples[j];
          const dist = Math.sqrt((r1.x - r2.x) ** 2 + (r1.y - r2.y) ** 2);
          
          if (dist < 200 && Math.abs(r1.radius - r2.radius) < 50) {
            const midX = (r1.x + r2.x) / 2;
            const midY = (r1.y + r2.y) / 2;
            
            ctx.beginPath();
            ctx.arc(midX, midY, 3, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      
      // Central meditation point
      const centerX = width / 2;
      const centerY = height / 2;
      const pulseSize = 8 + Math.sin(time * 0.05) * 3;
      
      ctx.fillStyle = 'rgba(70, 70, 70, 0.6)';
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
      ripples = [];
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
      overflow: 'hidden',
      borderRadius: '8px'
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default CosmicRipples;

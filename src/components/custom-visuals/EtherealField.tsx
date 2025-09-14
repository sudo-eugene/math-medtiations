import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: invisible forces made visible, field of consciousness, energy patterns in space
// visualization: Particles respond to invisible field forces, revealing the hidden architecture of awareness

const EtherealField: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  const particlesRef = useRef([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    
    const PARTICLE_COUNT = 8000;
    let time = 0;
    let fieldCenters = [];
    
    class FieldParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.vx = 0;
        this.vy = 0;
        this.size = 0.4 + Math.random() * 0.8;
        this.opacity = 0.3 + Math.random() * 0.4;
        this.sensitivity = 0.5 + Math.random() * 0.5;
        this.phase = Math.random() * Math.PI * 2;
      }
      
      update(time, fieldCenters) {
        // Apply field forces
        let forceX = 0;
        let forceY = 0;
        
        fieldCenters.forEach(field => {
          const dx = field.x - this.x;
          const dy = field.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 0 && dist < field.radius) {
            const strength = field.strength * (1 - dist / field.radius);
            const angle = Math.atan2(dy, dx);
            
            if (field.type === 'attract') {
              forceX += Math.cos(angle) * strength * this.sensitivity;
              forceY += Math.sin(angle) * strength * this.sensitivity;
            } else {
              forceX -= Math.cos(angle) * strength * this.sensitivity;
              forceY -= Math.sin(angle) * strength * this.sensitivity;
            }
          }
        });
        
        // Add swirling motion
        const swirl = Math.sin(time * 0.01 + this.phase) * 0.1;
        forceX += Math.cos(this.phase + time * 0.005) * swirl;
        forceY += Math.sin(this.phase + time * 0.005) * swirl;
        
        // Update velocity and position
        this.vx = (this.vx + forceX) * 0.95; // Damping
        this.vy = (this.vy + forceY) * 0.95;
        
        this.x += this.vx;
        this.y += this.vy;
        
        // Wrap around edges
        if (this.x < 0) this.x = width;
        if (this.x > width) this.x = 0;
        if (this.y < 0) this.y = height;
        if (this.y > height) this.y = 0;
        
        // Update opacity based on field proximity
        let fieldInfluence = 0;
        fieldCenters.forEach(field => {
          const dx = field.x - this.x;
          const dy = field.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < field.radius) {
            fieldInfluence += (1 - dist / field.radius) * 0.3;
          }
        });
        
        this.currentOpacity = this.opacity + fieldInfluence;
      }
      
      draw(ctx) {
        const alpha = Math.min(1, this.currentOpacity);
        ctx.fillStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Initialize particles
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new FieldParticle());
    }
    particlesRef.current = particles;
    
    // Initialize field centers
    fieldCenters = [
      { x: width * 0.3, y: height * 0.3, radius: 120, strength: 0.02, type: 'attract' },
      { x: width * 0.7, y: height * 0.7, radius: 150, strength: 0.015, type: 'repel' },
      { x: width * 0.5, y: height * 0.5, radius: 80, strength: 0.025, type: 'attract' }
    ];
    
    const animate = () => {
      ctx.fillStyle = 'rgba(240, 238, 230, 0.08)';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Update field centers (they slowly move and pulse)
      fieldCenters.forEach((field, index) => {
        const angle = time * 0.008 + index * 2;
        field.x = width * 0.5 + Math.cos(angle) * 60;
        field.y = height * 0.5 + Math.sin(angle) * 60;
        field.radius = 100 + Math.sin(time * 0.01 + index) * 30;
      });
      
      // Draw field visualization
      fieldCenters.forEach(field => {
        const gradient = ctx.createRadialGradient(
          field.x, field.y, 0,
          field.x, field.y, field.radius
        );
        
        if (field.type === 'attract') {
          gradient.addColorStop(0, 'rgba(70, 70, 70, 0.1)');
          gradient.addColorStop(1, 'rgba(70, 70, 70, 0)');
        } else {
          gradient.addColorStop(0, 'rgba(50, 50, 50, 0.08)');
          gradient.addColorStop(1, 'rgba(50, 50, 50, 0)');
        }
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(field.x, field.y, field.radius, 0, Math.PI * 2);
        ctx.fill();
        
        // Field center
        ctx.fillStyle = field.type === 'attract' ? 
          'rgba(80, 80, 80, 0.6)' : 'rgba(40, 40, 40, 0.6)';
        ctx.beginPath();
        ctx.arc(field.x, field.y, 4, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Update and draw particles
      particles.forEach(particle => {
        particle.update(time, fieldCenters);
        particle.draw(ctx);
      });
      
      // Draw field lines
      ctx.strokeStyle = 'rgba(60, 60, 60, 0.05)';
      ctx.lineWidth = 0.5;
      
      for (let x = 0; x < width; x += 40) {
        for (let y = 0; y < height; y += 40) {
          let totalForceX = 0;
          let totalForceY = 0;
          
          fieldCenters.forEach(field => {
            const dx = field.x - x;
            const dy = field.y - y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            
            if (dist > 0 && dist < field.radius) {
              const strength = field.strength * (1 - dist / field.radius);
              const angle = Math.atan2(dy, dx);
              
              if (field.type === 'attract') {
                totalForceX += Math.cos(angle) * strength * 200;
                totalForceY += Math.sin(angle) * strength * 200;
              } else {
                totalForceX -= Math.cos(angle) * strength * 200;
                totalForceY -= Math.sin(angle) * strength * 200;
              }
            }
          });
          
          if (Math.abs(totalForceX) > 1 || Math.abs(totalForceY) > 1) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + totalForceX, y + totalForceY);
            ctx.stroke();
          }
        }
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      particlesRef.current = [];
    };
  }, [width, height]);

  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      backgroundColor: '#F0EEE6',
      overflow: 'hidden'
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default EtherealField;

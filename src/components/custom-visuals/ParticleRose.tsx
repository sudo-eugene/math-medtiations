import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: divine proportion, unfolding beauty, mathematical elegance in nature
// visualization: Particles trace golden ratio spirals to form an ever-blooming rose pattern

const ParticleRose: React.FC<VisualProps> = ({ width, height }) => {
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
    
    const centerX = width / 2;
    const centerY = height / 2;
    const PARTICLE_COUNT = 8000;
    const goldenRatio = (1 + Math.sqrt(5)) / 2;
    let time = 0;
    
    class RoseParticle {
      constructor() {
        this.reset();
        this.age = Math.random() * 1000; // Start at random ages
      }
      
      reset() {
        this.t = 0;
        this.age = 0;
        this.opacity = 0;
        this.size = 0.3 + Math.random() * 0.7;
        this.petalNumber = Math.floor(Math.random() * 8) + 1;
        this.spiralSpeed = 0.008 + Math.random() * 0.004;
        this.phase = Math.random() * Math.PI * 2;
      }
      
      update(currentTime) {
        this.age += 1;
        this.t += this.spiralSpeed;
        
        // Golden ratio spiral with rose curve modulation
        const radius = Math.sqrt(this.t) * 4;
        const angle = this.t * goldenRatio + this.phase;
        
        // Rose curve equation: r = a * cos(k*θ)
        const roseCurve = Math.cos(this.petalNumber * angle) * 0.8;
        const finalRadius = radius * (1 + roseCurve);
        
        this.x = centerX + Math.cos(angle) * finalRadius;
        this.y = centerY + Math.sin(angle) * finalRadius;
        
        // Fade in and out
        const maxAge = 800;
        if (this.age < 100) {
          this.opacity = this.age / 100;
        } else if (this.age > maxAge - 100) {
          this.opacity = (maxAge - this.age) / 100;
        } else {
          this.opacity = 1;
        }
        
        // Reset when too old or too far
        if (this.age > maxAge || finalRadius > Math.min(width, height) * 0.4) {
          this.reset();
        }
      }
      
      draw(ctx) {
        if (this.opacity <= 0) return;
        
        const alpha = this.opacity * 0.5;
        ctx.fillStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Initialize particles
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new RoseParticle());
    }
    particlesRef.current = particles;
    
    const animate = () => {
      ctx.fillStyle = 'rgba(240, 238, 230, 0.08)';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      particles.forEach(particle => {
        particle.update(time);
        particle.draw(ctx);
      });
      
      // Draw connecting lines between nearby particles (petals)
      ctx.strokeStyle = 'rgba(70, 70, 70, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i += 20) {
        for (let j = i + 20; j < particles.length; j += 20) {
          const p1 = particles[i];
          const p2 = particles[j];
          
          if (p1.opacity > 0.5 && p2.opacity > 0.5) {
            const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            if (dist < 40) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }
      
      // Center point
      const pulseSize = 4 + Math.sin(time * 0.02) * 2;
      ctx.fillStyle = 'rgba(80, 80, 80, 0.8)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, pulseSize, 0, Math.PI * 2);
      ctx.fill();
      
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

export default ParticleRose;

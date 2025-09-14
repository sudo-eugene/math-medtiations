import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: fluidity of consciousness, waves of awareness, oceanic mind
// visualization: Thousands of particles create flowing wave patterns, like consciousness moving through the ocean of awareness

const ParticleOcean: React.FC<VisualProps> = ({ width, height }) => {
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
    
    const PARTICLE_COUNT = 15000;
    let time = 0;
    
    class WaveParticle {
      constructor() {
        this.x = Math.random() * width;
        this.y = Math.random() * height;
        this.baseY = this.y;
        this.phase = Math.random() * Math.PI * 2;
        this.amplitude = 20 + Math.random() * 30;
        this.frequency = 0.005 + Math.random() * 0.01;
        this.speed = 0.2 + Math.random() * 0.8;
        this.size = 0.3 + Math.random() * 0.7;
        this.opacity = 0.3 + Math.random() * 0.4;
        this.wavePhase = Math.random() * Math.PI * 2;
      }
      
      update(time) {
        // Horizontal wave motion
        this.x += this.speed;
        if (this.x > width + 50) {
          this.x = -50;
          this.baseY = Math.random() * height;
        }
        
        // Vertical wave oscillation
        const globalWave = Math.sin(this.x * 0.01 + time * 0.02) * 15;
        const localWave = Math.sin(this.x * this.frequency + time * 0.03 + this.phase) * this.amplitude;
        const depthWave = Math.sin(time * 0.01 + this.wavePhase) * 10;
        
        this.y = this.baseY + globalWave + localWave + depthWave;
        
        // Depth-based opacity variation
        this.currentOpacity = this.opacity * (0.8 + Math.sin(time * 0.02 + this.phase) * 0.2);
      }
      
      draw(ctx) {
        ctx.fillStyle = `rgba(60, 60, 60, ${this.currentOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Initialize particles
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new WaveParticle());
    }
    particlesRef.current = particles;
    
    const animate = () => {
      ctx.fillStyle = 'rgba(240, 238, 230, 0.12)';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      particles.forEach(particle => {
        particle.update(time);
        particle.draw(ctx);
      });
      
      // Draw wave flow lines
      ctx.strokeStyle = 'rgba(70, 70, 70, 0.08)';
      ctx.lineWidth = 1;
      
      for (let y = 50; y < height; y += 80) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 5) {
          const waveY = y + Math.sin(x * 0.01 + time * 0.02) * 15 + 
                            Math.sin(x * 0.008 + time * 0.025) * 8;
          
          if (x === 0) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
      }
      
      // Draw depth layers
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.05)';
      ctx.lineWidth = 0.5;
      
      for (let layer = 0; layer < 3; layer++) {
        const depth = layer * 60 + 100;
        ctx.beginPath();
        for (let x = 0; x < width; x += 8) {
          const waveY = depth + Math.sin(x * 0.006 + time * 0.015 + layer) * 25;
          
          if (x === 0) ctx.moveTo(x, waveY);
          else ctx.lineTo(x, waveY);
        }
        ctx.stroke();
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

export default ParticleOcean;

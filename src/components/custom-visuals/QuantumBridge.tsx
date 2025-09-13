import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: connection through emptiness, quantum entanglement, bridges between realities
// visualization: Particles phase in/out of existence while maintaining quantum connections across dimensional bridges

const QuantumBridge: React.FC<VisualProps> = ({ width, height }) => {
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
    let particles = [];
    
    class QuantumParticle {
      constructor(x, y, bridgeId) {
        this.x = x;
        this.y = y;
        this.originX = x;
        this.originY = y;
        this.bridgeId = bridgeId;
        this.phase = Math.random() * Math.PI * 2;
        this.phaseSpeed = 0.02 + Math.random() * 0.03;
        this.existence = 0; // 0 to 1, probability of existence
        this.targetExistence = Math.random();
        this.entangled = null; // Reference to entangled particle
        this.size = 2 + Math.random() * 3;
        this.energy = Math.random();
        this.drift = {
          x: (Math.random() - 0.5) * 0.1,
          y: (Math.random() - 0.5) * 0.1
        };
      }
      
      update(time) {
        this.phase += this.phaseSpeed;
        
        // Quantum existence probability wave
        this.existence += (this.targetExistence - this.existence) * 0.01;
        
        // Randomly change target existence (quantum collapse/superposition)
        if (Math.random() < 0.002) {
          this.targetExistence = Math.random();
        }
        
        // Gentle drift movement
        this.x += this.drift.x * Math.sin(time * 0.01 + this.phase);
        this.y += this.drift.y * Math.cos(time * 0.008 + this.phase);
        
        // Quantum entanglement effect
        if (this.entangled && this.entangled.existence > 0.5) {
          this.existence = Math.max(this.existence, this.entangled.existence * 0.3);
        }
      }
      
      draw(ctx) {
        if (this.existence < 0.1) return;
        
        const alpha = this.existence * 0.6;
        const pulseSize = this.size * (1 + Math.sin(this.phase) * 0.3);
        
        // Particle glow
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, pulseSize * 2
        );
        gradient.addColorStop(0, `rgba(60, 60, 60, ${alpha})`);
        gradient.addColorStop(0.5, `rgba(60, 60, 60, ${alpha * 0.3})`);
        gradient.addColorStop(1, `rgba(60, 60, 60, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Core particle
        ctx.fillStyle = `rgba(50, 50, 50, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Initialize bridges and particles
    const initializeSystem = () => {
      particles = [];
      const numBridges = 3;
      const particlesPerBridge = 8;
      
      for (let b = 0; b < numBridges; b++) {
        const bridgeY = height * (0.2 + (b * 0.3));
        const bridgeParticles = [];
        
        for (let p = 0; p < particlesPerBridge; p++) {
          const x = width * (0.1 + (p / (particlesPerBridge - 1)) * 0.8);
          const y = bridgeY + (Math.random() - 0.5) * 40;
          const particle = new QuantumParticle(x, y, b);
          particles.push(particle);
          bridgeParticles.push(particle);
        }
        
        // Create quantum entanglement between particles
        for (let i = 0; i < bridgeParticles.length - 1; i++) {
          if (Math.random() < 0.4) {
            bridgeParticles[i].entangled = bridgeParticles[i + 1];
            bridgeParticles[i + 1].entangled = bridgeParticles[i];
          }
        }
      }
      
      // Create cross-bridge entanglements
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          if (particles[i].bridgeId !== particles[j].bridgeId && Math.random() < 0.1) {
            particles[i].entangled = particles[j];
            particles[j].entangled = particles[i];
          }
        }
      }
    };
    
    const drawBridges = (ctx) => {
      const numBridges = 3;
      
      for (let b = 0; b < numBridges; b++) {
        const bridgeY = height * (0.2 + (b * 0.3));
        const bridgeParticles = particles.filter(p => p.bridgeId === b);
        
        // Draw bridge structure
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 10]);
        ctx.beginPath();
        ctx.moveTo(0, bridgeY);
        ctx.lineTo(width, bridgeY);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Draw quantum field lines
        for (let i = 0; i < bridgeParticles.length - 1; i++) {
          const p1 = bridgeParticles[i];
          const p2 = bridgeParticles[i + 1];
          
          if (p1.existence > 0.3 && p2.existence > 0.3) {
            const alpha = Math.min(p1.existence, p2.existence) * 0.3;
            ctx.strokeStyle = `rgba(60, 60, 60, ${alpha})`;
            ctx.lineWidth = 0.5;
            
            // Curved connection showing quantum field
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            const midX = (p1.x + p2.x) / 2;
            const midY = (p1.y + p2.y) / 2 + Math.sin(time * 0.01) * 10;
            ctx.quadraticCurveTo(midX, midY, p2.x, p2.y);
            ctx.stroke();
          }
        }
      }
    };
    
    const drawEntanglements = (ctx) => {
      particles.forEach(particle => {
        if (particle.entangled && particle.existence > 0.4 && particle.entangled.existence > 0.4) {
          const alpha = Math.min(particle.existence, particle.entangled.existence) * 0.15;
          ctx.strokeStyle = `rgba(70, 70, 70, ${alpha})`;
          ctx.lineWidth = 0.3;
          
          // Quantum entanglement visualization
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          
          // Create wavy connection showing quantum correlation
          const dx = particle.entangled.x - particle.x;
          const dy = particle.entangled.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          const waves = Math.floor(distance / 30);
          
          for (let w = 0; w <= waves; w++) {
            const t = w / waves;
            const x = particle.x + dx * t;
            const y = particle.y + dy * t;
            const offset = Math.sin(time * 0.02 + w * 0.5) * 5;
            const perpX = -dy / distance * offset;
            const perpY = dx / distance * offset;
            ctx.lineTo(x + perpX, y + perpY);
          }
          
          ctx.stroke();
        }
      });
    };
    
    const animate = () => {
      // Clear canvas with quantum uncertainty
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Update particles
      particles.forEach(particle => particle.update(time));
      
      // Draw the quantum bridges
      drawBridges(ctx);
      
      // Draw entanglement connections
      drawEntanglements(ctx);
      
      // Draw particles
      particles.forEach(particle => particle.draw(ctx));
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializeSystem();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      particles = [];
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

export default QuantumBridge;

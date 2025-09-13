import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: organic growth patterns, fractal branching, life force ascending through structure
// visualization: Particles form a growing tree structure, representing the organic nature of consciousness branching into awareness

const ParticleTree: React.FC<VisualProps> = ({ width, height }) => {
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
    
    const PARTICLE_COUNT = 12000;
    let time = 0;
    
    class TreeParticle {
      constructor() {
        this.reset();
        this.age = Math.random() * 500; // Start at random ages
      }
      
      reset() {
        this.x = width / 2 + (Math.random() - 0.5) * 40; // Start near base
        this.y = height - 20;
        this.targetX = 0;
        this.targetY = 0;
        this.age = 0;
        this.opacity = 0;
        this.size = 0.4 + Math.random() * 0.6;
        this.branch = Math.floor(Math.random() * 8); // Which branch to follow
        this.speed = 0.8 + Math.random() * 1.2;
        this.swayPhase = Math.random() * Math.PI * 2;
      }
      
      update(time) {
        this.age += this.speed;
        
        // Calculate tree structure using fractal branching
        const progress = this.age * 0.01;
        const branchAngle = (this.branch / 8) * Math.PI * 2;
        
        // Main trunk growth
        let treeX = width / 2;
        let treeY = height - progress * 60;
        
        // Branch out as we go higher
        if (progress > 2) {
          const branchProgress = progress - 2;
          const branchRadius = branchProgress * 15;
          const branchSway = Math.sin(time * 0.02 + this.swayPhase) * 8;
          
          treeX += Math.cos(branchAngle) * branchRadius + branchSway;
          treeY -= branchProgress * 20;
          
          // Secondary branching
          if (progress > 4) {
            const secondaryAngle = branchAngle + Math.sin(branchProgress * 0.5) * 0.5;
            const secondaryRadius = (branchProgress - 2) * 8;
            
            treeX += Math.cos(secondaryAngle) * secondaryRadius;
            treeY -= (branchProgress - 2) * 15;
          }
        }
        
        this.targetX = treeX;
        this.targetY = treeY;
        
        // Move towards target position
        this.x += (this.targetX - this.x) * 0.1;
        this.y += (this.targetY - this.y) * 0.1;
        
        // Opacity based on height and age
        const heightFactor = Math.max(0, 1 - (height - this.y) / (height * 0.7));
        this.opacity = heightFactor * Math.min(1, this.age * 0.01);
        
        // Reset if too old or too high
        if (this.age > 600 || this.y < height * 0.2) {
          this.reset();
        }
      }
      
      draw(ctx) {
        if (this.opacity <= 0) return;
        
        const alpha = this.opacity * 0.6;
        ctx.fillStyle = `rgba(50, 50, 50, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Initialize particles
    const particles = [];
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push(new TreeParticle());
    }
    particlesRef.current = particles;
    
    const drawTreeStructure = (ctx, time) => {
      // Draw main trunk outline
      ctx.strokeStyle = 'rgba(70, 70, 70, 0.2)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.moveTo(width / 2 - 8, height);
      ctx.lineTo(width / 2 - 4, height * 0.6);
      ctx.lineTo(width / 2 + 4, height * 0.6);
      ctx.lineTo(width / 2 + 8, height);
      ctx.stroke();
      
      // Draw branch guidelines
      ctx.strokeStyle = 'rgba(60, 60, 60, 0.1)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const startX = width / 2;
        const startY = height * 0.6;
        const endX = startX + Math.cos(angle) * 120;
        const endY = startY - 80;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    };
    
    const animate = () => {
      ctx.fillStyle = 'rgba(240, 238, 230, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Draw tree structure guidelines
      drawTreeStructure(ctx, time);
      
      particles.forEach(particle => {
        particle.update(time);
        particle.draw(ctx);
      });
      
      // Draw connecting lines between nearby particles (tree texture)
      ctx.strokeStyle = 'rgba(60, 60, 60, 0.08)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i += 50) {
        for (let j = i + 50; j < particles.length; j += 50) {
          const p1 = particles[i];
          const p2 = particles[j];
          
          if (p1.opacity > 0.3 && p2.opacity > 0.3) {
            const dist = Math.sqrt((p1.x - p2.x) ** 2 + (p1.y - p2.y) ** 2);
            if (dist < 30) {
              ctx.beginPath();
              ctx.moveTo(p1.x, p1.y);
              ctx.lineTo(p2.x, p2.y);
              ctx.stroke();
            }
          }
        }
      }
      
      // Root system hint
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.15)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(width / 2, height + 20, 60, Math.PI, 0);
      ctx.stroke();
      
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

export default ParticleTree;

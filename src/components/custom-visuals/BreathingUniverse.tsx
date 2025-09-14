import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: cosmic lung, universal breathing, inhaling stars and exhaling galaxies
// visualization: A cosmic lung that inhales stars and exhales galaxies, visualizing universal breathing

const BreathingUniverse: React.FC<VisualProps> = ({ width, height }) => {
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
    let stars = [];
    let galaxies = [];
    let breathPhase = 0;
    
    class Star {
      constructor(x, y) {
        this.originX = x;
        this.originY = y;
        this.x = x;
        this.y = y;
        this.size = 0.5 + Math.random() * 2;
        this.brightness = Math.random();
        this.phase = Math.random() * Math.PI * 2;
        this.twinkleSpeed = 0.02 + Math.random() * 0.03;
        this.inhaleDistance = 20 + Math.random() * 80;
        this.inhaleAngle = Math.random() * Math.PI * 2;
        this.life = 1;
        this.targetLife = 1;
      }
      
      update(breathPhase, isInhaling) {
        this.phase += this.twinkleSpeed;
        
        // Breathing movement toward/away from center
        const centerX = width / 2;
        const centerY = height / 2;
        const dx = this.originX - centerX;
        const dy = this.originY - centerY;
        
        if (isInhaling) {
          // Move toward center
          const pull = breathPhase * 0.3;
          this.x = this.originX - dx * pull;
          this.y = this.originY - dy * pull;
          this.targetLife = 1 - breathPhase * 0.7; // Fade as inhaled
        } else {
          // Move away from center
          const push = (1 - breathPhase) * 0.2;
          this.x = this.originX + dx * push;
          this.y = this.originY + dy * push;
          this.targetLife = 0.3 + breathPhase * 0.7; // Brighten as exhaled
        }
        
        this.life += (this.targetLife - this.life) * 0.05;
      }
      
      draw(ctx, breathPhase) {
        if (this.life < 0.05) return;
        
        const twinkle = Math.sin(this.phase) * 0.3 + 0.7;
        const alpha = this.life * this.brightness * twinkle;
        const size = this.size * (0.5 + this.life * 0.5);
        
        // Star glow
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, size * 3
        );
        gradient.addColorStop(0, `rgba(80, 80, 80, ${alpha})`);
        gradient.addColorStop(1, `rgba(80, 80, 80, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size * 3, 0, Math.PI * 2);
        ctx.fill();
        
        // Star core
        ctx.fillStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    class Galaxy {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 0;
        this.targetSize = 15 + Math.random() * 25;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.arms = 2 + Math.floor(Math.random() * 3);
        this.density = 0.3 + Math.random() * 0.4;
        this.life = 0;
        this.targetLife = 0;
        this.expansionSpeed = 0.3 + Math.random() * 0.4;
        this.birthTime = Math.random() * 100;
        this.age = 0;
      }
      
      update(breathPhase, isInhaling, time) {
        this.age += 1;
        this.rotation += this.rotationSpeed;
        
        if (!isInhaling && this.age > this.birthTime) {
          // Galaxy grows during exhale
          this.targetLife = breathPhase;
          this.size += (this.targetSize * breathPhase - this.size) * 0.05;
        } else if (isInhaling) {
          // Galaxy shrinks during inhale
          this.targetLife = 1 - breathPhase;
          this.size *= 0.98;
        }
        
        this.life += (this.targetLife - this.life) * 0.03;
      }
      
      draw(ctx) {
        if (this.size < 1 || this.life < 0.05) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const alpha = this.life * this.density;
        
        // Draw spiral arms
        for (let arm = 0; arm < this.arms; arm++) {
          const armAngle = (arm / this.arms) * Math.PI * 2;
          
          ctx.strokeStyle = `rgba(70, 70, 70, ${alpha * 0.6})`;
          ctx.lineWidth = 0.8;
          ctx.beginPath();
          
          const points = 20;
          for (let i = 0; i < points; i++) {
            const t = i / points;
            const angle = armAngle + t * Math.PI * 4;
            const radius = this.size * t;
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
          
          // Add stars along spiral arms
          for (let i = 0; i < points; i += 3) {
            if (Math.random() < 0.7) {
              const t = i / points;
              const angle = armAngle + t * Math.PI * 4;
              const radius = (this.size * t) + (Math.random() - 0.5) * 3;
              const x = Math.cos(angle) * radius;
              const y = Math.sin(angle) * radius;
              
              ctx.fillStyle = `rgba(50, 50, 50, ${alpha * (1 - t * 0.5)})`;
              ctx.beginPath();
              ctx.arc(x, y, 0.5, 0, Math.PI * 2);
              ctx.fill();
            }
          }
        }
        
        // Galaxy core
        const coreGradient = ctx.createRadialGradient(0, 0, 0, 0, 0, this.size * 0.3);
        coreGradient.addColorStop(0, `rgba(80, 80, 80, ${alpha})`);
        coreGradient.addColorStop(1, `rgba(60, 60, 60, 0)`);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(0, 0, this.size * 0.3, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.restore();
      }
    }
    
    const initializeUniverse = () => {
      stars = [];
      galaxies = [];
      
      // Create stars distributed across the canvas
      const numStars = 60 + Math.floor(Math.random() * 40);
      for (let i = 0; i < numStars; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        stars.push(new Star(x, y));
      }
      
      // Create fewer galaxies
      const numGalaxies = 3 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numGalaxies; i++) {
        const x = width * (0.2 + Math.random() * 0.6);
        const y = height * (0.2 + Math.random() * 0.6);
        galaxies.push(new Galaxy(x, y));
      }
    };
    
    const drawBreathingField = (ctx, breathPhase, isInhaling) => {
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Draw breathing field lines
      ctx.strokeStyle = `rgba(80, 80, 80, ${0.1 + breathPhase * 0.1})`;
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 8]);
      
      const numLines = 12;
      for (let i = 0; i < numLines; i++) {
        const angle = (i / numLines) * Math.PI * 2;
        const maxRadius = Math.min(width, height) * 0.4;
        const currentRadius = maxRadius * (isInhaling ? 1 - breathPhase * 0.3 : 1 + breathPhase * 0.2);
        
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * currentRadius,
          centerY + Math.sin(angle) * currentRadius
        );
        ctx.stroke();
      }
      ctx.setLineDash([]);
      
      // Draw central breathing core
      const coreSize = 8 + breathPhase * 6;
      const coreAlpha = 0.2 + breathPhase * 0.3;
      
      const coreGradient = ctx.createRadialGradient(
        centerX, centerY, 0,
        centerX, centerY, coreSize * 2
      );
      coreGradient.addColorStop(0, `rgba(70, 70, 70, ${coreAlpha})`);
      coreGradient.addColorStop(1, `rgba(70, 70, 70, 0)`);
      
      ctx.fillStyle = coreGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreSize * 2, 0, Math.PI * 2);
      ctx.fill();
      
      ctx.strokeStyle = `rgba(60, 60, 60, ${coreAlpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, coreSize, 0, Math.PI * 2);
      ctx.stroke();
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Breathing cycle: slow, meditative
      const breathCycle = time * 0.005; // Very slow breathing
      breathPhase = (Math.sin(breathCycle) + 1) / 2; // 0 to 1
      const isInhaling = Math.sin(breathCycle) > 0;
      
      // Draw breathing field
      drawBreathingField(ctx, breathPhase, isInhaling);
      
      // Update and draw stars
      stars.forEach(star => {
        star.update(breathPhase, isInhaling);
        star.draw(ctx, breathPhase);
      });
      
      // Update and draw galaxies
      galaxies.forEach(galaxy => {
        galaxy.update(breathPhase, isInhaling, time);
        galaxy.draw(ctx);
      });
      
      // Create new galaxies during exhale
      if (!isInhaling && breathPhase > 0.7 && Math.random() < 0.02) {
        const x = width * (0.2 + Math.random() * 0.6);
        const y = height * (0.2 + Math.random() * 0.6);
        galaxies.push(new Galaxy(x, y));
      }
      
      // Remove old galaxies
      galaxies = galaxies.filter(galaxy => galaxy.size > 0.5 || galaxy.life > 0.05);
      
      // Breathing indicator text
      ctx.font = '12px serif';
      ctx.fillStyle = `rgba(60, 60, 60, ${0.3 + breathPhase * 0.2})`;
      ctx.textAlign = 'center';
      ctx.fillText(
        isInhaling ? 'Inhaling Stars' : 'Exhaling Galaxies',
        width / 2,
        height - 20
      );
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializeUniverse();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      stars = [];
      galaxies = [];
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

export default BreathingUniverse;

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: flowers bloom from emptiness, forms defined by what they're not
// visualization: Flowers bloom from emptiness, their forms defined by what they're not

const VoidGarden: React.FC<VisualProps> = ({ width, height }) => {
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
    let voidFlowers = [];
    let voidSpaces = [];
    
    class VoidFlower {
      constructor(x, y, voidRadius) {
        this.x = x;
        this.y = y;
        this.voidRadius = voidRadius; // The empty space that defines the flower
        this.targetVoidRadius = voidRadius;
        this.petalCount = 5 + Math.floor(Math.random() * 8);
        this.stemHeight = 20 + Math.random() * 40;
        this.bloomPhase = 0;
        this.targetBloomPhase = 0;
        this.bloomSpeed = 0.008 + Math.random() * 0.005;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.003;
        this.petalOpacity = 0.3 + Math.random() * 0.4;
        this.phase = Math.random() * Math.PI * 2;
        this.isReversing = false;
        this.reverseDelay = 2000 + Math.random() * 3000;
        this.age = 0;
      }
      
      update(time) {
        this.age += 1;
        this.rotation += this.rotationSpeed;
        this.phase += 0.02;
        
        // Blooming cycle
        if (!this.isReversing && this.age > 100) {
          this.targetBloomPhase = 1;
          if (this.bloomPhase > 0.95) {
            setTimeout(() => {
              this.isReversing = true;
              this.targetBloomPhase = 0;
            }, this.reverseDelay);
          }
        }
        
        this.bloomPhase += (this.targetBloomPhase - this.bloomPhase) * this.bloomSpeed;
        
        // Void radius pulsing
        this.targetVoidRadius = this.voidRadius * (0.8 + Math.sin(this.phase) * 0.2);
      }
      
      draw(ctx) {
        if (this.bloomPhase < 0.05) return;
        
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const currentVoidRadius = this.targetVoidRadius * this.bloomPhase;
        const petalLength = currentVoidRadius * 1.5;
        
        // Draw stem (defined by the space around it)
        const stemWidth = 3;
        ctx.strokeStyle = `rgba(60, 60, 60, ${this.petalOpacity * 0.6})`;
        ctx.lineWidth = 1;
        
        // Stem as negative space outline
        ctx.beginPath();
        ctx.moveTo(-stemWidth, 0);
        ctx.lineTo(-stemWidth, this.stemHeight);
        ctx.moveTo(stemWidth, 0);
        ctx.lineTo(stemWidth, this.stemHeight);
        ctx.stroke();
        
        // Draw petals as the space around the void
        for (let i = 0; i < this.petalCount; i++) {
          const angle = (i / this.petalCount) * Math.PI * 2;
          const petalPhase = this.bloomPhase * this.petalCount - i;
          
          if (petalPhase > 0) {
            const actualPhase = Math.min(petalPhase, 1);
            this.drawVoidPetal(ctx, angle, currentVoidRadius, petalLength, actualPhase);
          }
        }
        
        // Draw the central void
        ctx.strokeStyle = `rgba(80, 80, 80, ${this.petalOpacity * this.bloomPhase})`;
        ctx.lineWidth = 1.5;
        ctx.setLineDash([2, 4]);
        ctx.beginPath();
        ctx.arc(0, 0, currentVoidRadius, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Add void indicator points
        const voidPoints = 6;
        for (let i = 0; i < voidPoints; i++) {
          const angle = (i / voidPoints) * Math.PI * 2;
          const x = Math.cos(angle) * currentVoidRadius * 0.7;
          const y = Math.sin(angle) * currentVoidRadius * 0.7;
          
          ctx.fillStyle = `rgba(70, 70, 70, ${this.petalOpacity * 0.3})`;
          ctx.beginPath();
          ctx.arc(x, y, 1, 0, Math.PI * 2);
          ctx.fill();
        }
        
        ctx.restore();
      }
      
      drawVoidPetal(ctx, angle, voidRadius, petalLength, phase) {
        const alpha = this.petalOpacity * phase;
        
        // Draw petal outline - the flower is defined by what it's not
        ctx.strokeStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.lineWidth = 0.8;
        
        // Petal shape defined by curves around the void
        const petalTipX = Math.cos(angle) * petalLength;
        const petalTipY = Math.sin(angle) * petalLength;
        const voidEdgeX = Math.cos(angle) * voidRadius;
        const voidEdgeY = Math.sin(angle) * voidRadius;
        
        // Left side of petal
        const leftAngle = angle - 0.3;
        const leftCurveX = Math.cos(leftAngle) * voidRadius * 1.2;
        const leftCurveY = Math.sin(leftAngle) * voidRadius * 1.2;
        
        // Right side of petal
        const rightAngle = angle + 0.3;
        const rightCurveX = Math.cos(rightAngle) * voidRadius * 1.2;
        const rightCurveY = Math.sin(rightAngle) * voidRadius * 1.2;
        
        ctx.beginPath();
        ctx.moveTo(voidEdgeX, voidEdgeY);
        ctx.quadraticCurveTo(leftCurveX, leftCurveY, petalTipX, petalTipY);
        ctx.quadraticCurveTo(rightCurveX, rightCurveY, voidEdgeX, voidEdgeY);
        ctx.stroke();
        
        // Add texture lines that respect the void
        const textureLines = 3;
        for (let t = 0; t < textureLines; t++) {
          const textureRatio = (t + 1) / (textureLines + 1);
          const textureX = voidEdgeX + (petalTipX - voidEdgeX) * textureRatio;
          const textureY = voidEdgeY + (petalTipY - voidEdgeY) * textureRatio;
          
          ctx.strokeStyle = `rgba(70, 70, 70, ${alpha * 0.5})`;
          ctx.lineWidth = 0.3;
          ctx.beginPath();
          ctx.moveTo(voidEdgeX, voidEdgeY);
          ctx.lineTo(textureX, textureY);
          ctx.stroke();
        }
      }
    }
    
    class VoidSpace {
      constructor(x, y, radius) {
        this.x = x;
        this.y = y;
        this.radius = radius;
        this.targetRadius = radius;
        this.opacity = 0.1 + Math.random() * 0.2;
        this.phase = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.01 + Math.random() * 0.02;
        this.type = Math.random() > 0.5 ? 'circle' : 'square';
      }
      
      update() {
        this.phase += this.pulseSpeed;
        this.targetRadius = this.radius * (0.9 + Math.sin(this.phase) * 0.1);
      }
      
      draw(ctx) {
        const alpha = this.opacity * (0.7 + Math.sin(this.phase) * 0.3);
        
        ctx.strokeStyle = `rgba(80, 80, 80, ${alpha})`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([1, 3]);
        
        if (this.type === 'circle') {
          ctx.beginPath();
          ctx.arc(this.x, this.y, this.targetRadius, 0, Math.PI * 2);
          ctx.stroke();
        } else {
          const half = this.targetRadius;
          ctx.beginPath();
          ctx.rect(this.x - half, this.y - half, half * 2, half * 2);
          ctx.stroke();
        }
        
        ctx.setLineDash([]);
        
        // Void center indicator
        ctx.fillStyle = `rgba(70, 70, 70, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, 1, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    const initializeGarden = () => {
      voidFlowers = [];
      voidSpaces = [];
      
      // Create void spaces first
      const numVoidSpaces = 8 + Math.floor(Math.random() * 6);
      for (let i = 0; i < numVoidSpaces; i++) {
        const x = width * (0.1 + Math.random() * 0.8);
        const y = height * (0.1 + Math.random() * 0.8);
        const radius = 10 + Math.random() * 20;
        
        voidSpaces.push(new VoidSpace(x, y, radius));
      }
      
      // Create flowers that grow around some void spaces
      const numFlowers = 4 + Math.floor(Math.random() * 4);
      for (let i = 0; i < numFlowers; i++) {
        let x, y, voidRadius;
        
        if (i < voidSpaces.length && Math.random() < 0.7) {
          // Grow around existing void space
          const voidSpace = voidSpaces[i];
          x = voidSpace.x;
          y = voidSpace.y;
          voidRadius = voidSpace.radius * 0.8;
        } else {
          // Create independent flower
          x = width * (0.2 + Math.random() * 0.6);
          y = height * (0.2 + Math.random() * 0.6);
          voidRadius = 8 + Math.random() * 15;
        }
        
        voidFlowers.push(new VoidFlower(x, y, voidRadius));
      }
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Update void spaces
      voidSpaces.forEach(space => space.update());
      
      // Update flowers
      voidFlowers.forEach(flower => flower.update(time));
      
      // Remove withered flowers and create new ones
      voidFlowers = voidFlowers.filter(flower => flower.bloomPhase > 0.01 || !flower.isReversing);
      
      if (voidFlowers.length < 6 && Math.random() < 0.003) {
        const x = width * (0.2 + Math.random() * 0.6);
        const y = height * (0.2 + Math.random() * 0.6);
        const voidRadius = 8 + Math.random() * 15;
        voidFlowers.push(new VoidFlower(x, y, voidRadius));
      }
      
      // Draw void connections
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.05)';
      ctx.lineWidth = 0.3;
      ctx.setLineDash([1, 4]);
      
      for (let i = 0; i < voidSpaces.length; i++) {
        for (let j = i + 1; j < voidSpaces.length; j++) {
          const s1 = voidSpaces[i];
          const s2 = voidSpaces[j];
          const distance = Math.sqrt((s1.x - s2.x) ** 2 + (s1.y - s2.y) ** 2);
          
          if (distance < 100) {
            ctx.beginPath();
            ctx.moveTo(s1.x, s1.y);
            ctx.lineTo(s2.x, s2.y);
            ctx.stroke();
          }
        }
      }
      ctx.setLineDash([]);
      
      // Draw void spaces
      voidSpaces.forEach(space => space.draw(ctx));
      
      // Draw flowers
      voidFlowers.forEach(flower => flower.draw(ctx));
      
      // Draw garden philosophy text
      ctx.font = '10px serif';
      ctx.fillStyle = 'rgba(60, 60, 60, 0.3)';
      ctx.textAlign = 'center';
      ctx.fillText('Form is Emptiness', width / 2, height - 30);
      ctx.fillText('Emptiness is Form', width / 2, height - 15);
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializeGarden();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      voidFlowers = [];
      voidSpaces = [];
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

export default VoidGarden;

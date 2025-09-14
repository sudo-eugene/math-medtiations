import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: ancient wisdom meets digital consciousness, binary sequences forming sacred patterns
// visualization: Binary sequences form sacred geometric patterns, merging ancient wisdom with digital consciousness

const SacredCode: React.FC<VisualProps> = ({ width, height }) => {
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
    let codeStreams = [];
    let sacredShapes = [];
    
    class CodeStream {
      constructor(x, y, direction, pattern) {
        this.x = x;
        this.y = y;
        this.direction = direction; // angle in radians
        this.pattern = pattern; // array of 0s and 1s
        this.position = 0;
        this.speed = 0.3 + Math.random() * 0.7;
        this.opacity = 0.4 + Math.random() * 0.4;
        this.spacing = 12;
        this.fontSize = 8;
        this.life = 1;
        this.maxLength = 15 + Math.floor(Math.random() * 10);
      }
      
      update() {
        this.position += this.speed;
        this.life -= 0.002;
        
        // Update position along direction
        this.x += Math.cos(this.direction) * this.speed * 0.5;
        this.y += Math.sin(this.direction) * this.speed * 0.5;
      }
      
      draw(ctx) {
        if (this.life <= 0) return;
        
        ctx.font = `${this.fontSize}px monospace`;
        ctx.textAlign = 'center';
        
        for (let i = 0; i < this.maxLength; i++) {
          const charIndex = (Math.floor(this.position) + i) % this.pattern.length;
          const char = this.pattern[charIndex];
          
          const x = this.x + Math.cos(this.direction) * i * this.spacing;
          const y = this.y + Math.sin(this.direction) * i * this.spacing;
          
          // Check bounds
          if (x < 0 || x > width || y < 0 || y > height) continue;
          
          const alpha = this.opacity * this.life * (1 - i / this.maxLength);
          const intensity = char === '1' ? 1 : 0.3;
          
          ctx.fillStyle = `rgba(${50 + intensity * 30}, ${50 + intensity * 30}, ${50 + intensity * 30}, ${alpha})`;
          ctx.fillText(char.toString(), x, y);
        }
      }
    }
    
    class SacredShape {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'triangle', 'hexagon', 'circle', 'spiral'
        this.size = 30 + Math.random() * 40;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.01;
        this.opacity = 0.2 + Math.random() * 0.3;
        this.phase = Math.random() * Math.PI * 2;
        this.codeIntensity = 0;
        this.targetCodeIntensity = 0;
      }
      
      update(time, codeStreams) {
        this.rotation += this.rotationSpeed;
        this.phase += 0.02;
        
        // Calculate code intensity based on nearby streams
        let intensity = 0;
        codeStreams.forEach(stream => {
          const distance = Math.sqrt((stream.x - this.x) ** 2 + (stream.y - this.y) ** 2);
          if (distance < this.size * 2) {
            intensity += (1 - distance / (this.size * 2)) * stream.opacity;
          }
        });
        
        this.targetCodeIntensity = Math.min(intensity, 1);
        this.codeIntensity += (this.targetCodeIntensity - this.codeIntensity) * 0.1;
      }
      
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        const alpha = this.opacity * (1 + this.codeIntensity);
        const pulseSize = this.size * (1 + Math.sin(this.phase) * 0.1);
        
        ctx.strokeStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.lineWidth = 1 + this.codeIntensity;
        
        if (this.type === 'triangle') {
          this.drawTriangle(ctx, pulseSize);
        } else if (this.type === 'hexagon') {
          this.drawHexagon(ctx, pulseSize);
        } else if (this.type === 'circle') {
          this.drawCircle(ctx, pulseSize);
        } else if (this.type === 'spiral') {
          this.drawSpiral(ctx, pulseSize);
        }
        
        // Draw activation points when touched by code
        if (this.codeIntensity > 0.3) {
          const points = this.type === 'triangle' ? 3 : (this.type === 'hexagon' ? 6 : 8);
          for (let i = 0; i < points; i++) {
            const angle = (i / points) * Math.PI * 2;
            const px = Math.cos(angle) * pulseSize * 0.8;
            const py = Math.sin(angle) * pulseSize * 0.8;
            
            ctx.fillStyle = `rgba(80, 80, 80, ${this.codeIntensity * 0.6})`;
            ctx.beginPath();
            ctx.arc(px, py, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        }
        
        ctx.restore();
      }
      
      drawTriangle(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i <= 3; i++) {
          const angle = (i / 3) * Math.PI * 2 - Math.PI / 2;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      drawHexagon(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * size;
          const y = Math.sin(angle) * size;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      drawCircle(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner circles
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.6, 0, Math.PI * 2);
        ctx.stroke();
        
        ctx.beginPath();
        ctx.arc(0, 0, size * 0.3, 0, Math.PI * 2);
        ctx.stroke();
      }
      
      drawSpiral(ctx, size) {
        ctx.beginPath();
        const turns = 2;
        const points = 50;
        
        for (let i = 0; i <= points; i++) {
          const t = i / points;
          const angle = t * turns * Math.PI * 2;
          const radius = size * t;
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
    }
    
    // Generate meaningful binary patterns
    const generateSacredPattern = () => {
      const patterns = [
        // Fibonacci in binary
        [1,1,0,1,0,1,1,1,1,0,1,0,0,1,1,1],
        // Golden ratio approximation
        [1,1,0,1,1,0,1,0,1,1,0,1,1,0,1,0],
        // Pi in binary (first digits)
        [1,1,0,0,1,0,0,1,0,0,0,0,1,1,1,1],
        // Sacred geometry ratios
        [1,0,1,1,0,1,0,1,1,0,1,1,0,1,0,1],
        // Symmetrical pattern
        [0,1,1,0,1,1,1,1,0,1,1,0,1,1,0,0]
      ];
      return patterns[Math.floor(Math.random() * patterns.length)];
    };
    
    const initializeSystem = () => {
      codeStreams = [];
      sacredShapes = [];
      
      // Create sacred shapes
      const shapeTypes = ['triangle', 'hexagon', 'circle', 'spiral'];
      const numShapes = 4 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numShapes; i++) {
        const x = width * (0.2 + Math.random() * 0.6);
        const y = height * (0.2 + Math.random() * 0.6);
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        
        sacredShapes.push(new SacredShape(x, y, type));
      }
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Spawn new code streams
      if (Math.random() < 0.1) {
        const edge = Math.floor(Math.random() * 4);
        let x, y, direction;
        
        if (edge === 0) { // Top
          x = Math.random() * width;
          y = 0;
          direction = Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
        } else if (edge === 1) { // Right
          x = width;
          y = Math.random() * height;
          direction = Math.PI + (Math.random() - 0.5) * Math.PI / 3;
        } else if (edge === 2) { // Bottom
          x = Math.random() * width;
          y = height;
          direction = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI / 3;
        } else { // Left
          x = 0;
          y = Math.random() * height;
          direction = (Math.random() - 0.5) * Math.PI / 3;
        }
        
        const pattern = generateSacredPattern();
        codeStreams.push(new CodeStream(x, y, direction, pattern));
      }
      
      // Update code streams
      codeStreams.forEach(stream => stream.update());
      codeStreams = codeStreams.filter(stream => 
        stream.life > 0 && 
        stream.x > -50 && stream.x < width + 50 && 
        stream.y > -50 && stream.y < height + 50
      );
      
      // Update sacred shapes
      sacredShapes.forEach(shape => shape.update(time, codeStreams));
      
      // Draw connections between activated shapes
      for (let i = 0; i < sacredShapes.length; i++) {
        for (let j = i + 1; j < sacredShapes.length; j++) {
          const s1 = sacredShapes[i];
          const s2 = sacredShapes[j];
          
          if (s1.codeIntensity > 0.5 && s2.codeIntensity > 0.5) {
            const distance = Math.sqrt((s1.x - s2.x) ** 2 + (s1.y - s2.y) ** 2);
            if (distance < 150) {
              const alpha = Math.min(s1.codeIntensity, s2.codeIntensity) * 0.3;
              ctx.strokeStyle = `rgba(70, 70, 70, ${alpha})`;
              ctx.lineWidth = 0.5;
              ctx.setLineDash([3, 6]);
              ctx.beginPath();
              ctx.moveTo(s1.x, s1.y);
              ctx.lineTo(s2.x, s2.y);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }
        }
      }
      
      // Draw code streams
      codeStreams.forEach(stream => stream.draw(ctx));
      
      // Draw sacred shapes
      sacredShapes.forEach(shape => shape.draw(ctx));
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializeSystem();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      codeStreams = [];
      sacredShapes = [];
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

export default SacredCode;

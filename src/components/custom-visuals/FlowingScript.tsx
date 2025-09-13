import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: calligraphy that writes itself, then dissolves back into potential
// visualization: Calligraphy that writes itself, then dissolves back into potential

const FlowingScript: React.FC<VisualProps> = ({ width, height }) => {
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
    let characters = [];
    let inkDrops = [];
    
    class FlowingCharacter {
      constructor(x, y, character, strokePaths) {
        this.x = x;
        this.y = y;
        this.character = character;
        this.strokePaths = strokePaths; // Array of stroke path data
        this.writingProgress = 0;
        this.targetWritingProgress = 0;
        this.dissolutionProgress = 0;
        this.targetDissolutionProgress = 0;
        this.writingSpeed = 0.015 + Math.random() * 0.01;
        this.dissolutionSpeed = 0.008 + Math.random() * 0.005;
        this.opacity = 0.6 + Math.random() * 0.3;
        this.phase = Math.random() * Math.PI * 2;
        this.isWriting = false;
        this.isDissolving = false;
        this.writeDelay = Math.random() * 200;
        this.dissolveDelay = 3000 + Math.random() * 2000;
        this.age = 0;
        this.inkFlow = [];
      }
      
      startWriting() {
        this.isWriting = true;
        this.targetWritingProgress = 1;
      }
      
      startDissolving() {
        this.isDissolving = true;
        this.targetDissolutionProgress = 1;
      }
      
      update(time) {
        this.age += 1;
        this.phase += 0.02;
        
        // Start writing after delay
        if (!this.isWriting && this.age > this.writeDelay) {
          this.startWriting();
        }
        
        // Writing phase
        if (this.isWriting) {
          this.writingProgress += (this.targetWritingProgress - this.writingProgress) * this.writingSpeed;
          
          // Start dissolving after completion and delay
          if (this.writingProgress > 0.95 && !this.isDissolving && this.age > this.dissolveDelay) {
            this.startDissolving();
          }
        }
        
        // Dissolution phase
        if (this.isDissolving) {
          this.dissolutionProgress += (this.targetDissolutionProgress - this.dissolutionProgress) * this.dissolutionSpeed;
        }
        
        // Update ink flow
        this.inkFlow.forEach(drop => drop.update());
        this.inkFlow = this.inkFlow.filter(drop => drop.life > 0);
        
        // Add ink drops during writing
        if (this.isWriting && this.writingProgress < 0.9 && Math.random() < 0.3) {
          const currentStroke = Math.floor(this.writingProgress * this.strokePaths.length);
          if (currentStroke < this.strokePaths.length) {
            const stroke = this.strokePaths[currentStroke];
            const strokeProgress = (this.writingProgress * this.strokePaths.length) % 1;
            const point = this.getPointOnStroke(stroke, strokeProgress);
            
            this.inkFlow.push(new InkDrop(this.x + point.x, this.y + point.y));
          }
        }
      }
      
      getPointOnStroke(stroke, progress) {
        const totalLength = stroke.length - 1;
        const targetIndex = progress * totalLength;
        const index = Math.floor(targetIndex);
        const remainder = targetIndex - index;
        
        if (index >= stroke.length - 1) {
          return stroke[stroke.length - 1];
        }
        
        const p1 = stroke[index];
        const p2 = stroke[index + 1];
        
        return {
          x: p1.x + (p2.x - p1.x) * remainder,
          y: p1.y + (p2.y - p1.y) * remainder
        };
      }
      
      draw(ctx) {
        if (this.writingProgress < 0.05) return;
        
        const alpha = this.opacity * (1 - this.dissolutionProgress) * (0.8 + Math.sin(this.phase) * 0.2);
        
        ctx.save();
        ctx.translate(this.x, this.y);
        
        // Draw each stroke progressively
        this.strokePaths.forEach((stroke, strokeIndex) => {
          const strokeStartProgress = strokeIndex / this.strokePaths.length;
          const strokeEndProgress = (strokeIndex + 1) / this.strokePaths.length;
          
          if (this.writingProgress > strokeStartProgress) {
            const strokeProgress = Math.min(1, 
              (this.writingProgress - strokeStartProgress) / (strokeEndProgress - strokeStartProgress)
            );
            
            this.drawStroke(ctx, stroke, strokeProgress, alpha);
          }
        });
        
        // Draw ink flow
        this.inkFlow.forEach(drop => drop.draw(ctx));
        
        ctx.restore();
      }
      
      drawStroke(ctx, stroke, progress, alpha) {
        if (stroke.length < 2) return;
        
        const pointsToShow = Math.floor(stroke.length * progress);
        if (pointsToShow < 2) return;
        
        // Calculate brush pressure effect
        ctx.strokeStyle = `rgba(50, 50, 50, ${alpha})`;
        ctx.lineWidth = 2 + Math.sin(this.phase) * 0.5;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        ctx.beginPath();
        ctx.moveTo(stroke[0].x, stroke[0].y);
        
        for (let i = 1; i < pointsToShow; i++) {
          const point = stroke[i];
          const pressure = 1 - (i / stroke.length) * 0.3; // Vary pressure along stroke
          
          // Add slight randomness for natural brush effect
          const variation = (Math.sin(i * 0.5 + this.phase) * 0.5) * (1 - this.dissolutionProgress);
          
          ctx.lineTo(
            point.x + variation,
            point.y + variation
          );
        }
        
        ctx.stroke();
        
        // Add dissolution effects
        if (this.dissolutionProgress > 0.1) {
          this.drawDissolutionEffect(ctx, stroke, pointsToShow, alpha);
        }
      }
      
      drawDissolutionEffect(ctx, stroke, pointsToShow, alpha) {
        const dissolutionAlpha = alpha * this.dissolutionProgress * 0.5;
        
        // Scatter ink particles
        for (let i = 0; i < pointsToShow; i += 3) {
          if (Math.random() < this.dissolutionProgress) {
            const point = stroke[i];
            const scatter = this.dissolutionProgress * 10;
            
            const scatterX = point.x + (Math.random() - 0.5) * scatter;
            const scatterY = point.y + (Math.random() - 0.5) * scatter;
            
            ctx.fillStyle = `rgba(60, 60, 60, ${dissolutionAlpha})`;
            ctx.beginPath();
            ctx.arc(scatterX, scatterY, 0.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      }
    }
    
    class InkDrop {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.size = 0.5 + Math.random() * 1.5;
        this.life = 1;
        this.velocity = {
          x: (Math.random() - 0.5) * 0.2,
          y: Math.random() * 0.3 + 0.1
        };
        this.opacity = 0.3 + Math.random() * 0.3;
      }
      
      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += 0.01; // Gravity
        this.life -= 0.01;
        this.size *= 0.99;
      }
      
      draw(ctx) {
        if (this.life <= 0) return;
        
        const alpha = this.life * this.opacity;
        ctx.fillStyle = `rgba(40, 40, 40, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    
    // Generate stroke paths for various characters/symbols
    const generateCharacterStrokes = (character) => {
      const strokes = [];
      
      if (character === '道') { // Tao/Dao - "The Way"
        // Left radical
        strokes.push([
          {x: -15, y: -20}, {x: -15, y: 0}, {x: -15, y: 20}
        ]);
        strokes.push([
          {x: -20, y: -10}, {x: -10, y: -10}
        ]);
        
        // Right part - head
        strokes.push([
          {x: 0, y: -25}, {x: 15, y: -20}, {x: 20, y: -15}, {x: 15, y: -10}
        ]);
        
        // Body
        strokes.push([
          {x: 5, y: -5}, {x: 10, y: 0}, {x: 15, y: 10}, {x: 10, y: 20}
        ]);
        
        // Foot
        strokes.push([
          {x: 0, y: 15}, {x: 20, y: 15}
        ]);
      } else if (character === '無') { // Wu - "Emptiness/Nothing"
        // Top
        strokes.push([
          {x: -20, y: -20}, {x: 20, y: -20}
        ]);
        strokes.push([
          {x: 0, y: -25}, {x: 0, y: -15}
        ]);
        
        // Middle crossing strokes
        strokes.push([
          {x: -15, y: -5}, {x: 15, y: -5}
        ]);
        strokes.push([
          {x: -10, y: 5}, {x: 10, y: 5}
        ]);
        
        // Bottom
        strokes.push([
          {x: -20, y: 20}, {x: 20, y: 20}
        ]);
        strokes.push([
          {x: -15, y: 10}, {x: -15, y: 25}
        ]);
        strokes.push([
          {x: 15, y: 10}, {x: 15, y: 25}
        ]);
      } else if (character === '∞') { // Infinity
        // Smooth infinity curve
        const points = [];
        for (let t = 0; t <= Math.PI * 2; t += 0.2) {
          const scale = 20;
          const x = scale * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
          const y = scale * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
          points.push({x, y});
        }
        strokes.push(points);
      } else if (character === '○') { // Circle
        const points = [];
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.3) {
          const x = Math.cos(angle) * 15;
          const y = Math.sin(angle) * 15;
          points.push({x, y});
        }
        strokes.push(points);
      }
      
      return strokes;
    };
    
    const initializeScript = () => {
      characters = [];
      inkDrops = [];
      
      const scriptCharacters = ['道', '無', '∞', '○'];
      const numCharacters = 3 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < numCharacters; i++) {
        const char = scriptCharacters[i % scriptCharacters.length];
        const x = width * (0.2 + (i / (numCharacters - 1)) * 0.6);
        const y = height * (0.4 + Math.random() * 0.2);
        const strokes = generateCharacterStrokes(char);
        
        characters.push(new FlowingCharacter(x, y, char, strokes));
      }
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Update characters
      characters.forEach(character => character.update(time));
      
      // Remove fully dissolved characters and create new ones
      characters = characters.filter(char => char.dissolutionProgress < 0.98);
      
      if (characters.length < 4 && Math.random() < 0.005) {
        const scriptCharacters = ['道', '無', '∞', '○'];
        const char = scriptCharacters[Math.floor(Math.random() * scriptCharacters.length)];
        const x = width * (0.2 + Math.random() * 0.6);
        const y = height * (0.3 + Math.random() * 0.4);
        const strokes = generateCharacterStrokes(char);
        
        characters.push(new FlowingCharacter(x, y, char, strokes));
      }
      
      // Draw paper texture
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.03)';
      ctx.lineWidth = 0.2;
      
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const length = 20 + Math.random() * 30;
        const angle = Math.random() * Math.PI * 2;
        
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + Math.cos(angle) * length, y + Math.sin(angle) * length);
        ctx.stroke();
      }
      
      // Draw characters
      characters.forEach(character => character.draw(ctx));
      
      // Draw brush rest
      ctx.strokeStyle = 'rgba(60, 60, 60, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(width - 30, height - 30, 8, 0, Math.PI * 2);
      ctx.stroke();
      
      // Philosophy text
      ctx.font = '9px serif';
      ctx.fillStyle = 'rgba(60, 60, 60, 0.3)';
      ctx.textAlign = 'center';
      ctx.fillText('Written in water, dissolved in air', width / 2, height - 15);
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializeScript();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      characters = [];
      inkDrops = [];
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

export default FlowingScript;

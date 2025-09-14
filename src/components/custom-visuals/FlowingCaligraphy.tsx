import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: wisdom writing itself, words as living energy, language before language
// visualization: Flowing lines that suggest ancient script and sacred calligraphy, continuously writing and dissolving

const FlowingCaligraphy: React.FC<VisualProps> = ({ width, height }) => {
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
    let strokes = [];
    
    class CalligraphyStroke {
      constructor() {
        this.points = [];
        this.startTime = time;
        this.duration = 300 + Math.random() * 200;
        this.completed = false;
        this.thickness = 1 + Math.random() * 2;
        this.opacity = 0.6 + Math.random() * 0.3;
        this.style = Math.floor(Math.random() * 4); // Different calligraphy styles
        this.flow = Math.random() * 0.02 + 0.01;
        this.generatePath();
      }
      
      generatePath() {
        const segments = 8 + Math.floor(Math.random() * 6);
        const startX = width * 0.2 + Math.random() * width * 0.6;
        const startY = height * 0.3 + Math.random() * height * 0.4;
        
        this.points = [];
        
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          let x, y;
          
          if (this.style === 0) {
            // Flowing horizontal script
            x = startX + t * (100 + Math.random() * 150);
            y = startY + Math.sin(t * Math.PI * 3) * (15 + Math.random() * 20);
          } else if (this.style === 1) {
            // Vertical ascending
            x = startX + Math.sin(t * Math.PI * 2) * (20 + Math.random() * 15);
            y = startY - t * (80 + Math.random() * 100);
          } else if (this.style === 2) {
            // Spiral character
            const angle = t * Math.PI * 4;
            const radius = (1 - t) * (30 + Math.random() * 20);
            x = startX + Math.cos(angle) * radius;
            y = startY + Math.sin(angle) * radius;
          } else {
            // Complex flowing form
            x = startX + t * (120 + Math.random() * 80) + Math.sin(t * Math.PI * 6) * 25;
            y = startY + Math.cos(t * Math.PI * 4) * (25 + Math.random() * 15);
          }
          
          this.points.push({ x, y, age: 0 });
        }
      }
      
      update(currentTime) {
        const age = currentTime - this.startTime;
        const progress = Math.min(1, age / this.duration);
        
        // Points appear progressively along the stroke
        this.visiblePoints = Math.floor(progress * this.points.length);
        
        // Add subtle movement to existing points
        this.points.forEach((point, index) => {
          if (index < this.visiblePoints) {
            point.age++;
            point.x += Math.sin(currentTime * this.flow + index * 0.5) * 0.3;
            point.y += Math.cos(currentTime * this.flow + index * 0.3) * 0.2;
          }
        });
        
        this.completed = progress >= 1;
      }
      
      draw(ctx) {
        if (this.visiblePoints < 2) return;
        
        const fadeAge = 200;
        const strokeAge = time - this.startTime - this.duration;
        let alpha = this.opacity;
        
        if (strokeAge > 0) {
          alpha *= Math.max(0, 1 - strokeAge / fadeAge);
        }
        
        if (alpha <= 0) return;
        
        ctx.strokeStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.lineWidth = this.thickness;
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';
        
        // Draw the stroke with varying thickness
        for (let i = 0; i < this.visiblePoints - 1; i++) {
          const point1 = this.points[i];
          const point2 = this.points[i + 1];
          
          // Vary thickness along the stroke
          const thicknessFactor = Math.sin((i / this.points.length) * Math.PI);
          ctx.lineWidth = this.thickness * (0.5 + thicknessFactor * 0.5);
          
          ctx.beginPath();
          ctx.moveTo(point1.x, point1.y);
          ctx.lineTo(point2.x, point2.y);
          ctx.stroke();
        }
        
        // Add subtle dots and flourishes
        if (this.completed && Math.random() < 0.3) {
          const lastPoint = this.points[this.points.length - 1];
          ctx.fillStyle = `rgba(70, 70, 70, ${alpha * 0.8})`;
          ctx.beginPath();
          ctx.arc(lastPoint.x, lastPoint.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      shouldRemove() {
        const fadeAge = 200;
        const strokeAge = time - this.startTime - this.duration;
        return strokeAge > fadeAge;
      }
    }
    
    const animate = () => {
      ctx.fillStyle = 'rgba(240, 238, 230, 0.02)';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Create new strokes occasionally
      if (Math.random() < 0.08) {
        strokes.push(new CalligraphyStroke());
      }
      
      // Update existing strokes
      strokes.forEach(stroke => stroke.update(time));
      
      // Remove old strokes
      strokes = strokes.filter(stroke => !stroke.shouldRemove());
      
      // Draw all strokes
      strokes.forEach(stroke => stroke.draw(ctx));
      
      // Draw flowing background lines suggesting paper texture
      ctx.strokeStyle = 'rgba(60, 60, 60, 0.02)';
      ctx.lineWidth = 0.5;
      
      for (let y = 50; y < height; y += 30) {
        const flow = Math.sin(y * 0.01 + time * 0.005) * 3;
        ctx.beginPath();
        ctx.moveTo(0, y + flow);
        ctx.lineTo(width, y + flow);
        ctx.stroke();
      }
      
      // Subtle vertical guides
      for (let x = 80; x < width; x += 120) {
        const flow = Math.sin(x * 0.008 + time * 0.003) * 2;
        ctx.strokeStyle = 'rgba(50, 50, 50, 0.015)';
        ctx.beginPath();
        ctx.moveTo(x + flow, 0);
        ctx.lineTo(x + flow, height);
        ctx.stroke();
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      strokes = [];
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
      overflow: 'hidden'
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default FlowingCaligraphy;

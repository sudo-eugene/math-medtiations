import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: consciousness expanding in spirals, evolutionary awareness, infinite recursion of mind
// visualization: Multiple consciousness spirals interweaving, representing the recursive nature of awareness aware of itself

const SpiralConsciousness: React.FC<VisualProps> = ({ width, height }) => {
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
    let spirals = [];
    
    const centerX = width / 2;
    const centerY = height / 2;
    
    class ConsciousnessSpiral {
      constructor(centerX, centerY, direction, baseRadius, speed) {
        this.centerX = centerX;
        this.centerY = centerY;
        this.direction = direction; // 1 for clockwise, -1 for counterclockwise
        this.baseRadius = baseRadius;
        this.speed = speed;
        this.points = [];
        this.maxPoints = 200;
        this.phase = Math.random() * Math.PI * 2;
        this.consciousness = Math.random() * 0.5 + 0.3; // Awareness level
      }
      
      update(time) {
        // Add new point to spiral
        const angle = (time * this.speed) * this.direction + this.phase;
        const radius = this.baseRadius + Math.sqrt(time * this.speed) * 2;
        
        // Consciousness affects the spiral's awareness of itself
        const awareness = Math.sin(time * 0.01 + this.phase) * this.consciousness;
        const modulation = 1 + awareness * 0.3;
        
        const x = this.centerX + Math.cos(angle) * radius * modulation;
        const y = this.centerY + Math.sin(angle) * radius * modulation;
        
        this.points.push({ x, y, age: 0, awareness });
        
        // Update existing points and remove old ones
        this.points = this.points.filter(point => {
          point.age++;
          return point.age < this.maxPoints;
        });
      }
      
      draw(ctx) {
        if (this.points.length < 2) return;
        
        // Draw the spiral path
        ctx.strokeStyle = `rgba(60, 60, 60, 0.4)`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        
        for (let i = 0; i < this.points.length; i++) {
          const point = this.points[i];
          const alpha = 1 - (point.age / this.maxPoints);
          
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        ctx.stroke();
        
        // Draw consciousness nodes along the spiral
        this.points.forEach((point, index) => {
          if (index % 10 === 0) { // Every 10th point
            const alpha = (1 - (point.age / this.maxPoints)) * 0.6;
            const size = 2 + point.awareness * 3;
            
            ctx.fillStyle = `rgba(80, 80, 80, ${alpha})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            // Consciousness pulse around node
            if (point.awareness > 0.5) {
              ctx.strokeStyle = `rgba(70, 70, 70, ${alpha * 0.3})`;
              ctx.lineWidth = 0.5;
              ctx.beginPath();
              ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
              ctx.stroke();
            }
          }
        });
      }
    }
    
    // Create multiple consciousness spirals
    spirals.push(new ConsciousnessSpiral(centerX, centerY, 1, 20, 0.02));
    spirals.push(new ConsciousnessSpiral(centerX, centerY, -1, 30, 0.025));
    spirals.push(new ConsciousnessSpiral(centerX + 50, centerY - 30, 1, 15, 0.03));
    spirals.push(new ConsciousnessSpiral(centerX - 50, centerY + 30, -1, 25, 0.018));
    
    const drawInterconnections = () => {
      // Draw connections between spiral consciousness nodes
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < spirals.length; i++) {
        for (let j = i + 1; j < spirals.length; j++) {
          const spiral1 = spirals[i];
          const spiral2 = spirals[j];
          
          if (spiral1.points.length > 10 && spiral2.points.length > 10) {
            const point1 = spiral1.points[spiral1.points.length - 10];
            const point2 = spiral2.points[spiral2.points.length - 10];
            
            const dist = Math.sqrt((point1.x - point2.x) ** 2 + (point1.y - point2.y) ** 2);
            
            if (dist < 100 && point1.awareness > 0.4 && point2.awareness > 0.4) {
              ctx.beginPath();
              ctx.moveTo(point1.x, point1.y);
              ctx.lineTo(point2.x, point2.y);
              ctx.stroke();
            }
          }
        }
      }
    };
    
    const animate = () => {
      ctx.fillStyle = 'rgba(240, 238, 230, 0.1)';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Update spirals
      spirals.forEach(spiral => spiral.update(time));
      
      // Draw interconnections
      drawInterconnections();
      
      // Draw spirals
      spirals.forEach(spiral => spiral.draw(ctx));
      
      // Central awareness point
      const awarenessSize = 8 + Math.sin(time * 0.03) * 3;
      const awarenessAlpha = 0.7 + Math.sin(time * 0.025) * 0.2;
      
      ctx.fillStyle = `rgba(90, 90, 90, ${awarenessAlpha})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, awarenessSize, 0, Math.PI * 2);
      ctx.fill();
      
      // Consciousness field emanating from center
      const fieldRadius = 100 + Math.sin(time * 0.02) * 20;
      ctx.strokeStyle = `rgba(60, 60, 60, 0.1)`;
      ctx.lineWidth = 1;
      ctx.setLineDash([5, 10]);
      ctx.beginPath();
      ctx.arc(centerX, centerY, fieldRadius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      spirals = [];
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

export default SpiralConsciousness;

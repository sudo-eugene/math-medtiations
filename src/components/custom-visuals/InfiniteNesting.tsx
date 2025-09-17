import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: recursive geometric forms, infinite depth, fractals within fractals
// visualization: Recursive geometric forms that contain smaller versions of themselves, exploring infinite depth

const InfiniteNesting: React.FC<VisualProps> = ({ width, height }) => {
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
    
    class NestedShape {
      constructor(x, y, size, depth, type, parentRotation = 0) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.depth = depth;
        this.type = type; // 'square', 'triangle', 'hexagon', 'circle'
        this.rotation = parentRotation;
        this.rotationSpeed = 0.005 + depth * 0.002;
        this.opacity = Math.max(0.1, 1 - depth * 0.15);
        this.phase = Math.random() * Math.PI * 2;
        this.children = [];
        this.maxDepth = 5; // Reduced from 8 to prevent exponential growth
        this.nestingFactor = 0.6;
        
        if (depth < this.maxDepth) {
          this.generateChildren();
        }
      }
      
      generateChildren() {
        const numChildren = this.type === 'triangle' ? 3 : 
                          this.type === 'square' ? 3 : 
                          this.type === 'hexagon' ? 4 : 3; // Reduced child count
        
        for (let i = 0; i < numChildren; i++) {
          const angle = (i / numChildren) * Math.PI * 2;
          const childDistance = this.size * 0.3;
          const childSize = this.size * this.nestingFactor;
          
          const childX = Math.cos(angle) * childDistance;
          const childY = Math.sin(angle) * childDistance;
          
          // Alternate shape types for variety
          const childType = this.depth % 2 === 0 ? 
            (this.type === 'square' ? 'circle' : 'square') : 
            this.type;
          
          this.children.push(new NestedShape(
            childX, childY, childSize, this.depth + 1, childType, this.rotation + angle
          ));
        }
      }
      
      update(time) {
        this.rotation += this.rotationSpeed * (1 + Math.sin(time * 0.02 + this.phase) * 0.5);
        this.nestingFactor = 0.6 + Math.sin(time * 0.01 + this.phase) * 0.05; // Reduced variation
        
        // Update children
        this.children.forEach(child => child.update(time));
        
        // Only update child sizes, don't regenerate objects
        this.children.forEach(child => {
          child.size = this.size * this.nestingFactor;
        });
      }
      
      draw(ctx, parentX = 0, parentY = 0) {
        ctx.save();
        ctx.translate(parentX + this.x, parentY + this.y);
        ctx.rotate(this.rotation);
        
        const alpha = this.opacity;
        const pulseSize = this.size * (1 + Math.sin(time * 0.03 + this.phase) * 0.05);
        
        ctx.strokeStyle = `rgba(${60 + this.depth * 5}, ${60 + this.depth * 5}, ${60 + this.depth * 5}, ${alpha})`;
        ctx.lineWidth = Math.max(0.3, 1.5 - this.depth * 0.15);
        
        // Draw the shape
        if (this.type === 'square') {
          this.drawSquare(ctx, pulseSize);
        } else if (this.type === 'triangle') {
          this.drawTriangle(ctx, pulseSize);
        } else if (this.type === 'hexagon') {
          this.drawHexagon(ctx, pulseSize);
        } else if (this.type === 'circle') {
          this.drawCircle(ctx, pulseSize);
        }
        
        // Draw connection lines to children
        if (this.children.length > 0) {
          ctx.strokeStyle = `rgba(70, 70, 70, ${alpha * 0.3})`;
          ctx.lineWidth = Math.max(0.2, 0.8 - this.depth * 0.1);
          ctx.setLineDash([1, 2]);
          
          this.children.forEach(child => {
            ctx.beginPath();
            ctx.moveTo(0, 0);
            ctx.lineTo(child.x, child.y);
            ctx.stroke();
          });
          ctx.setLineDash([]);
        }
        
        // Draw children
        this.children.forEach(child => {
          child.draw(ctx, 0, 0);
        });
        
        ctx.restore();
      }
      
      drawSquare(ctx, size) {
        const half = size / 2;
        ctx.beginPath();
        ctx.moveTo(-half, -half);
        ctx.lineTo(half, -half);
        ctx.lineTo(half, half);
        ctx.lineTo(-half, half);
        ctx.closePath();
        ctx.stroke();
      }
      
      drawTriangle(ctx, size) {
        const h = size * 0.866; // height of equilateral triangle
        ctx.beginPath();
        ctx.moveTo(0, -h/2);
        ctx.lineTo(-size/2, h/2);
        ctx.lineTo(size/2, h/2);
        ctx.closePath();
        ctx.stroke();
      }
      
      drawHexagon(ctx, size) {
        ctx.beginPath();
        for (let i = 0; i <= 6; i++) {
          const angle = (i / 6) * Math.PI * 2;
          const x = Math.cos(angle) * size / 2;
          const y = Math.sin(angle) * size / 2;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
      }
      
      drawCircle(ctx, size) {
        ctx.beginPath();
        ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    
    let rootShapes = [];
    
    const initializeShapes = () => {
      rootShapes = [];
      const numRoots = 2; // Fixed to 2 to reduce complexity
      const shapeTypes = ['square', 'triangle', 'hexagon', 'circle'];
      
      for (let i = 0; i < numRoots; i++) {
        const x = width * (0.3 + (i / Math.max(1, numRoots - 1)) * 0.4);
        const y = height * (0.3 + Math.random() * 0.4);
        const size = 60 + Math.random() * 40;
        const type = shapeTypes[Math.floor(Math.random() * shapeTypes.length)];
        
        rootShapes.push(new NestedShape(x, y, size, 0, type));
      }
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Update shapes
      rootShapes.forEach(shape => shape.update(time));
      
      // Draw fractal depth indicator
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([5, 10]);
      
      // Draw depth rings
      const centerX = width / 2;
      const centerY = height / 2;
      for (let d = 1; d <= 6; d++) {
        const radius = d * 30;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      
      // Draw shapes
      rootShapes.forEach(shape => shape.draw(ctx));
      
      // Draw infinity symbol in center
      ctx.strokeStyle = 'rgba(60, 60, 60, 0.2)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      const a = 20;
      for (let t = 0; t <= Math.PI * 2; t += 0.1) {
        const x = centerX + a * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
        const y = centerY + a * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
        
        if (t === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Depth indicator text
      ctx.font = '10px serif';
      ctx.fillStyle = 'rgba(60, 60, 60, 0.4)';
      ctx.textAlign = 'center';
      ctx.fillText('Infinite Depth', centerX, centerY + 40);
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializeShapes();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      rootShapes = [];
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

export default InfiniteNesting;

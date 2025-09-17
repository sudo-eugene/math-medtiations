import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: threads of light weaving reality's fabric, consciousness creating structure
// visualization: Threads of light weave reality's fabric, showing how consciousness creates structure

const LightWeaving: React.FC<VisualProps> = ({ width, height }) => {
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
    let threads = [];
    let weavingPoints = [];
    
    class LightThread {
      constructor(startX, startY, endX, endY, type) {
        this.startX = startX;
        this.startY = startY;
        this.endX = endX;
        this.endY = endY;
        this.type = type; // 'warp', 'weft', 'consciousness'
        this.progress = 0;
        this.targetProgress = 0;
        this.weaveSpeed = 0.01 + Math.random() * 0.02;
        this.brightness = 0.4 + Math.random() * 0.4;
        this.phase = Math.random() * Math.PI * 2;
        this.amplitude = 5 + Math.random() * 10;
        this.frequency = 0.02 + Math.random() * 0.03;
        this.color = this.getThreadColor();
        this.intersections = [];
        this.isActive = false;
      }
      
      getThreadColor() {
        if (this.type === 'consciousness') {
          return `rgba(90, 90, 90, ${this.brightness})`;
        } else if (this.type === 'warp') {
          return `rgba(70, 70, 70, ${this.brightness})`;
        } else {
          return `rgba(50, 50, 50, ${this.brightness})`;
        }
      }
      
      update(time) {
        this.phase += this.frequency;
        
        // Weaving animation
        if (this.isActive) {
          this.targetProgress = 1;
        }
        this.progress += (this.targetProgress - this.progress) * this.weaveSpeed;
        
        // Update intersections
        this.intersections.forEach(intersection => {
          intersection.glow = Math.sin(time * 0.05 + intersection.phase) * 0.5 + 0.5;
        });
      }
      
      draw(ctx, time) {
        if (this.progress < 0.05) return;
        
        const currentEndX = this.startX + (this.endX - this.startX) * this.progress;
        const currentEndY = this.startY + (this.endY - this.startY) * this.progress;
        
        // Calculate wave along thread
        const dx = currentEndX - this.startX;
        const dy = currentEndY - this.startY;
        const length = Math.sqrt(dx * dx + dy * dy);
        const segments = Math.floor(length / 8);
        
        if (segments < 2) return;
        
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.type === 'consciousness' ? 1.5 : 1;
        ctx.beginPath();
        
        for (let i = 0; i <= segments; i++) {
          const t = i / segments;
          const x = this.startX + dx * t;
          const y = this.startY + dy * t;
          
          // Add wave motion
          const perpX = -dy / length;
          const perpY = dx / length;
          const wave = Math.sin(time * 0.02 + this.phase + t * Math.PI * 2) * this.amplitude * (1 - t);
          
          const waveX = x + perpX * wave;
          const waveY = y + perpY * wave;
          
          if (i === 0) ctx.moveTo(waveX, waveY);
          else ctx.lineTo(waveX, waveY);
        }
        
        ctx.stroke();
        
        // Draw intersections
        this.intersections.forEach(intersection => {
          if (intersection.progress > 0.5) {
            const glowSize = 3 + intersection.glow * 2;
            const glowAlpha = this.brightness * intersection.glow * 0.8;
            
            const gradient = ctx.createRadialGradient(
              intersection.x, intersection.y, 0,
              intersection.x, intersection.y, glowSize * 2
            );
            gradient.addColorStop(0, `rgba(80, 80, 80, ${glowAlpha})`);
            gradient.addColorStop(1, `rgba(80, 80, 80, 0)`);
            
            ctx.fillStyle = gradient;
            ctx.beginPath();
            ctx.arc(intersection.x, intersection.y, glowSize * 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
      }
      
      addIntersection(x, y, otherThread) {
        this.intersections.push({
          x: x,
          y: y,
          otherThread: otherThread,
          glow: 0,
          phase: Math.random() * Math.PI * 2,
          progress: 0
        });
      }
    }
    
    class WeavingPoint {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'anchor', 'consciousness_node'
        this.size = 3 + Math.random() * 4;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.03 + Math.random() * 0.02;
        this.brightness = 0.5 + Math.random() * 0.3;
        this.connectedThreads = [];
      }
      
      update(time) {
        this.pulse += this.pulseSpeed;
      }
      
      draw(ctx) {
        const pulseSize = this.size * (1 + Math.sin(this.pulse) * 0.3);
        const alpha = this.brightness * (0.7 + Math.sin(this.pulse) * 0.3);
        
        if (this.type === 'consciousness_node') {
          // Draw consciousness node as a more complex shape
          ctx.strokeStyle = `rgba(80, 80, 80, ${alpha})`;
          ctx.lineWidth = 1;
          
          ctx.beginPath();
          const spokes = 6;
          for (let i = 0; i < spokes; i++) {
            const angle = (i / spokes) * Math.PI * 2;
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
              this.x + Math.cos(angle) * pulseSize,
              this.y + Math.sin(angle) * pulseSize
            );
          }
          ctx.stroke();
          
          // Central core
          ctx.fillStyle = `rgba(60, 60, 60, ${alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, pulseSize * 0.3, 0, Math.PI * 2);
          ctx.fill();
        } else {
          // Draw anchor point
          ctx.fillStyle = `rgba(70, 70, 70, ${alpha})`;
          ctx.beginPath();
          ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.strokeStyle = `rgba(60, 60, 60, ${alpha * 0.7})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
      }
    }
    
    const initializeWeaving = () => {
      threads = [];
      weavingPoints = [];
      
      // Create weaving points
      const numAnchors = 8 + Math.floor(Math.random() * 6);
      for (let i = 0; i < numAnchors; i++) {
        const x = width * (0.1 + Math.random() * 0.8);
        const y = height * (0.1 + Math.random() * 0.8);
        weavingPoints.push(new WeavingPoint(x, y, 'anchor'));
      }
      
      // Add consciousness nodes
      const numConsciousnessNodes = 2 + Math.floor(Math.random() * 3);
      for (let i = 0; i < numConsciousnessNodes; i++) {
        const x = width * (0.3 + Math.random() * 0.4);
        const y = height * (0.3 + Math.random() * 0.4);
        weavingPoints.push(new WeavingPoint(x, y, 'consciousness_node'));
      }
      
      // Create warp threads (vertical-ish)
      for (let i = 0; i < weavingPoints.length - 1; i++) {
        const point1 = weavingPoints[i];
        const point2 = weavingPoints[i + 1];
        
        if (Math.abs(point1.x - point2.x) < width * 0.3) {
          const thread = new LightThread(point1.x, point1.y, point2.x, point2.y, 'warp');
          threads.push(thread);
          point1.connectedThreads.push(thread);
          point2.connectedThreads.push(thread);
        }
      }
      
      // Create weft threads (horizontal-ish)
      for (let i = 0; i < weavingPoints.length; i++) {
        for (let j = i + 2; j < weavingPoints.length; j++) {
          const point1 = weavingPoints[i];
          const point2 = weavingPoints[j];
          
          if (Math.abs(point1.y - point2.y) < height * 0.3 && Math.random() < 0.6) {
            const thread = new LightThread(point1.x, point1.y, point2.x, point2.y, 'weft');
            threads.push(thread);
            point1.connectedThreads.push(thread);
            point2.connectedThreads.push(thread);
          }
        }
      }
      
      // Create consciousness threads
      const consciousnessNodes = weavingPoints.filter(p => p.type === 'consciousness_node');
      consciousnessNodes.forEach(node => {
        const nearbyPoints = weavingPoints.filter(p => {
          const dist = Math.sqrt((p.x - node.x) ** 2 + (p.y - node.y) ** 2);
          return dist < 100 && p !== node;
        });
        
        nearbyPoints.forEach(point => {
          if (Math.random() < 0.7) {
            const thread = new LightThread(node.x, node.y, point.x, point.y, 'consciousness');
            threads.push(thread);
            node.connectedThreads.push(thread);
            point.connectedThreads.push(thread);
          }
        });
      });
      
      // Calculate intersections
      for (let i = 0; i < threads.length; i++) {
        for (let j = i + 1; j < threads.length; j++) {
          const t1 = threads[i];
          const t2 = threads[j];
          
          // Simple line intersection check
          const intersection = getLineIntersection(
            t1.startX, t1.startY, t1.endX, t1.endY,
            t2.startX, t2.startY, t2.endX, t2.endY
          );
          
          if (intersection) {
            t1.addIntersection(intersection.x, intersection.y, t2);
            t2.addIntersection(intersection.x, intersection.y, t1);
          }
        }
      }
    };
    
    const getLineIntersection = (x1, y1, x2, y2, x3, y3, x4, y4) => {
      const denom = (x1 - x2) * (y3 - y4) - (y1 - y2) * (x3 - x4);
      if (Math.abs(denom) < 0.0001) return null;
      
      const t = ((x1 - x3) * (y3 - y4) - (y1 - y3) * (x3 - x4)) / denom;
      const u = -((x1 - x2) * (y1 - y3) - (y1 - y2) * (x1 - x3)) / denom;
      
      if (t >= 0 && t <= 1 && u >= 0 && u <= 1) {
        return {
          x: x1 + t * (x2 - x1),
          y: y1 + t * (y2 - y1)
        };
      }
      return null;
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Activate threads in sequence
      const activationWave = Math.sin(time * 0.02) * 0.5 + 0.5;
      threads.forEach((thread, index) => {
        if (index / threads.length < activationWave) {
          thread.isActive = true;
        }
      });
      
      // Update weaving points
      weavingPoints.forEach(point => point.update(time));
      
      // Update threads
      threads.forEach(thread => thread.update(time));
      
      // Update intersection progress
      threads.forEach(thread => {
        thread.intersections.forEach(intersection => {
          intersection.progress = Math.min(1, intersection.progress + 0.02);
        });
      });
      
      // Draw threads
      threads.forEach(thread => thread.draw(ctx, time));
      
      // Draw weaving points
      weavingPoints.forEach(point => point.draw(ctx));
      
      // Draw reality fabric effect
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.05)';
      ctx.lineWidth = 0.3;
      const gridSize = 30;
      
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          const distortion = Math.sin(time * 0.01 + x * 0.01 + y * 0.01) * 2;
          ctx.beginPath();
          ctx.arc(x + distortion, y + distortion, 1, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializeWeaving();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      threads = [];
      weavingPoints = [];
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

export default LightWeaving;

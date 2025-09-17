import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: past and future spiral around eternal now, temporal meditation
// visualization: Past and future spiral around the eternal now, visualizing temporal meditation

const TimeSpiral: React.FC<VisualProps> = ({ width, height }) => {
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
    let temporalMarkers = [];
    
    class TemporalMarker {
      constructor(angle, radius, timeValue, type) {
        this.angle = angle;
        this.radius = radius;
        this.timeValue = timeValue; // negative for past, positive for future
        this.type = type; // 'past', 'present', 'future'
        this.size = 2 + Math.abs(timeValue) * 0.1;
        this.opacity = Math.max(0.2, 1 - Math.abs(timeValue) * 0.02);
        this.phase = Math.random() * Math.PI * 2;
        this.rotationSpeed = this.type === 'past' ? -0.005 : 0.005;
        this.spiralSpeed = this.type === 'past' ? -0.01 : 0.01;
        this.intensity = Math.random() * 0.5 + 0.3;
      }
      
      update(time) {
        this.phase += 0.02;
        this.angle += this.rotationSpeed;
        
        // Spiral motion - past spirals inward, future spirals outward
        if (this.type === 'past') {
          this.radius = Math.max(5, this.radius - 0.05);
        } else if (this.type === 'future') {
          this.radius += 0.03;
        }
      }
      
      draw(ctx, centerX, centerY) {
        const x = centerX + Math.cos(this.angle) * this.radius;
        const y = centerY + Math.sin(this.angle) * this.radius;
        
        const pulseSize = this.size * (1 + Math.sin(this.phase) * 0.2);
        const alpha = this.opacity * this.intensity;
        
        // Different visualization for each time type
        if (this.type === 'present') {
          // Present moment as bright, stable point
          const gradient = ctx.createRadialGradient(x, y, 0, x, y, pulseSize * 3);
          gradient.addColorStop(0, `rgba(80, 80, 80, ${alpha})`);
          gradient.addColorStop(1, `rgba(80, 80, 80, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(x, y, pulseSize * 3, 0, Math.PI * 2);
          ctx.fill();
          
          ctx.fillStyle = `rgba(60, 60, 60, ${alpha})`;
          ctx.beginPath();
          ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
          ctx.fill();
        } else if (this.type === 'past') {
          // Past as fading, inward-spiraling traces
          ctx.strokeStyle = `rgba(70, 70, 70, ${alpha})`;
          ctx.lineWidth = 0.8;
          ctx.setLineDash([2, 3]);
          ctx.beginPath();
          ctx.arc(x, y, pulseSize, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        } else {
          // Future as emerging, expanding possibilities
          ctx.strokeStyle = `rgba(50, 50, 50, ${alpha})`;
          ctx.lineWidth = 1;
          
          // Draw as expanding diamond
          ctx.beginPath();
          ctx.moveTo(x, y - pulseSize);
          ctx.lineTo(x + pulseSize, y);
          ctx.lineTo(x, y + pulseSize);
          ctx.lineTo(x - pulseSize, y);
          ctx.closePath();
          ctx.stroke();
        }
      }
    }
    
    const initializeSpiral = () => {
      temporalMarkers = [];
      
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Create present moment marker
      temporalMarkers.push(new TemporalMarker(0, 0, 0, 'present'));
      
      // Create spiral of past moments
      for (let i = 1; i <= 50; i++) {
        const angle = -i * 0.3; // Negative for counterclockwise (past)
        const radius = i * 3;
        const timeValue = -i;
        temporalMarkers.push(new TemporalMarker(angle, radius, timeValue, 'past'));
      }
      
      // Create spiral of future moments
      for (let i = 1; i <= 50; i++) {
        const angle = i * 0.3; // Positive for clockwise (future)
        const radius = i * 3;
        const timeValue = i;
        temporalMarkers.push(new TemporalMarker(angle, radius, timeValue, 'future'));
      }
    };
    
    const drawSpiralPath = (ctx, centerX, centerY) => {
      // Draw past spiral
      ctx.strokeStyle = 'rgba(70, 70, 70, 0.2)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      
      for (let i = 0; i <= 50; i++) {
        const angle = -i * 0.3;
        const radius = i * 3;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      
      // Draw future spiral
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.2)';
      ctx.lineWidth = 0.8;
      ctx.setLineDash([5, 4]);
      ctx.beginPath();
      
      for (let i = 0; i <= 50; i++) {
        const angle = i * 0.3;
        const radius = i * 3;
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.setLineDash([]);
    };
    
    const drawTemporalFlow = (ctx, centerX, centerY, time) => {
      // Draw flowing energy between time zones
      const flowIntensity = Math.sin(time * 0.02) * 0.5 + 0.5;
      
      // Past to present flow
      ctx.strokeStyle = `rgba(60, 60, 60, ${0.1 + flowIntensity * 0.2})`;
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const startRadius = 30 + flowIntensity * 10;
        const endRadius = 5;
        
        const startX = centerX + Math.cos(angle) * startRadius;
        const startY = centerY + Math.sin(angle) * startRadius;
        const endX = centerX + Math.cos(angle) * endRadius;
        const endY = centerY + Math.sin(angle) * endRadius;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
      
      // Present to future flow
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2;
        const startRadius = 5;
        const endRadius = 30 + (1 - flowIntensity) * 10;
        
        const startX = centerX + Math.cos(angle) * startRadius;
        const startY = centerY + Math.sin(angle) * startRadius;
        const endX = centerX + Math.cos(angle) * endRadius;
        const endY = centerY + Math.sin(angle) * endRadius;
        
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        ctx.stroke();
      }
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Draw spiral paths
      drawSpiralPath(ctx, centerX, centerY);
      
      // Draw temporal flow
      drawTemporalFlow(ctx, centerX, centerY, time);
      
      // Update temporal markers
      temporalMarkers.forEach(marker => marker.update(time));
      
      // Remove markers that have spiraled too far
      temporalMarkers = temporalMarkers.filter(marker => {
        if (marker.type === 'past') {
          return marker.radius > 5;
        } else if (marker.type === 'future') {
          return marker.radius < Math.min(width, height) * 0.4;
        }
        return true;
      });
      
      // Add new temporal markers
      if (Math.random() < 0.1) {
        // Add past marker
        const angle = -Math.random() * 0.5;
        const radius = 100 + Math.random() * 50;
        temporalMarkers.push(new TemporalMarker(angle, radius, -10, 'past'));
        
        // Add future marker
        const futureAngle = Math.random() * 0.5;
        const futureRadius = 20 + Math.random() * 30;
        temporalMarkers.push(new TemporalMarker(futureAngle, futureRadius, 10, 'future'));
      }
      
      // Draw temporal markers
      temporalMarkers.forEach(marker => marker.draw(ctx, centerX, centerY));
      
      // Draw central now meditation circle
      const nowSize = 15 + Math.sin(time * 0.03) * 3;
      ctx.strokeStyle = `rgba(80, 80, 80, 0.6)`;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(centerX, centerY, nowSize, 0, Math.PI * 2);
      ctx.stroke();
      
      // Inner now point
      ctx.fillStyle = `rgba(60, 60, 60, 0.8)`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3, 0, Math.PI * 2);
      ctx.fill();
      
      // Time labels
      ctx.font = '10px serif';
      ctx.fillStyle = 'rgba(60, 60, 60, 0.4)';
      ctx.textAlign = 'center';
      
      ctx.fillText('Past', centerX - 60, centerY + 80);
      ctx.fillText('NOW', centerX, centerY - 35);
      ctx.fillText('Future', centerX + 60, centerY + 80);
      
      // Temporal meditation instruction
      ctx.font = '8px serif';
      ctx.fillStyle = 'rgba(60, 60, 60, 0.3)';
      ctx.fillText('All time exists in the eternal present', centerX, height - 15);
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializeSpiral();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      temporalMarkers = [];
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

export default TimeSpiral;

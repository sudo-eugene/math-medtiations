import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: gentle rhythms of existence, natural flow, harmonious oscillation
// visualization: Multiple wave layers creating gentle interference patterns, like the natural rhythms of breath and heartbeat

const WaveMeditation: React.FC<VisualProps> = ({ width, height }) => {
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
    
    const drawWaveLayer = (amplitude, frequency, speed, phase, opacity, thickness) => {
      ctx.strokeStyle = `rgba(60, 60, 60, ${opacity})`;
      ctx.lineWidth = thickness;
      ctx.beginPath();
      
      for (let x = 0; x <= width; x += 2) {
        const y = height / 2 + 
                  Math.sin((x * frequency) + (time * speed) + phase) * amplitude +
                  Math.sin((x * frequency * 0.5) + (time * speed * 1.3) + phase) * amplitude * 0.3;
        
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    };
    
    const drawBreathingCircles = () => {
      const centerX = width / 2;
      const centerY = height / 2;
      
      // Breathing circles that expand and contract
      for (let i = 0; i < 5; i++) {
        const breathPhase = time * 0.01 + i * 0.5;
        const breathe = Math.sin(breathPhase) * 0.3 + 0.7;
        const radius = (20 + i * 15) * breathe;
        const alpha = (0.8 - i * 0.15) * breathe * 0.3;
        
        ctx.strokeStyle = `rgba(70, 70, 70, ${alpha})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };
    
    const drawFlowingLines = () => {
      // Vertical flowing lines
      ctx.strokeStyle = 'rgba(50, 50, 50, 0.15)';
      ctx.lineWidth = 0.8;
      
      for (let x = 50; x < width; x += 40) {
        ctx.beginPath();
        for (let y = 0; y <= height; y += 3) {
          const offsetX = Math.sin(y * 0.01 + time * 0.02) * 8 +
                         Math.sin(y * 0.005 + time * 0.015) * 4;
          
          if (y === 0) ctx.moveTo(x + offsetX, y);
          else ctx.lineTo(x + offsetX, y);
        }
        ctx.stroke();
      }
    };
    
    const animate = () => {
      // Soft background fade
      ctx.fillStyle = 'rgba(240, 238, 230, 0.15)';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Draw flowing background lines
      drawFlowingLines();
      
      // Draw multiple wave layers with different characteristics
      drawWaveLayer(30, 0.02, 0.03, 0, 0.4, 1.5);          // Primary wave
      drawWaveLayer(20, 0.015, 0.025, Math.PI, 0.3, 1.2);  // Counter wave
      drawWaveLayer(15, 0.025, 0.02, Math.PI/2, 0.25, 1.0); // Harmonic
      drawWaveLayer(25, 0.008, 0.035, Math.PI/4, 0.2, 0.8); // Deep wave
      drawWaveLayer(10, 0.04, 0.04, 0, 0.35, 0.6);          // Surface ripples
      
      // Add breathing center
      drawBreathingCircles();
      
      // Draw wave intersection points
      ctx.fillStyle = 'rgba(80, 80, 80, 0.4)';
      for (let x = 0; x < width; x += 80) {
        const y1 = height / 2 + Math.sin((x * 0.02) + (time * 0.03)) * 30;
        const y2 = height / 2 + Math.sin((x * 0.015) + (time * 0.025) + Math.PI) * 20;
        
        if (Math.abs(y1 - y2) < 10) {
          ctx.beginPath();
          ctx.arc(x, (y1 + y2) / 2, 2, 0, Math.PI * 2);
          ctx.fill();
        }
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
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

export default WaveMeditation;

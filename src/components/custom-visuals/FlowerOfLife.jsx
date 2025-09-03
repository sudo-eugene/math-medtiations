import React, { useEffect, useRef } from 'react';

// Themes: universal trust, childlike openness, merging with collective wisdom
// Visualization: A sacred geometry pattern that shows how individual circles merge into a unified whole, representing the harmony of trust and openness

const FlowerOfLife = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 550;
    canvas.height = 550;
    
    let time = 0;
    
    const drawCircle = (cx, cy, radius, alpha) => {
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(80, 80, 80, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.stroke();
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      time += 0.005;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      const baseRadius = 40;
      
      // Draw central circle
      drawCircle(centerX, centerY, baseRadius, 0.48);
      
      // Draw overlapping circles in hexagonal pattern
      const ringCount = 4;
      for (let ring = 1; ring <= ringCount; ring++) {
        const circles = ring * 6;
        const ringRadius = ring * baseRadius * Math.sqrt(3);
        
        for (let i = 0; i < circles; i++) {
          const angle = (i / circles) * Math.PI * 2;
          const x = centerX + Math.cos(angle) * ringRadius;
          const y = centerY + Math.sin(angle) * ringRadius;
          
          // Add pulsing effect with increased range
          const pulse = Math.sin(time * 2 + ring * 0.5 + i * 0.1) * 0.12;
          const alpha = 0.36 - ring * 0.06 + pulse;
          
          drawCircle(x, y, baseRadius, alpha);
        }
      }
      
      // Draw additional sacred geometry patterns
      // Vesica Piscis
      const vesicaSpacing = baseRadius * 2;
      for (let i = 0; i < 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x1 = centerX + Math.cos(angle) * vesicaSpacing;
        const y1 = centerY + Math.sin(angle) * vesicaSpacing;
        const x2 = centerX + Math.cos(angle + Math.PI) * vesicaSpacing;
        const y2 = centerY + Math.sin(angle + Math.PI) * vesicaSpacing;
        
        ctx.beginPath();
        ctx.arc(x1, y1, vesicaSpacing, 0, Math.PI * 2);
        ctx.arc(x2, y2, vesicaSpacing, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.12)';
        ctx.stroke();
      }
      
      // Add rotating overlay pattern
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(time * 0.1);
      
      for (let i = 0; i < 12; i++) {
        const angle = (i / 12) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(Math.cos(angle) * 200, Math.sin(angle) * 200);
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.06)';
        ctx.stroke();
      }
      
      ctx.restore();
      
      animationId = requestAnimationFrame(animate);
    };
    
    let animationId = requestAnimationFrame(animate);
    
    return () => {
      cancelAnimationFrame(animationId);
      
      // Clear canvas context
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, []);
  
  return (
    <div className="flex items-center justify-center w-full h-full" style={{ backgroundColor: '#F0EEE6' }}>
      <div className="w-[550px] h-[550px] shadow-lg rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default FlowerOfLife;

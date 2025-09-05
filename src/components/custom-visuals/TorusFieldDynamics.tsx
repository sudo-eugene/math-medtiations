import React, { useEffect, useRef } from 'react';

// themes: knowledge brings wisdom, control requires strength, staying centered endures
// visualization: A centered form gains strength through understanding its own nature

const TorusFieldDynamics = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = 550;
    canvas.height = 550;
    
    let time = 0;
    let animationFrameId: number;
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      time += 0.008;
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Draw field lines of growing wisdom
      const fieldLines = 40;
      const toroidalRadius = 120;
      const poloidalRadius = 60;
      
      for (let i = 0; i < fieldLines; i++) {
        const u = (i / fieldLines) * Math.PI * 2;
        
        for (let j = 0; j < fieldLines; j++) {
          const v = (j / fieldLines) * Math.PI * 2;
          
          // Torus parametric equations
          const x = (toroidalRadius + poloidalRadius * Math.cos(v)) * Math.cos(u);
          const y = (toroidalRadius + poloidalRadius * Math.cos(v)) * Math.sin(u);
          const z = poloidalRadius * Math.sin(v);
          
          // Project 3D to 2D with perspective
          const scale = 200 / (200 + z);
          const screenX = centerX + x * scale;
          const screenY = centerY + y * scale * 0.5; // Flatten for top view
          
          // Add dynamic movement
          const phase = time + u * 0.5 + v * 0.5;
          const offset = Math.sin(phase) * 5;
          
          ctx.beginPath();
          ctx.arc(screenX + offset, screenY + offset, 1, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(80, 80, 80, ${0.3 * scale})`;
          ctx.fill();
        }
      }
      
      // Draw energy flow lines
      const flowLines = 20;
      for (let i = 0; i < flowLines; i++) {
        const angle = (i / flowLines) * Math.PI * 2;
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.2)';
        ctx.lineWidth = 1;
        
        for (let t = 0; t < 1; t += 0.01) {
          const radius = toroidalRadius + poloidalRadius * Math.cos(t * Math.PI * 2 * 3 + time);
          const x = centerX + Math.cos(angle + t * Math.PI * 4) * radius;
          const y = centerY + Math.sin(angle + t * Math.PI * 4) * radius * 0.5;
          
          if (t === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
      // Draw the enduring center that gives strength
      const vortexRadius = 30;
      ctx.beginPath();
      ctx.arc(centerX, centerY, vortexRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.5)';
      ctx.lineWidth = 2;
      ctx.stroke();
      
      // Vortex spiral
      ctx.beginPath();
      const spiralTurns = 3;
      for (let i = 0; i < 100; i++) {
        const t = i / 100;
        const angle = t * Math.PI * 2 * spiralTurns - time * 2;
        const radius = vortexRadius * (1 - t);
        
        const x = centerX + Math.cos(angle) * radius;
        const y = centerY + Math.sin(angle) * radius;
        
        if (i === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // Add harmonic rings
      for (let r = 50; r < 250; r += 30) {
        ctx.beginPath();
        ctx.arc(centerX, centerY, r + Math.sin(time + r * 0.01) * 5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.1)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup function that cancels the animation frame
    return () => {
      cancelAnimationFrame(animationFrameId);
      
      // Clear the canvas
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

export default TorusFieldDynamics;
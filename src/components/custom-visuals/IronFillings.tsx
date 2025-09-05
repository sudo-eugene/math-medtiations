import React, { useEffect, useRef } from 'react';

// Themes: wisdom beyond words, service without competition, infinite giving
// Visualization: Particles that align with invisible forces, showing how truth manifests without being named

const IronFillings = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 550;
    const height = canvas.height = 550;
    
    const PARTICLE_COUNT = 30000;
    const particles = [];
    
    // Initialize particles with depth
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        z: Math.random() * 2 - 1, // Depth from -1 to 1
        targetX: 0,
        targetY: 0,
        phase: Math.random() * Math.PI * 2,
        speed: 0.001 + Math.random() * 0.002
      });
    }
    
    let time = 0;
    let isRunning = true;
    
    function animate() {
      if (!isRunning) return;
      
      time += 0.016;
      
      // Clear with depth effect
      ctx.fillStyle = 'rgba(240, 238, 230, 0.05)';
      ctx.fillRect(0, 0, width, height);
      
      const circles = [
        { cx: 275, cy: 200, r: 150 },  // Top circle
        { cx: 275, cy: 350, r: 150 },  // Bottom circle
        { cx: 275, cy: 275, r: 75 }    // Center circle
      ];
      
      particles.forEach(particle => {
        // Update depth
        particle.z = Math.sin(time * 0.5 + particle.phase) * 0.5;
        
        // Find nearest circle point
        let minDist = Infinity;
        circles.forEach(circle => {
          // Point on circle at angle toward particle
          const angle = Math.atan2(particle.y - circle.cy, particle.x - circle.cx);
          const pointX = circle.cx + circle.r * Math.cos(angle);
          const pointY = circle.cy + circle.r * Math.sin(angle);
          
          const dist = Math.sqrt(
            Math.pow(particle.x - pointX, 2) + 
            Math.pow(particle.y - pointY, 2)
          );
          
          if (dist < minDist) {
            minDist = dist;
            particle.targetX = pointX;
            particle.targetY = pointY;
          }
        });
        
        // Move toward target with depth influence
        const depthFactor = 0.5 + particle.z * 0.5;
        particle.x += (particle.targetX - particle.x) * particle.speed * depthFactor;
        particle.y += (particle.targetY - particle.y) * particle.speed * depthFactor;
        
        // Add some organic movement
        particle.x += Math.sin(time + particle.phase) * 0.1;
        particle.y += Math.cos(time + particle.phase) * 0.1;
        
        // Draw particle with depth effects
        const size = 0.3 + particle.z * 0.2;
        const opacity = 0.4 + particle.z * 0.3;
        
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, Math.max(0.1, size), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(51, 51, 51, ${Math.max(0.1, opacity)})`;
        ctx.fill();
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      if (canvas && ctx) {
        ctx.clearRect(0, 0, width, height);
      }
      
      particles.length = 0;
      time = 0;
    };
  }, []);
  
  return (
    <div style={{
      width: '550px',
      height: '550px',
      margin: 'auto',
      backgroundColor: '#f0eee6'
    }}>
      <canvas
        ref={canvasRef}
        style={{
          display: 'block',
          width: '550px',
          height: '550px'
        }}
      />
    </div>
  );
};

export default IronFillings;
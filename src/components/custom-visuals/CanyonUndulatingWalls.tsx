import React, { useEffect, useRef } from 'react';

// Themes: embracing change, freedom from fear, natural timing
// Visualization: Particles flowing along ever-changing walls, showing how freedom comes from accepting impermanence

const CanyonUndulatingWalls = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width = 550;
    const height = canvas.height = 550;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Each particle represents a moment in constant flow
    const PARTICLE_COUNT = 18000;
    const particles = [];
    
    // Create particles that embrace change
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Each finds its own path
      const side = Math.random() < 0.5 ? -1 : 1;
      const y = Math.random() * height;
      
      // Create sine wave walls with varying thickness
      const wavePhase = y * 0.01;
      const waveAmount = Math.sin(wavePhase) * 60 + Math.sin(wavePhase * 3) * 20;
      const wallThickness = 30 + Math.sin(wavePhase * 2) * 15;
      
      const baseX = centerX + side * (60 + waveAmount);
      const offsetX = (Math.random() - 0.5) * wallThickness;
      
      particles.push({
        x: baseX + offsetX,
        y: y,
        z: (Math.random() - 0.5) * 100,
        side: side,
        wavePhase: wavePhase,
        initialY: y,
        drift: Math.random() * Math.PI * 2,
        speed: 0.1 + Math.random() * 0.3
      });
    }
    
    let time = 0;
    let isRunning = true;
    let lastTime = 0;
    const FPS = 15; // Set to 15 frames per second
    const frameDelay = 1000 / FPS; // milliseconds between frames
    
    function animate(currentTime) {
      if (!isRunning) return;
      
      // Calculate time elapsed since last frame
      if (!lastTime) lastTime = currentTime;
      const elapsed = currentTime - lastTime;
      
      // Only update if enough time has passed for next frame
      if (elapsed > frameDelay) {
        // Update time with fixed increment (reduced from 0.016 to 0.008)
        time += 0.008;
        lastTime = currentTime;
        
        // Gentle clearing for flowing effect
        ctx.fillStyle = 'rgba(240, 238, 230, 0.06)';
        ctx.fillRect(0, 0, width, height);
      
      particles.forEach(particle => {
        // Update wave position
        const currentWavePhase = particle.y * 0.01 + time * 0.1;
        const waveAmount = Math.sin(currentWavePhase) * 60 + Math.sin(currentWavePhase * 3) * 20;
        const wallThickness = 30 + Math.sin(currentWavePhase * 2) * 15;
        
        // Calculate target X position
        const targetX = centerX + particle.side * (60 + waveAmount);
        const offset = (Math.sin(particle.drift + time) - 0.5) * wallThickness;
        
        // Smooth movement toward wall position
        particle.x = particle.x * 0.95 + (targetX + offset) * 0.05;
        
        // Vertical movement with slight flow
        particle.y += particle.speed;
        
        // Add depth movement
        particle.z += Math.sin(time * 0.5 + particle.drift) * 0.3;
        
        // Reset particle at bottom
        if (particle.y > height + 20) {
          particle.y = -20;
          particle.drift = Math.random() * Math.PI * 2;
        }
        
        // Draw particle with depth effects
        const depthFactor = 1 + particle.z * 0.01;
        const opacity = 0.4 - Math.abs(particle.z) * 0.0025;
        const size = 0.8 + particle.z * 0.015;
        
        if (opacity > 0 && size > 0) {
          // Create subtle glow for depth
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(51, 51, 51, ${opacity * 0.1})`;
          ctx.fill();
          
          // Main particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(51, 51, 51, ${opacity})`;
          ctx.fill();
        }
      });
      }
      
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      isRunning = false;
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (ctx) {
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
      backgroundColor: '#F0EEE6',
      overflow: 'hidden'
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

export default CanyonUndulatingWalls;

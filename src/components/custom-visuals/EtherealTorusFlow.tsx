import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: source follows itself, ever-flowing nature, return to source
// visualization: Particles flow in an eternal cycle, always returning to their origin

const EtherealTorusFlow: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas size according to project requirements
    canvas.width = width;
    canvas.height = height;
    
    // Set initial background
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Particle storage
    const particles = [];
    // Slightly increase particle count for smoother appearance at slower speeds
    const numParticles = 9000;
    let time = 0;

    // Particle class
    class Particle {
      constructor() {
        this.reset();
      }

      reset() {
        // Random position on a torus
        this.u = Math.random() * Math.PI * 2;
        this.v = Math.random() * Math.PI * 2;
        this.R = 150; // Major radius (scaled down for 550px canvas)
        this.r = 60 + Math.random() * 30; // Minor radius variation
        
        this.size = Math.random() * 1.5 + 0.5;
        this.opacity = Math.random() * 0.8 + 0.2;
        this.speed = Math.random() * 0.001875 + 0.0005; // Increased by another 25%
        
        // Phase offset for natural movement
        this.phase = Math.random() * Math.PI * 2;
      }

      update() {
        // Flow eternally, following source
        this.u += this.speed;
        
        // Ever-flowing nature in constant motion
        const breathingFactor = Math.sin(time + this.phase) * 0.0475; // Increased by another 25%
        this.r += breathingFactor;
        
        // Calculate position
        const x = (this.R + this.r * Math.cos(this.v)) * Math.cos(this.u);
        const y = (this.R + this.r * Math.cos(this.v)) * Math.sin(this.u);
        const z = this.r * Math.sin(this.v);
        
        // Simple 3D to 2D projection
        const scale = 1000 / (1000 + z);
        this.x = x * scale + canvas.width / 2;
        this.y = y * scale + canvas.height / 2;
        
        // Adjust size based on depth
        this.displaySize = this.size * scale;
        
        // Adjust opacity based on position
        this.displayOpacity = this.opacity * (0.5 + 0.5 * Math.sin(this.u));
      }

      draw() {
        ctx.fillStyle = `rgba(40, 40, 40, ${this.displayOpacity})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.displaySize, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    // Create particles
    for (let i = 0; i < numParticles; i++) {
      particles.push(new Particle());
    }

    // Animation timing control variables
    let lastFrameTime = 0;
    const targetFPS = 20; // Equivalent to 50ms setInterval
    const frameInterval = 1000 / targetFPS;
    let animationFrameId = null;
    
    // Animation function with time delta control
    function animate(currentTime) {
      // Initialize lastFrameTime on first frame
      if (!lastFrameTime) {
        lastFrameTime = currentTime;
      }
      
      const deltaTime = currentTime - lastFrameTime;
      
      // Only update animation when enough time has passed (mimics setInterval at 100ms)
      if (deltaTime >= frameInterval) {
        // Use a very transparent fill for smoother trails
        ctx.fillStyle = 'rgba(240, 238, 230, 0.03)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        
        // Set time increment for animation speed
        time += 0.004;
        
        // Update and draw particles
        particles.forEach(particle => {
          particle.update();
          particle.draw();
        });
        
        // Update lastFrameTime, accounting for any remainder to prevent drift
        lastFrameTime = currentTime - (deltaTime % frameInterval);
      }
      
      // Continue animation loop
      animationFrameId = requestAnimationFrame(animate);
    }

    // Start animation
    animationFrameId = requestAnimationFrame(animate);

    // Cleanup function
    return () => {
      // Cancel animation frame to prevent memory leaks
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      // Clear canvas context
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Clear particles array to prevent memory leaks
      particles.length = 0;
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
      border: '1px solid rgba(0, 0, 0, 0.1)',
      boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
      borderRadius: '8px',
      overflow: 'hidden'
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default EtherealTorusFlow;

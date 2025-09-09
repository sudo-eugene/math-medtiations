import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: shrink to expand, weaken to strengthen, subtle perception
// visualization: Forms contract to find expansion, discovering strength through yielding

const ParticleReverie: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    
    // Parameters
    const numParticles = 5000;
    let time = 65;
    let startTime = Date.now();
    
    // Pre-calculate initial state to match frame 65 exactly
    const initialT = 65;
    
    // Create particles in a formation that matches frame 65 exactly
    const particles = Array(numParticles).fill().map((_, i) => {
      const angle1 = (i / numParticles) * Math.PI * 2;
      const angle2 = Math.random() * Math.PI * 2;
      
      // Base shape parameters
      const baseScale = 120;
      
      // Initial organic shape - matching exactly the shape at frame 65
      const initialMorphFactor = Math.sin(initialT * 0.2) * 0.5 + 0.5;
      
      // Calculate shape 1 position at frame 65
      const r1 = baseScale * (1 + 0.3 * Math.sin(angle1 * 2));
      const shape1X = r1 * Math.cos(angle1) * (1 + 0.2 * Math.sin(angle1 * 3 + initialT * 0.1));
      const shape1Y = r1 * Math.sin(angle1) * (1 + 0.4 * Math.cos(angle1 * 3 + initialT * 0.2));
      
      // Calculate shape 2 position at frame 65
      const r2 = baseScale * (1 + 0.4 * Math.sin(angle2 * 3));
      const shape2X = r2 * Math.cos(angle2) * (1 + 0.3 * Math.sin(angle2 * 2 + initialT * 0.15));
      const shape2Y = r2 * Math.sin(angle2) * (1 + 0.2 * Math.cos(angle2 * 4 + initialT * 0.25));
      
      // Position using same calculation as in calculateTargets
      let x = width/2 + (shape1X * (1 - initialMorphFactor) + shape2X * initialMorphFactor);
      let y = height/2 + (shape1Y * (1 - initialMorphFactor) + shape2Y * initialMorphFactor);
      
      // Add bulge effect
      const initialBulgeAmount = 50 * (Math.sin(initialT * 0.3) * 0.2 + 0.8);
      const bulgeX = initialBulgeAmount * Math.exp(-Math.pow(angle1 - Math.PI * 0.5, 2));
      const bulgeY = initialBulgeAmount * 0.5 * Math.exp(-Math.pow(angle1 - Math.PI * 0.5, 2));
      
      x += bulgeX * Math.sin(initialT * 0.4);
      y += bulgeY * Math.cos(initialT * 0.3);
      
      return {
        x,
        y,
        size: Math.random() * 1.5 + 0.5,
        connections: [],
        targetX: 0,
        targetY: 0,
        vx: 0,
        vy: 0,
        angle: angle2
      };
    });
    
    // Calculate how forms must contract to find expansion
    const calculateTargets = (t) => {
      // Calculate animation time separately to create gradual startup
      const animationTime = t - 65 + animationStartTime;
      
      // Gentle startup for morphFactor - starts at actual value but changes smoothly
      const startupEasing = Math.min(1, animationTime / 10); // Ramp up over first 10 time units
      const morphFactor = Math.sin(t * 0.2) * 0.5 + 0.5; // Value between 0 and 1 for morphing
      
      particles.forEach((particle, i) => {
        // Angle for this particle
        const angle1 = (i / numParticles) * Math.PI * 2;
        const angle2 = particle.angle;
        
        // Base shape parameters
        const baseScale = 120;
        const bulgeAmount = 50 * (Math.sin(t * 0.3) * 0.2 + 0.8);
        
        // Shape 1: Organic blob - use startup easing for time-based terms
        const timeEffect1 = t + (animationTime * startupEasing * 0.1); // Gradually introduce time-based movement
        const r1 = baseScale * (1 + 0.3 * Math.sin(angle1 * 2));
        const shape1X = r1 * Math.cos(angle1) * (1 + 0.2 * Math.sin(angle1 * 3 + timeEffect1 * 0.1));
        const shape1Y = r1 * Math.sin(angle1) * (1 + 0.4 * Math.cos(angle1 * 3 + timeEffect1 * 0.2));
        
        // Shape 2: Different organic form - use startup easing for time-based terms
        const timeEffect2 = t + (animationTime * startupEasing * 0.1); // Gradually introduce time-based movement
        const r2 = baseScale * (1 + 0.4 * Math.sin(angle2 * 3));
        const shape2X = r2 * Math.cos(angle2) * (1 + 0.3 * Math.sin(angle2 * 2 + timeEffect2 * 0.15));
        const shape2Y = r2 * Math.sin(angle2) * (1 + 0.2 * Math.cos(angle2 * 4 + timeEffect2 * 0.25));
        
        // Morph between shapes
        particle.targetX = shape1X * (1 - morphFactor) + shape2X * morphFactor;
        particle.targetY = shape1Y * (1 - morphFactor) + shape2Y * morphFactor;
        
        // Add bulge effect - also ease in the time-based movement
        const bulgeX = bulgeAmount * Math.exp(-Math.pow(angle1 - Math.PI * 0.5, 2));
        const bulgeY = bulgeAmount * 0.5 * Math.exp(-Math.pow(angle1 - Math.PI * 0.5, 2));
        
        // Apply startup easing to bulge movement
        particle.targetX += bulgeX * Math.sin(timeEffect1 * 0.4);
        particle.targetY += bulgeY * Math.cos(timeEffect1 * 0.3);
        
        // Add noise for more organic feel
        particle.targetX += (Math.random() - 0.5) * 5;
        particle.targetY += (Math.random() - 0.5) * 5;
      });
    };
    
    // Animation runtime - separate from initialization time
    let animationStartTime = 0;
        
    // Function to update particle positions
    const updateParticles = () => {
      // Calculate animation time separately to create gradual startup
      const animationTime = time - 65 + animationStartTime;
      
      particles.forEach(particle => {
        // Direct interpolation instead of spring physics
        const dx = particle.targetX - (particle.x - width/2);
        const dy = particle.targetY - (particle.y - height/2);
        
        // Gentle linear interpolation (lerp) with gradual startup
        // Start with very slow easing that gradually increases to normal speed
        const startupPhase = Math.min(1, animationTime / 5); // Ramp up over first 5 time units 
        const easing = 0.01 + (0.02 * startupPhase); // Gradually increase from 0.01 to 0.03
        
        particle.x += dx * easing;
        particle.y += dy * easing;
        
        // Reset connections
        particle.connections = [];
      });
    };
    
    // Perceive subtle connections that create strength
    const calculateConnections = () => {
      const maxDist = 25;
      const maxConnections = 3;
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        // Limit connections per particle for performance
        if (p1.connections.length >= maxConnections) continue;
        
        for (let j = i + 1; j < particles.length; j++) {
          const p2 = particles[j];
          
          // Skip if second particle already has max connections
          if (p2.connections.length >= maxConnections) continue;
          
          // Calculate distance
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Connect if close enough and not too many connections
          if (dist < maxDist) {
            p1.connections.push(j);
            p2.connections.push(i);
            
            // Break if max connections reached
            if (p1.connections.length >= maxConnections) break;
          }
        }
      }
    };
    
    // Function to draw everything
    const draw = () => {
      // Clear canvas with background color
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      // Draw connections first (below particles)
      ctx.strokeStyle = 'rgba(51, 51, 51, 0.2)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < particles.length; i++) {
        const p1 = particles[i];
        
        for (let j = 0; j < p1.connections.length; j++) {
          const p2 = particles[p1.connections[j]];
          
          // Draw line
          ctx.beginPath();
          ctx.moveTo(p1.x, p1.y);
          
          // Add slight curve to lines
          const midX = (p1.x + p2.x) / 2;
          const midY = (p1.y + p2.y) / 2;
          const offset = 5 * Math.sin(time * 0.5 + i * 0.01);
          
          ctx.quadraticCurveTo(
            midX + offset, 
            midY + offset, 
            p2.x, 
            p2.y
          );
          
          ctx.stroke();
        }
      }
      
      // Draw particles
      particles.forEach(particle => {
        const distFromCenter = Math.sqrt(
          Math.pow(particle.x - width/2, 2) + 
          Math.pow(particle.y - height/2, 2)
        );
        
        // Opacity based on distance from center for 3D effect
        const opacity = Math.max(0.1, 1 - distFromCenter / 300);
        
        ctx.fillStyle = `rgba(51, 51, 51, ${opacity})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };
    
    // Animation loop with requestAnimationFrame
    let animationFrameId = null;
    let lastFrameTime = 0;
    const targetFPS = 36; // 36fps for enhanced smoothness
    const frameInterval = 1000 / targetFPS;
    
    const animate = (currentTime) => {
      animationFrameId = requestAnimationFrame(animate);
      
      const deltaTime = currentTime - lastFrameTime;
      
      // Only update if enough time has passed
      if (deltaTime >= frameInterval) {
        // Calculate remainder to prevent drift
        const remainder = deltaTime % frameInterval;
        
        // Update lastFrameTime with the time that's been processed
        lastFrameTime = currentTime - remainder;
        
        time += 0.005; // Back to original speed
        
        // Calculate new target positions
        calculateTargets(time);
        
        // Update particle positions
        updateParticles();
        
        // Calculate connections
        calculateConnections();
        
        // Draw everything
        draw();
      }
    };
    
    // Start animation
    animationFrameId = requestAnimationFrame(animate);
    
    return () => {
      // Cancel animation frame to prevent memory leaks
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      // Clear canvas context
      if (ctx) {
        ctx.clearRect(0, 0, width, height);
      }
      
      // Clear particles array to prevent memory leaks
      particles.length = 0;
    };
  }, [width, height]);

  return (
    <div 
      className="flex justify-center items-center bg-[#F0EEE6]"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <canvas 
        ref={canvasRef} 
        width={width} 
        height={height} 
      />
    </div>
  );
};

export default ParticleReverie;
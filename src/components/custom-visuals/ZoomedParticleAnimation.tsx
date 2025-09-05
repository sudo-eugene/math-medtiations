import React, { useEffect, useRef } from 'react';

// Themes: giving without expectation, endless abundance, natural success
// Visualization: A form that continuously gives and receives, showing the cycle of natural abundance

const ZoomedParticleAnimation: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    let animationFrameId: number;
    let time = 0;
   
    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerWidth; // Make it square
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Determine if container is small
    const isSmallContainer = canvas.width < 440;
    
    // Zoomed parameters - focusing on a specific region
    const zoomLevel = isSmallContainer ? 2.5 : 2.5; // Increased zoom by 25% (from original 2.0)
    const zoomOffsetX = canvas.width / 18; // Adjust these to change the focus point
    const zoomOffsetY = canvas.height / 18 - 60;
    
    const particles: Array<{
      x: number;
      y: number;
      speedX: number;
      speedY: number;
      size: number;
      connections: Array<{ particle: any; distance: number; alpha: number }>;
      noiseOffset: number;
      idealSpace: number;
      allowClustering: boolean;
    }> = [];
    
    // Reduce particles for small containers
    const numParticles = isSmallContainer ? 15 : 50;
    const centerX = canvas.width / (2 * zoomLevel) + zoomOffsetX;
    const centerY = canvas.height / (2 * zoomLevel) + zoomOffsetY;
    
    // Initialize particles with adjusted positions for zoom
    for (let i = 0; i < numParticles; i++) {
      const angle = (i / numParticles) * Math.PI * 2;
      const radius = Math.random() * 180 + 80;
      const clusterChance = Math.random();
      const clusterOffset = clusterChance < 0.2 ? 40 : (clusterChance > 0.8 ? -40 : 0);
      
      particles.push({
        x: centerX + Math.cos(angle) * (radius + clusterOffset),
        y: centerY + Math.sin(angle) * (radius + clusterOffset),
        speedX: (Math.random() - 0.5) * 0.05,  // Quartered initial speed
        speedY: (Math.random() - 0.5) * 0.05,  // Quartered initial speed
        size: Math.random() * 1.5 + 0.8,
        connections: [],
        noiseOffset: Math.random() * 1000,
        idealSpace: 60 + Math.random() * 20,
        allowClustering: clusterChance < 0.35
      });
    }
    
    // Adjusted connection distance for zoomed view - reduce for small containers
    const maxConnectionDistance = isSmallContainer ? 200 / zoomLevel : 180 / zoomLevel;
    const fadeZoneWidth = isSmallContainer ? 40 / zoomLevel : 60 / zoomLevel;
    
    const animate = () => {
      time += 0.0025;  // Quartered speed
      
      // Clear canvas
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Clear connections
      particles.forEach(particle => particle.connections = []);
      
      // Find connections between particles
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const distance = Math.sqrt(
            Math.pow(particles[i].x - particles[j].x, 2) +
            Math.pow(particles[i].y - particles[j].y, 2)
          );
          
          if (distance < maxConnectionDistance * zoomLevel) {
            let alpha;
            
            if (distance < (maxConnectionDistance - fadeZoneWidth) * zoomLevel) {
              alpha = Math.min(0.24, 0.36 * (1 - distance / ((maxConnectionDistance - fadeZoneWidth) * zoomLevel)));
            } else {
              const fadeProgress = (distance - (maxConnectionDistance - fadeZoneWidth) * zoomLevel) / (fadeZoneWidth * zoomLevel);
              alpha = 0.24 * Math.pow(1 - fadeProgress, 3);
            }
            
            if (alpha > 0.001) {
              particles[i].connections.push({ particle: particles[j], distance, alpha });
              particles[j].connections.push({ particle: particles[i], distance, alpha });
            }
          }
        }
      }
      
      // Update particles
      particles.forEach((particle) => {
        const noiseScale = 0.001;
        const noiseX = particle.x * noiseScale + particle.noiseOffset;
        const noiseY = particle.y * noiseScale + particle.noiseOffset + 100;
        const noiseVal = 
          Math.sin(noiseX + time) * Math.cos(noiseY - time) + 
          Math.sin(noiseX * 2 + time * 0.6) * Math.cos(noiseY * 2 - time * 0.6) * 0.3;
        
        const noiseMultiplier = isSmallContainer ? 0.0085 : 0.00125;  // Reduce noise for small containers
        particle.speedX += Math.cos(noiseVal * Math.PI * 2) * noiseMultiplier;
        particle.speedY += Math.sin(noiseVal * Math.PI * 2) * noiseMultiplier;
        
        // Attraction to center
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const distanceToCenter = Math.sqrt(dx * dx + dy * dy);
        
        const centerRange = particle.allowClustering ? 130 : 200;
        const minDistance = particle.allowClustering ? 60 : 90;
        
        const centerForceMultiplier = isSmallContainer ? 0.1 : 1.0;  // Reduce center forces for small containers
        
        if (distanceToCenter > centerRange) {
          particle.speedX += dx / distanceToCenter * 0.002 * centerForceMultiplier;
          particle.speedY += dy / distanceToCenter * 0.002 * centerForceMultiplier;
        } else if (distanceToCenter < minDistance) {
          particle.speedX -= dx / distanceToCenter * 0.0025 * centerForceMultiplier;
          particle.speedY -= dy / distanceToCenter * 0.0025 * centerForceMultiplier;
        }
        
        // Particle interactions
        particles.forEach(other => {
          if (other === particle) return;
          
          const dx = particle.x - other.x;
          const dy = particle.y - other.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < particle.idealSpace) {
            const force = particle.allowClustering && other.allowClustering ? 
              0.005 : 0.015;
            
            if (distance < particle.idealSpace * 0.7) {
              particle.speedX += dx / distance * force;
              particle.speedY += dy / distance * force;
            }
          }
        });
        
        const damping = isSmallContainer ? 0.97 : 0.98;  // Increase damping for small containers
        particle.speedX *= damping;
        particle.speedY *= damping;
        
        particle.x += particle.speedX;
        particle.y += particle.speedY;
        
        // Handle screen boundaries - use soft boundaries for small containers to prevent flickering
        if (isSmallContainer) {
          // Soft boundaries - push particles back instead of wrapping
          const boundary = 50;
          const screenWidth = canvas.width / zoomLevel;
          const screenHeight = canvas.height / zoomLevel;
          
          if (particle.x < boundary) {
            particle.speedX += (boundary - particle.x) * 0.01;
          }
          if (particle.x > screenWidth - boundary) {
            particle.speedX -= (particle.x - (screenWidth - boundary)) * 0.01;
          }
          if (particle.y < boundary) {
            particle.speedY += (boundary - particle.y) * 0.01;
          }
          if (particle.y > screenHeight - boundary) {
            particle.speedY -= (particle.y - (screenHeight - boundary)) * 0.01;
          }
        } else {
          // Original wrap around for larger containers
          if (particle.x < 0) particle.x += canvas.width / zoomLevel;
          if (particle.x > canvas.width / zoomLevel) particle.x -= canvas.width / zoomLevel;
          if (particle.y < 0) particle.y += canvas.height / zoomLevel;
          if (particle.y > canvas.height / zoomLevel) particle.y -= canvas.height / zoomLevel;
        }
      });
      
      // Apply zoom transformation
      ctx.save();
      ctx.translate(-zoomOffsetX * zoomLevel, -zoomOffsetY * zoomLevel);
      ctx.scale(zoomLevel, zoomLevel);
      
      // Draw connections
      ctx.lineWidth = 1 / zoomLevel;
      ctx.lineCap = 'round';
      
      particles.forEach(particle => {
        particle.connections.forEach(conn => {
          ctx.strokeStyle = `rgba(0, 0, 0, ${conn.alpha})`;
          ctx.beginPath();
          ctx.moveTo(particle.x, particle.y);
          ctx.lineTo(conn.particle.x, conn.particle.y);
          ctx.stroke();
        });
      });
      
      // Draw particles
      particles.forEach(particle => {
        const distanceToCenter = Math.sqrt(
          Math.pow(particle.x - centerX, 2) +
          Math.pow(particle.y - centerY, 2)
        );
        const alphaVariation = isSmallContainer ? 0.4 : 0.5;  // Reduce alpha variation for small containers
        const alpha = Math.max(0.3, Math.min(0.7, 1 - distanceToCenter / (500 + alphaVariation * 100)));
        
        ctx.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      ctx.restore();
      
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
      window.removeEventListener('resize', resizeCanvas);
      
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      particles.length = 0;
      time = 0;
    };
  }, []);
  
  return (
    <canvas 
      ref={canvasRef}
      style={{ width: '100%', height: 'auto', background: '#F0EEE6' }}
    />
  );
};

export default ZoomedParticleAnimation;
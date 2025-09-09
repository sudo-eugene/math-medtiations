import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: excess leads to loss, detachment after completion, the way of heaven
// visualization: Particles flow naturally downward, neither clinging nor overflowing

const CanyonMultiLayerFlows: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;
    const centerX = width / 2;
    const centerY = height / 2;
    
    const PARTICLE_COUNT = 20000;  // Reduced particle count for softer look
    const WALL_LAYERS = 8;
    const particles = [];
    
    // Create particles - balanced between fullness and emptiness
    for (let i = 0; i < PARTICLE_COUNT; i++) {
      // Determine wall side (-1 or 1) and layer
      const side = Math.random() < 0.5 ? -1 : 1;
      const layer = Math.floor(Math.random() * WALL_LAYERS);
      const y = Math.random() * height;
      
      // Create multiple wave functions for complex undulations
      const wavePhase1 = y * 0.008;
      const wavePhase2 = y * 0.03;
      const wavePhase3 = y * 0.05;
      
      const baseWave = Math.sin(wavePhase1) * 50;
      const secondaryWave = Math.sin(wavePhase2 * 2 + layer * 0.5) * 25;
      const tertiaryWave = Math.sin(wavePhase3 * 3 + layer * 1.2) * 12;
      
      const combinedWave = baseWave + secondaryWave + tertiaryWave;
      const layerDepth = layer * 15;
      const wallThickness = 20 + layer * 8;
      
      const baseX = centerX + side * (80 + combinedWave + layerDepth);
      const offsetX = (Math.random() - 0.5) * wallThickness;
      
      particles.push({
        x: baseX + offsetX,
        y: y,
        z: (layer - WALL_LAYERS/2) * 20 + (Math.random() - 0.5) * 15,
        side: side,
        layer: layer,
        initialY: y,
        drift: Math.random() * Math.PI * 2,
        speed: 0.1 + layer * 0.02,
        brightness: 0.7 + Math.random() * 0.3
      });
    }
    
    let time = 0;
    
    function animate() {
      time += 0.016;
      
      // Clear with subtle persistence
      ctx.fillStyle = 'rgba(240, 238, 230, 0.05)';  // Increased fade for softer transitions
      ctx.fillRect(0, 0, width, height);
      
      // Sort particles by z-depth for proper layering
      particles.sort((a, b) => a.z - b.z);
      
      particles.forEach(particle => {
        // Calculate complex wave position
        const wavePhase1 = particle.y * 0.008 + time * 0.05;
        const wavePhase2 = particle.y * 0.03 + time * 0.1 + particle.layer * 0.5;
        const wavePhase3 = particle.y * 0.05 + time * 0.15 + particle.layer * 1.2;
        
        const baseWave = Math.sin(wavePhase1) * 50;
        const secondaryWave = Math.sin(wavePhase2 * 2) * 25;
        const tertiaryWave = Math.sin(wavePhase3 * 3) * 12;
        
        const combinedWave = baseWave + secondaryWave + tertiaryWave;
        const layerDepth = particle.layer * 15;
        const wallThickness = 20 + particle.layer * 8;
        
        // Calculate target position with layer offset
        const targetX = centerX + particle.side * (80 + combinedWave + layerDepth);
        const layerDrift = Math.sin(particle.drift + time * 0.5 + particle.layer * 0.3) * wallThickness * 0.5;
        
        // Smooth movement
        particle.x = particle.x * 0.92 + (targetX + layerDrift) * 0.08;
        particle.y += particle.speed;
        
        // Add depth oscillation
        particle.z += Math.sin(time * 0.4 + particle.drift + particle.layer * 0.8) * 0.2;
        
        // Reset at bottom - detachment after completion
        if (particle.y > height + 30) {
          particle.y = -30;
          particle.drift = Math.random() * Math.PI * 2;
        }
        
        // Draw with layer-based effects - following heaven's way of moderation
        const depthFactor = (particle.z + WALL_LAYERS * 10) / (WALL_LAYERS * 20);
        const opacity = 0.25 + depthFactor * 0.15;
        const size = 0.3 + depthFactor * 0.3;  // Base size 0.3, scaling 0.3 to reach max of 0.6
        const brightness = 120 + particle.layer * 3 + particle.brightness * 15;  // Much lighter gray
        
        if (opacity > 0 && size > 0) {
          // Layer-based glow
          if (particle.layer < 3) {
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, size * 1.5, 0, Math.PI * 2);  // Reduced glow radius multiplier from 2 to 1.5
            ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${opacity * 0.1})`;
            ctx.fill();
          }
          
          // Main particle
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${brightness}, ${brightness}, ${brightness}, ${opacity})`;
          ctx.fill();
        }
      });
      
      animationFrameRef.current = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (canvas && ctx) {
        ctx.clearRect(0, 0, width, height);
      }
      particles.length = 0;
    };
  }, [width, height]);
  
  return (
    <div style={{
      width: `${width}px`,
      height: `${height}px`,
      margin: 'auto',
      backgroundColor: '#F0EEE6',
      overflow: 'hidden'
    }}>
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        style={{
          display: 'block',
          width: `${width}px`,
          height: `${height}px`
        }}
      />
    </div>
  );
};

export default CanyonMultiLayerFlows;

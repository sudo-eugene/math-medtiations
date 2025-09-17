import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: quantum observation, wave-particle duality, consciousness creating reality
// visualization: Probability clouds of particles that collapse into definite positions when observed

const QuantumWaveCollapse: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;

    // Quantum particle system
    const particles = [];
    const numParticles = 150;
    let observationWave = 0;
    let time = 0;

    // Initialize quantum particles
    for (let i = 0; i < numParticles; i++) {
      particles.push({
        baseX: Math.random() * width,
        baseY: Math.random() * height,
        x: 0,
        y: 0,
        probability: Math.random(),
        phase: Math.random() * Math.PI * 2,
        waveAmplitude: 20 + Math.random() * 40,
        frequency: 0.5 + Math.random() * 2,
        collapsed: false,
        collapseTime: 0,
        definiteX: 0,
        definiteY: 0
      });
    }

    let animationId = null;

    const animate = () => {
      // Background
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      time += 0.02;
      observationWave = Math.sin(time * 0.3) * 0.5 + 0.5;

      particles.forEach((particle, i) => {
        // Wave function - particles exist in probability clouds
        if (!particle.collapsed || particle.collapseTime < 1) {
          // Quantum superposition state
          const waveX = particle.baseX + Math.sin(time * particle.frequency + particle.phase) * particle.waveAmplitude;
          const waveY = particle.baseY + Math.cos(time * particle.frequency * 1.3 + particle.phase) * particle.waveAmplitude * 0.7;
          
          particle.x = waveX;
          particle.y = waveY;

          // Check for observation/collapse
          if (observationWave > 0.8 && !particle.collapsed) {
            particle.collapsed = true;
            particle.definiteX = particle.x;
            particle.definiteY = particle.y;
            particle.collapseTime = 0;
          }
        }

        // Wave function collapse animation
        if (particle.collapsed) {
          particle.collapseTime += 0.05;
          const collapseProgress = Math.min(1, particle.collapseTime);
          
          // Interpolate from wave state to collapsed state
          particle.x = particle.x + (particle.definiteX - particle.x) * collapseProgress * 0.1;
          particle.y = particle.y + (particle.definiteY - particle.y) * collapseProgress * 0.1;

          // Reset after collapse completes
          if (particle.collapseTime > 2) {
            particle.collapsed = false;
            particle.collapseTime = 0;
            particle.baseX = Math.random() * width;
            particle.baseY = Math.random() * height;
          }
        }

        // Render particle based on quantum state
        if (!particle.collapsed) {
          // Probability cloud rendering
          const cloudSize = 15;
          const alpha = 0.1 * particle.probability;
          
          ctx.fillStyle = `rgba(60, 60, 60, ${alpha})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, cloudSize, 0, Math.PI * 2);
          ctx.fill();

          // Wave interference pattern
          for (let j = i + 1; j < particles.length; j++) {
            const other = particles[j];
            if (!other.collapsed) {
              const dx = particle.x - other.x;
              const dy = particle.y - other.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              
              if (dist < 80) {
                const interference = Math.sin(dist * 0.2 - time * 3) * 0.3 + 0.3;
                ctx.strokeStyle = `rgba(80, 80, 80, ${interference * 0.1})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
              }
            }
          }
        } else {
          // Collapsed particle - definite position
          const size = 3 + particle.collapseTime * 2;
          ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
          ctx.fill();

          // Collapse ripple effect
          if (particle.collapseTime < 0.5) {
            const rippleRadius = particle.collapseTime * 100;
            ctx.strokeStyle = `rgba(60, 60, 60, ${0.5 - particle.collapseTime})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(particle.definiteX, particle.definiteY, rippleRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      // Observation indicator
      const observationAlpha = observationWave * 0.3;
      ctx.fillStyle = `rgba(100, 100, 100, ${observationAlpha})`;
      ctx.fillRect(0, 0, width, height);

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

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
      backgroundColor: '#F0EEE6' 
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default QuantumWaveCollapse;

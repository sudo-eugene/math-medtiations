import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: quantum observation, wave-particle duality, consciousness creating reality
// visualization: Probability clouds of particles that collapse into definite positions when observed

const QuantumWaveCollapse: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const isWhiteSnapshot = (() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const params = new URLSearchParams(window.location.search);
    return window.location.pathname.includes('/snapshot') && params.get('bg') === 'white';
  })();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;

    // Quantum particle system
    type Particle = {
      baseX: number;
      baseY: number;
      targetBaseX: number;
      targetBaseY: number;
      x: number;
      y: number;
      probability: number;
      phase: number;
      waveAmplitude: number;
      baseAmplitude: number;
      frequency: number;
      collapsed: boolean;
      collapseTime: number;
      definiteX: number;
      definiteY: number;
      reintegrating: boolean;
      reintegrationTime: number;
    };

    const particles: Particle[] = [];
    const numParticles = 150;
    let observationWave = 0;
    let time = 0;

    // Initialize quantum particles
    for (let i = 0; i < numParticles; i++) {
      const baseX = Math.random() * width;
      const baseY = Math.random() * height;
      const waveAmplitude = 20 + Math.random() * 40;

      particles.push({
        baseX,
        baseY,
        targetBaseX: baseX,
        targetBaseY: baseY,
        x: baseX,
        y: baseY,
        probability: Math.random(),
        phase: Math.random() * Math.PI * 2,
        waveAmplitude,
        baseAmplitude: waveAmplitude,
        frequency: 0.5 + Math.random() * 2,
        collapsed: false,
        collapseTime: 0,
        definiteX: baseX,
        definiteY: baseY,
        reintegrating: false,
        reintegrationTime: 0,
      });
    }

    let animationId = null;

    const animate = () => {
      ctx.fillStyle = isWhiteSnapshot ? '#ffffff' : '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      time += 0.02;
      observationWave = Math.sin(time * 0.3) * 0.5 + 0.5;

      particles.forEach((particle, i) => {
        // Wave function - particles exist in probability clouds
        if (!particle.collapsed || particle.collapseTime < 1) {
          // Quantum superposition state
          if (!particle.collapsed) {
            if (particle.reintegrating) {
              particle.reintegrationTime += 0.015;
              const easing = Math.min(1, particle.reintegrationTime);
              particle.waveAmplitude = particle.baseAmplitude * (0.2 + easing * 0.8);

              particle.baseX += (particle.targetBaseX - particle.baseX) * 0.02;
              particle.baseY += (particle.targetBaseY - particle.baseY) * 0.02;

              const distance = Math.hypot(particle.targetBaseX - particle.baseX, particle.targetBaseY - particle.baseY);
              if (distance < 2 && easing >= 1) {
                particle.reintegrating = false;
                particle.reintegrationTime = 1;
                particle.baseX = particle.targetBaseX;
                particle.baseY = particle.targetBaseY;
              }
            } else {
              particle.waveAmplitude = particle.waveAmplitude * 0.98 + particle.baseAmplitude * 0.02;
            }
          }

          const waveX = particle.baseX + Math.sin(time * particle.frequency + particle.phase) * particle.waveAmplitude;
          const waveY = particle.baseY + Math.cos(time * particle.frequency * 1.3 + particle.phase) * particle.waveAmplitude * 0.7;
          
          particle.x = waveX;
          particle.y = waveY;

          // Check for observation/collapse
          const collapseProbability = Math.max(0, observationWave - 0.6) * 0.12;
          if (!particle.collapsed && Math.random() < collapseProbability) {
            particle.collapsed = true;
            particle.definiteX = particle.x;
            particle.definiteY = particle.y;
            particle.collapseTime = 0;
            particle.reintegrating = false;
            particle.waveAmplitude = particle.baseAmplitude * 0.2;
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
          if (particle.collapseTime > 1.4) {
            particle.collapsed = false;
            particle.collapseTime = 0;
            particle.reintegrating = true;
            particle.reintegrationTime = 0;
            particle.baseX = particle.definiteX;
            particle.baseY = particle.definiteY;
            particle.targetBaseX = Math.random() * width;
            particle.targetBaseY = Math.random() * height;
            particle.phase = Math.random() * Math.PI * 2;
          }
        }

        // Render particle based on quantum state
        if (!particle.collapsed) {
          // Probability cloud rendering
          const cloudSize = 12 + particle.waveAmplitude * 0.12;
          const alpha = 0.07 + 0.08 * particle.probability;
          
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
              
              if (dist < 70) {
                const interference = Math.sin(dist * 0.18 - time * 2.6) * 0.3 + 0.3;
                ctx.strokeStyle = `rgba(80, 80, 80, ${interference * 0.08})`;
                ctx.lineWidth = 0.8;
                ctx.beginPath();
                ctx.moveTo(particle.x, particle.y);
                ctx.lineTo(other.x, other.y);
                ctx.stroke();
              }
            }
          }
        } else {
          // Collapsed particle - definite position
          const size = 3 + particle.collapseTime * 1.6;
          ctx.fillStyle = 'rgba(35, 35, 35, 0.85)';
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
          ctx.fill();

          // Collapse ripple effect
          if (particle.collapseTime < 0.45) {
            const rippleRadius = particle.collapseTime * 110;
            ctx.strokeStyle = `rgba(60, 60, 60, ${0.45 - particle.collapseTime})`;
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.arc(particle.definiteX, particle.definiteY, rippleRadius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });

      // Observation indicator
      const observationAlpha = observationWave * 0.22;
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
  }, [width, height, isWhiteSnapshot]);

  return (
    <div style={{ 
      width: `${width}px`, 
      height: `${height}px`, 
      backgroundColor: isWhiteSnapshot ? '#ffffff' : '#F0EEE6' 
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default QuantumWaveCollapse;

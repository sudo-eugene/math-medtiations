import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: time dilation, causality loops, entropy gradients, temporal flow
// visualization: Time flowing at different rates creating relativistic effects and causal structures

const TemporalMechanics: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    let time = 0;

    // Time dilation fields (massive objects that curve spacetime)
    const massiveObjects = [
      { x: centerX * 0.3, y: centerY, mass: 1.2, radius: 40 },
      { x: centerX * 1.7, y: centerY * 0.6, mass: 0.8, radius: 30 },
      { x: centerX * 1.2, y: centerY * 1.4, mass: 1.0, radius: 35 },
    ];

    // Temporal particles that experience time dilation
    const temporalParticles = [];
    for (let i = 0; i < 300; i++) {
      temporalParticles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        localTime: 0,
        timeRate: 1,
        worldLine: [],
        entropy: Math.random(),
        causalConnections: []
      });
    }

    // Causal light cones and worldlines
    const causalEvents = [];

    let animationId = null;

    // Calculate gravitational time dilation at a position
    const getTimeDilation = (x, y) => {
      let dilation = 1;
      
      massiveObjects.forEach(obj => {
        const dx = x - obj.x;
        const dy = y - obj.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          // Simplified gravitational time dilation: dt_proper = dt_coordinate * sqrt(1 - 2GM/rc²)
          const gravitationalPotential = obj.mass / Math.max(distance, obj.radius);
          const dilationFactor = Math.sqrt(Math.max(0.1, 1 - gravitationalPotential * 0.1));
          dilation *= dilationFactor;
        }
      });
      
      return dilation;
    };

    // Update temporal particle physics
    const updateTemporalParticles = () => {
      temporalParticles.forEach((particle, i) => {
        // Calculate local time dilation
        particle.timeRate = getTimeDilation(particle.x, particle.y);
        particle.localTime += particle.timeRate * 0.02;
        
        // Gravitational attraction to massive objects
        massiveObjects.forEach(obj => {
          const dx = obj.x - particle.x;
          const dy = obj.y - particle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance > obj.radius) {
            const force = obj.mass / (distance * distance) * 0.1;
            particle.vx += (dx / distance) * force;
            particle.vy += (dy / distance) * force;
          }
        });
        
        // Update position based on local time rate
        particle.x += particle.vx * particle.timeRate;
        particle.y += particle.vy * particle.timeRate;
        
        // Boundary wrapping
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
        
        // Store worldline (particle's path through spacetime)
        particle.worldLine.push({
          x: particle.x,
          y: particle.y,
          time: particle.localTime,
          globalTime: time
        });
        
        // Limit worldline length
        if (particle.worldLine.length > 50) {
          particle.worldLine.shift();
        }
        
        // Entropy increase in high time dilation regions
        if (particle.timeRate < 0.8) {
          particle.entropy += 0.001;
        }
        particle.entropy = Math.min(1, particle.entropy);
        
        // Damping
        particle.vx *= 0.998;
        particle.vy *= 0.998;
      });
    };

    // Create causal events and light cones
    const updateCausalStructure = () => {
      // Randomly create causal events
      if (Math.random() < 0.02) {
        const event = {
          x: Math.random() * width,
          y: Math.random() * height,
          t: time,
          lightConeRadius: 0,
          intensity: 1
        };
        causalEvents.push(event);
      }
      
      // Update light cone expansion
      causalEvents.forEach((event, i) => {
        event.lightConeRadius += 2; // Speed of light in screen units
        event.intensity *= 0.99;
        
        // Remove old events
        if (event.intensity < 0.1) {
          causalEvents.splice(i, 1);
        }
      });
    };

    // Draw spacetime curvature grid
    const drawSpacetimeCurvature = () => {
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.2)';
      ctx.lineWidth = 1;
      
      const gridSize = 40;
      
      // Draw curved spacetime grid
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        for (let y = 0; y < height; y += 5) {
          let curvature = 0;
          
          massiveObjects.forEach(obj => {
            const dx = x - obj.x;
            const dy = y - obj.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
              curvature += obj.mass / distance * 10;
            }
          });
          
          const curvedX = x + Math.sin(curvature * 0.1) * 8;
          
          if (y === 0) ctx.moveTo(curvedX, y);
          else ctx.lineTo(curvedX, y);
        }
        ctx.stroke();
      }
      
      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        for (let x = 0; x < width; x += 5) {
          let curvature = 0;
          
          massiveObjects.forEach(obj => {
            const dx = x - obj.x;
            const dy = y - obj.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance > 0) {
              curvature += obj.mass / distance * 10;
            }
          });
          
          const curvedY = y + Math.sin(curvature * 0.1) * 8;
          
          if (x === 0) ctx.moveTo(x, curvedY);
          else ctx.lineTo(x, curvedY);
        }
        ctx.stroke();
      }
    };

    // Draw massive objects creating time dilation
    const drawMassiveObjects = () => {
      massiveObjects.forEach(obj => {
        // Object core
        ctx.fillStyle = 'rgba(40, 40, 40, 0.8)';
        ctx.beginPath();
        ctx.arc(obj.x, obj.y, obj.radius * 0.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Time dilation field visualization
        for (let r = obj.radius; r < obj.radius * 3; r += 10) {
          const dilationStrength = obj.mass / r;
          const alpha = Math.max(0, dilationStrength * 0.3);
          
          ctx.strokeStyle = `rgba(60, 40, 80, ${alpha})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Ergosphere (region where time flows backward)
        if (obj.mass > 1) {
          ctx.strokeStyle = 'rgba(120, 40, 40, 0.4)';
          ctx.lineWidth = 3;
          ctx.setLineDash([5, 5]);
          ctx.beginPath();
          ctx.arc(obj.x, obj.y, obj.radius * 1.5, 0, Math.PI * 2);
          ctx.stroke();
          ctx.setLineDash([]);
        }
      });
    };

    // Draw temporal particles with worldlines
    const drawTemporalParticles = () => {
      temporalParticles.forEach(particle => {
        // Draw worldline (particle's history through spacetime)
        if (particle.worldLine.length > 1) {
          ctx.strokeStyle = `rgba(70, 70, 70, 0.3)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          particle.worldLine.forEach((point, i) => {
            if (i === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          });
          ctx.stroke();
        }
        
        // Particle visualization colored by time rate and entropy
        const timeColor = Math.floor(particle.timeRate * 255);
        const entropyColor = Math.floor((1 - particle.entropy) * 255);
        const size = 2 + particle.timeRate * 2;
        
        ctx.fillStyle = `rgba(${entropyColor}, ${timeColor}, ${timeColor}, 0.7)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
        
        // Time dilation indicator
        if (particle.timeRate < 0.9) {
          ctx.strokeStyle = `rgba(80, 40, 120, ${(0.9 - particle.timeRate) * 2})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, size * 2, 0, Math.PI * 2);
          ctx.stroke();
        }
      });
    };

    // Draw causal light cones
    const drawCausalLightCones = () => {
      causalEvents.forEach(event => {
        // Future light cone
        ctx.strokeStyle = `rgba(120, 120, 60, ${event.intensity * 0.3})`;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(event.x, event.y, event.lightConeRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Past light cone (dashed)
        ctx.setLineDash([3, 3]);
        ctx.strokeStyle = `rgba(60, 60, 120, ${event.intensity * 0.2})`;
        ctx.beginPath();
        ctx.arc(event.x, event.y, event.lightConeRadius * 0.7, 0, Math.PI * 2);
        ctx.stroke();
        ctx.setLineDash([]);
        
        // Event marker
        ctx.fillStyle = `rgba(200, 200, 100, ${event.intensity})`;
        ctx.beginPath();
        ctx.arc(event.x, event.y, 3, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    // Draw entropy gradient field
    const drawEntropyField = () => {
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      for (let y = 0; y < height; y += 4) {
        for (let x = 0; x < width; x += 4) {
          const dilation = getTimeDilation(x, y);
          
          // Higher entropy in slower time regions
          const entropy = 1 - dilation;
          const intensity = Math.floor(entropy * 50);
          
          const index = (y * width + x) * 4;
          if (index < data.length - 3) {
            data[index] = 240;
            data[index + 1] = 240 - intensity;
            data[index + 2] = 240 - intensity;
            data[index + 3] = intensity;
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);
    };

    const animate = () => {
      // Background
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      time += 1;
      
      // Draw entropy field
      drawEntropyField();
      
      // Draw spacetime curvature
      drawSpacetimeCurvature();
      
      // Update physics
      updateTemporalParticles();
      updateCausalStructure();
      
      // Draw causal structure
      drawCausalLightCones();
      
      // Draw massive objects
      drawMassiveObjects();
      
      // Draw particles and worldlines
      drawTemporalParticles();
      
      // Time flow visualization
      ctx.fillStyle = 'rgba(60, 60, 60, 0.4)';
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Temporal Flow & Causality', centerX, 25);

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

export default TemporalMechanics;

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: celestial harmony, gravitational dance, cosmic synchronization
// visualization: Planets orbiting in mathematical resonances creating intricate geometric patterns

const OrbitalResonance: React.FC<VisualProps> = ({ width, height }) => {
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

    // Orbital system with resonances (like Jupiter's moons)
    const bodies = [
      { radius: 60, speed: 1, size: 8, resonance: 1, trail: [] },    // Io - 1:2:4 resonance
      { radius: 90, speed: 0.5, size: 6, resonance: 2, trail: [] },  // Europa
      { radius: 140, speed: 0.25, size: 7, resonance: 4, trail: [] }, // Ganymede
      { radius: 200, speed: 0.125, size: 5, resonance: 7, trail: [] }, // Callisto
      { radius: 120, speed: 0.33, size: 4, resonance: 3, trail: [] },  // Additional moon
    ];

    // Gravitational influence lines
    const influences = [];

    let animationId = null;

    const drawOrbit = (radius, alpha) => {
      ctx.strokeStyle = `rgba(80, 80, 80, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();
    };

    const drawBody = (x, y, size, alpha, hue) => {
      // Planet/moon body
      ctx.fillStyle = `hsla(${hue}, 20%, 30%, ${alpha})`;
      ctx.beginPath();
      ctx.arc(x, y, size, 0, Math.PI * 2);
      ctx.fill();

      // Orbital glow
      const gradient = ctx.createRadialGradient(x, y, 0, x, y, size * 2);
      gradient.addColorStop(0, `hsla(${hue}, 40%, 50%, ${alpha * 0.3})`);
      gradient.addColorStop(1, `hsla(${hue}, 40%, 50%, 0)`);
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(x, y, size * 2, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawResonanceLines = () => {
      // Draw lines showing gravitational resonances
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          const body1 = bodies[i];
          const body2 = bodies[j];
          
          // Check for resonance relationship
          const ratio = body1.speed / body2.speed;
          const simpleRatio = Math.round(ratio * 4) / 4; // Simplify to quarters
          
          if (Math.abs(ratio - simpleRatio) < 0.1) {
            const angle1 = time * body1.speed;
            const angle2 = time * body2.speed;
            
            const x1 = centerX + Math.cos(angle1) * body1.radius;
            const y1 = centerY + Math.sin(angle1) * body1.radius;
            const x2 = centerX + Math.cos(angle2) * body2.radius;
            const y2 = centerY + Math.sin(angle2) * body2.radius;
            
            // Resonance strength based on orbital alignment
            const alignment = Math.cos(angle1 - angle2 * simpleRatio);
            const strength = (alignment + 1) / 2;
            
            ctx.strokeStyle = `rgba(100, 100, 100, ${strength * 0.3})`;
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.moveTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.stroke();
          }
        }
      }
    };

    const drawEpicycles = () => {
      // Draw epicycle patterns created by resonances
      ctx.strokeStyle = 'rgba(60, 60, 60, 0.2)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < bodies.length - 1; i++) {
        const body1 = bodies[i];
        const body2 = bodies[i + 1];
        
        // Create epicycle from the difference in orbital positions
        const angle1 = time * body1.speed;
        const angle2 = time * body2.speed;
        const diffAngle = angle1 - angle2;
        
        const epicycleRadius = Math.abs(body1.radius - body2.radius) / 4;
        const epicycleCenter = (body1.radius + body2.radius) / 2;
        
        const epicycleX = centerX + Math.cos(diffAngle) * epicycleRadius + Math.cos(angle1 + angle2) * epicycleCenter;
        const epicycleY = centerY + Math.sin(diffAngle) * epicycleRadius + Math.sin(angle1 + angle2) * epicycleCenter;
        
        ctx.beginPath();
        ctx.arc(epicycleX, epicycleY, 3, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const animate = () => {
      // Background with subtle gradient
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height));
      bgGradient.addColorStop(0, '#F2F0E8');
      bgGradient.addColorStop(1, '#E8E6DE');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      time += 0.02;

      // Draw orbital paths
      bodies.forEach((body, i) => {
        drawOrbit(body.radius, 0.1 + i * 0.05);
      });

      // Update and draw orbital trails
      bodies.forEach((body, i) => {
        const angle = time * body.speed;
        const x = centerX + Math.cos(angle) * body.radius;
        const y = centerY + Math.sin(angle) * body.radius;
        
        // Add to trail
        body.trail.push({ x, y, time: time });
        
        // Limit trail length
        if (body.trail.length > 200) {
          body.trail.shift();
        }
        
        // Draw trail
        if (body.trail.length > 1) {
          ctx.strokeStyle = `rgba(80, 80, 80, 0.1)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          for (let j = 0; j < body.trail.length; j++) {
            const point = body.trail[j];
            const alpha = j / body.trail.length * 0.3;
            
            if (j === 0) ctx.moveTo(point.x, point.y);
            else ctx.lineTo(point.x, point.y);
          }
          ctx.stroke();
        }
        
        // Draw body
        const hue = i * 60; // Different colors for each body
        drawBody(x, y, body.size, 0.8, hue);
      });

      // Draw resonance relationships
      drawResonanceLines();

      // Draw epicycle patterns
      drawEpicycles();

      // Central star
      const starPulse = Math.sin(time * 2) * 0.2 + 0.8;
      ctx.fillStyle = `rgba(100, 80, 60, ${starPulse})`;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2);
      ctx.fill();

      // Star corona
      const coronaGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, 25);
      coronaGradient.addColorStop(0, `rgba(120, 100, 80, ${starPulse * 0.3})`);
      coronaGradient.addColorStop(1, 'rgba(120, 100, 80, 0)');
      ctx.fillStyle = coronaGradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, 25, 0, Math.PI * 2);
      ctx.fill();

      // Lagrange points visualization
      for (let i = 0; i < bodies.length - 1; i++) {
        const body1 = bodies[i];
        const body2 = bodies[i + 1];
        const angle1 = time * body1.speed;
        const angle2 = time * body2.speed;
        
        // L4 and L5 Lagrange points (60° ahead and behind)
        const lagrangeRadius = body2.radius;
        const l4Angle = angle2 + Math.PI / 3;
        const l5Angle = angle2 - Math.PI / 3;
        
        const l4x = centerX + Math.cos(l4Angle) * lagrangeRadius;
        const l4y = centerY + Math.sin(l4Angle) * lagrangeRadius;
        const l5x = centerX + Math.cos(l5Angle) * lagrangeRadius;
        const l5y = centerY + Math.sin(l5Angle) * lagrangeRadius;
        
        ctx.fillStyle = 'rgba(80, 80, 80, 0.3)';
        ctx.beginPath();
        ctx.arc(l4x, l4y, 2, 0, Math.PI * 2);
        ctx.arc(l5x, l5y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

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

export default OrbitalResonance;

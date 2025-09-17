// Themes: invisible forces, orbital meditation, cosmic attraction
// Visualisation: Particles spiral into invisible gravitational attractors creating orbital patterns
// Unique mechanism: N-body gravity simulation with invisible mass points and realistic orbital mechanics

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const GravityWells: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const rafRef = useRef<number|undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    // PRNG for deterministic behavior
    let seed = 12847;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    interface Attractor {
      x: number;
      y: number;
      mass: number;
      vx: number;
      vy: number;
    }

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      trail: Array<{x: number, y: number, age: number}>;
      mass: number;
    }

    const attractors: Attractor[] = [];
    const particles: Particle[] = [];
    
    // Create gravity wells (invisible attractors)
    for (let i = 0; i < 4; i++) {
      attractors.push({
        x: random() * width,
        y: random() * height,
        mass: 500 + random() * 1000,
        vx: (random() - 0.5) * 0.1,
        vy: (random() - 0.5) * 0.1
      });
    }

    // Create orbiting particles
    for (let i = 0; i < 30; i++) {
      particles.push({
        x: random() * width,
        y: random() * height,
        vx: (random() - 0.5) * 2,
        vy: (random() - 0.5) * 2,
        trail: [],
        mass: 1
      });
    }

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.06)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;
      const G = 0.5; // Gravitational constant

      // Move attractors slowly
      attractors.forEach(attractor => {
        attractor.x += attractor.vx;
        attractor.y += attractor.vy;
        
        // Boundary reflection
        if (attractor.x < 50 || attractor.x > width - 50) attractor.vx *= -1;
        if (attractor.y < 50 || attractor.y > height - 50) attractor.vy *= -1;
        
        // Keep in bounds
        attractor.x = Math.max(50, Math.min(width - 50, attractor.x));
        attractor.y = Math.max(50, Math.min(height - 50, attractor.y));
      });

      // Update particles with gravity
      particles.forEach(particle => {
        let fx = 0, fy = 0;
        
        // Calculate gravitational forces from all attractors
        attractors.forEach(attractor => {
          const dx = attractor.x - particle.x;
          const dy = attractor.y - particle.y;
          const distSq = dx * dx + dy * dy;
          const dist = Math.sqrt(distSq);
          
          if (dist > 5) { // Avoid singularity
            const force = G * attractor.mass * particle.mass / distSq;
            fx += force * dx / dist;
            fy += force * dy / dist;
          }
        });

        // Apply gravitational acceleration
        particle.vx += fx / particle.mass * 0.016; // 60fps timestep
        particle.vy += fy / particle.mass * 0.016;
        
        // Velocity damping for stability
        particle.vx *= 0.999;
        particle.vy *= 0.999;
        
        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;
        
        // Boundary handling - wrap around
        if (particle.x < 0) particle.x = width;
        if (particle.x > width) particle.x = 0;
        if (particle.y < 0) particle.y = height;
        if (particle.y > height) particle.y = 0;
        
        // Update trail
        particle.trail.push({
          x: particle.x,
          y: particle.y,
          age: 0
        });
        
        // Age trail points and remove old ones
        particle.trail = particle.trail.filter(point => {
          point.age++;
          return point.age < 60;
        });
      });

      // Draw gravity wells (subtle field visualization)
      attractors.forEach((attractor, i) => {
        const pulsePhase = time * 0.5 + i * Math.PI / 2;
        const pulse = Math.sin(pulsePhase) * 0.1 + 0.9;
        
        // Draw field lines
        for (let angle = 0; angle < Math.PI * 2; angle += Math.PI / 12) {
          const radius = 80 * pulse;
          const x = attractor.x + Math.cos(angle) * radius;
          const y = attractor.y + Math.sin(angle) * radius;
          
          ctx.strokeStyle = 'rgba(60,60,60,0.1)';
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.moveTo(attractor.x, attractor.y);
          ctx.lineTo(x, y);
          ctx.stroke();
        }
        
        // Draw concentric field rings
        for (let r = 20; r < 100; r += 20) {
          ctx.strokeStyle = `rgba(60,60,60,${0.08 * (100 - r) / 100})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(attractor.x, attractor.y, r * pulse, 0, Math.PI * 2);
          ctx.stroke();
        }
        
        // Central mass indicator
        ctx.fillStyle = `rgba(40,40,40,0.6)`;
        ctx.beginPath();
        ctx.arc(attractor.x, attractor.y, 4 * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw particle trails
      particles.forEach(particle => {
        if (particle.trail.length > 1) {
          ctx.strokeStyle = 'rgba(80,80,80,0.3)';
          ctx.lineWidth = 1;
          ctx.beginPath();
          
          for (let i = 0; i < particle.trail.length - 1; i++) {
            const point = particle.trail[i];
            const nextPoint = particle.trail[i + 1];
            const alpha = (1 - point.age / 60) * 0.3;
            
            if (i === 0) {
              ctx.moveTo(point.x, point.y);
            } else {
              ctx.lineTo(point.x, point.y);
            }
          }
          ctx.stroke();
        }
      });

      // Draw particles
      particles.forEach(particle => {
        // Calculate speed for size variation
        const speed = Math.sqrt(particle.vx * particle.vx + particle.vy * particle.vy);
        const size = Math.min(3, 1 + speed * 0.1);
        
        ctx.fillStyle = `rgba(70,70,70,0.8)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6', overflow: 'hidden' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

// Differs from others by: Implements realistic N-body gravitational physics with invisible attractors and orbital mechanics - no other visual simulates true gravity dynamics

const metadata = {
  themes: "invisible forces, orbital meditation, cosmic attraction",
  visualisation: "Particles spiral into invisible gravitational attractors creating orbital patterns",
  promptSuggestion: "1. Adjust gravitational strength\n2. Vary attractor masses and positions\n3. Control particle orbital velocities"
};
(GravityWells as any).metadata = metadata;

export default GravityWells;

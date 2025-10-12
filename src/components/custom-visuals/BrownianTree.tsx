// Themes: organic growth, natural gathering, graceful emergence, interconnected flourishing
// Visualisation: Particles gather and bloom into organic fractal patterns like crystal flowers
// Unique mechanism: Diffusion-limited aggregation transformed into meditation on growth

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const BrownianTree: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 98765;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    interface Particle {
      x: number;
      y: number;
      stuck: boolean;
      age: number;
      generation: number;
    }

    interface Walker {
      x: number;
      y: number;
      vx: number;
      vy: number;
      life: number;
    }

    const particles: Particle[] = [];
    const walkers: Walker[] = [];
    const occupancyGrid: boolean[][] = [];
    const gridSize = 4; // Grid resolution for collision detection

    // Initialize occupancy grid
    const gridWidth = Math.ceil(width / gridSize);
    const gridHeight = Math.ceil(height / gridSize);
    for (let i = 0; i < gridWidth; i++) {
      occupancyGrid[i] = new Array(gridHeight).fill(false);
    }

    // Add seed particle in center
    const seedParticle: Particle = {
      x: width / 2,
      y: height / 2,
      stuck: true,
      age: 0,
      generation: 0
    };
    particles.push(seedParticle);
    
    const gridX = Math.floor(seedParticle.x / gridSize);
    const gridY = Math.floor(seedParticle.y / gridSize);
    if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
      occupancyGrid[gridX][gridY] = true;
    }

    // Create new random walker
    const createWalker = (): Walker => {
      const side = Math.floor(random() * 4);
      let x, y;
      
      switch (side) {
        case 0: // Top
          x = random() * width;
          y = 0;
          break;
        case 1: // Right
          x = width;
          y = random() * height;
          break;
        case 2: // Bottom
          x = random() * width;
          y = height;
          break;
        default: // Left
          x = 0;
          y = random() * height;
          break;
      }
      
      return {
        x: x,
        y: y,
        vx: 0,
        vy: 0,
        life: 1000 + random() * 2000
      };
    };

    // Check if position is adjacent to stuck particle
    const isAdjacentToStuck = (x: number, y: number): boolean => {
      const gridX = Math.floor(x / gridSize);
      const gridY = Math.floor(y / gridSize);
      
      for (let dx = -1; dx <= 1; dx++) {
        for (let dy = -1; dy <= 1; dy++) {
          const checkX = gridX + dx;
          const checkY = gridY + dy;
          
          if (checkX >= 0 && checkX < gridWidth && 
              checkY >= 0 && checkY < gridHeight) {
            if (occupancyGrid[checkX][checkY]) {
              return true;
            }
          }
        }
      }
      return false;
    };

    // Initialize with some walkers
    for (let i = 0; i < 8; i++) {
      walkers.push(createWalker());
    }

    const render = (t: number) => {
      // Gentle fade for organic trails
      ctx.fillStyle = 'rgba(240,238,230,0.03)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Update walkers
      walkers.forEach((walker, i) => {
        // Random walk
        walker.vx = (random() - 0.5) * 4;
        walker.vy = (random() - 0.5) * 4;
        
        walker.x += walker.vx;
        walker.y += walker.vy;
        walker.life--;

        // Check for sticking
        if (isAdjacentToStuck(walker.x, walker.y)) {
          // Find nearest stuck particle for generation counting
          let nearestGeneration = 0;
          let minDist = Infinity;
          
          particles.forEach(particle => {
            if (particle.stuck) {
              const dx = walker.x - particle.x;
              const dy = walker.y - particle.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < minDist) {
                minDist = dist;
                nearestGeneration = particle.generation;
              }
            }
          });

          // Stick the walker
          const newParticle: Particle = {
            x: walker.x,
            y: walker.y,
            stuck: true,
            age: 0,
            generation: nearestGeneration + 1
          };
          particles.push(newParticle);

          // Update occupancy grid
          const gridX = Math.floor(walker.x / gridSize);
          const gridY = Math.floor(walker.y / gridSize);
          if (gridX >= 0 && gridX < gridWidth && gridY >= 0 && gridY < gridHeight) {
            occupancyGrid[gridX][gridY] = true;
          }

          // Remove this walker and create a new one
          walkers.splice(i, 1);
          if (walkers.length < 12) {
            walkers.push(createWalker());
          }
        }
        
        // Remove walker if it's too old or too far away
        if (walker.life <= 0 || 
            walker.x < -50 || walker.x > width + 50 ||
            walker.y < -50 || walker.y > height + 50) {
          walkers.splice(i, 1);
          walkers.push(createWalker());
        }
      });

      // Age particles
      particles.forEach(particle => particle.age += 0.02);

      // Draw organic growth structure
      particles.forEach(particle => {
        if (!particle.stuck) return;
        
        const breathe = Math.sin(particle.age + time * 1.2 + particle.x * 0.01) * 0.15 + 1;
        const generationDepth = Math.min(1, particle.generation / 30);
        const baseTone = 80 + generationDepth * 35;
        const size = 3 + Math.min(5, particle.generation * 0.3);
        
        // Ethereal outer glow
        const outerGlow = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 2.5 * breathe
        );
        const glowIntensity = 0.15 + generationDepth * 0.15;
        outerGlow.addColorStop(0, `rgba(${baseTone}, ${baseTone}, ${baseTone}, ${glowIntensity})`);
        outerGlow.addColorStop(1, `rgba(${baseTone}, ${baseTone}, ${baseTone}, 0)`);
        
        ctx.fillStyle = outerGlow;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 2.5 * breathe, 0, Math.PI * 2);
        ctx.fill();
        
        // Soft core
        const coreGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * breathe
        );
        coreGradient.addColorStop(0, `rgba(${baseTone - 10}, ${baseTone - 10}, ${baseTone - 10}, 0.7)`);
        coreGradient.addColorStop(1, `rgba(${baseTone - 10}, ${baseTone - 10}, ${baseTone - 10}, 0.2)`);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * breathe, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw soft connections between nearby particles
      for (let i = 0; i < particles.length; i++) {
        if (!particles[i].stuck) continue;
        
        for (let j = i + 1; j < particles.length; j++) {
          if (!particles[j].stuck) continue;
          
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 20 && Math.abs(particles[i].generation - particles[j].generation) <= 1) {
            const pulse = Math.sin(time * 1.5 + i * 0.1) * 0.05 + 0.95;
            const alpha = Math.max(0, (20 - dist) / 20) * 0.12 * pulse;
            const avgGeneration = (particles[i].generation + particles[j].generation) / 2;
            const tone = 80 + Math.min(1, avgGeneration / 30) * 30;
            
            ctx.strokeStyle = `rgba(${tone}, ${tone}, ${tone}, ${alpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw ethereal wandering particles
      walkers.forEach(walker => {
        const lifeRatio = walker.life / 3000;
        const alpha = lifeRatio * 0.3;
        const size = 1.5 + lifeRatio * 1;
        
        // Soft glow around walker
        const walkerGlow = ctx.createRadialGradient(
          walker.x, walker.y, 0,
          walker.x, walker.y, size * 3
        );
        walkerGlow.addColorStop(0, `rgba(95, 95, 95, ${alpha * 0.6})`);
        walkerGlow.addColorStop(1, `rgba(95, 95, 95, 0)`);
        
        ctx.fillStyle = walkerGlow;
        ctx.beginPath();
        ctx.arc(walker.x, walker.y, size * 3, 0, Math.PI * 2);
        ctx.fill();
      });

      // Reset if tree gets too large
      if (particles.filter(p => p.stuck).length > 400) {
        particles.length = 1; // Keep only seed
        particles[0].generation = 0;
        particles[0].age = 0;
        
        // Reset occupancy grid
        for (let i = 0; i < gridWidth; i++) {
          occupancyGrid[i].fill(false);
        }
        const seedGridX = Math.floor(particles[0].x / gridSize);
        const seedGridY = Math.floor(particles[0].y / gridSize);
        if (seedGridX >= 0 && seedGridX < gridWidth && seedGridY >= 0 && seedGridY < gridHeight) {
          occupancyGrid[seedGridX][seedGridY] = true;
        }
      }

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

// Differs from others by: Implements diffusion-limited aggregation (DLA) with random walking particles forming fractal dendritic structures - no other visual grows fractal trees through particle aggregation

const metadata = {
  themes: "organic growth, natural gathering, graceful emergence, interconnected flourishing",
  visualisation: "Particles gather and bloom into organic fractal patterns like crystal flowers",
  promptSuggestion: "1. Adjust wandering particle flow\n2. Vary growth patterns\n3. Control organic structure visualization"
};
(BrownianTree as any).metadata = metadata;

export default BrownianTree;

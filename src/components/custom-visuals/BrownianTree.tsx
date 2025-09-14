// Themes: aggregation growth, fractal dendrites, diffusion-limited structures
// Visualisation: Aggregating particles form fractal dendritic structures through random walks
// Unique mechanism: Diffusion-limited aggregation (DLA) with random walker particle growth

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
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
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

      // Draw stuck particles (the growing tree)
      particles.forEach(particle => {
        if (!particle.stuck) return;
        
        const pulse = Math.sin(particle.age + particle.x * 0.01) * 0.2 + 0.8;
        const generationColor = Math.min(255, 60 + particle.generation * 8);
        const size = 3 + Math.min(5, particle.generation * 0.3);
        
        // Particle glow based on generation
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 2
        );
        gradient.addColorStop(0, `rgba(${generationColor},${generationColor},${generationColor},0.8)`);
        gradient.addColorStop(1, `rgba(${generationColor},${generationColor},${generationColor},0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 2 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Central particle
        ctx.fillStyle = `rgba(${Math.max(40, generationColor - 20)},${Math.max(40, generationColor - 20)},${Math.max(40, generationColor - 20)},0.9)`;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * pulse, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connections between nearby stuck particles
      ctx.strokeStyle = 'rgba(70,70,70,0.3)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < particles.length; i++) {
        if (!particles[i].stuck) continue;
        
        for (let j = i + 1; j < particles.length; j++) {
          if (!particles[j].stuck) continue;
          
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < 20 && Math.abs(particles[i].generation - particles[j].generation) <= 1) {
            const alpha = Math.max(0, (20 - dist) / 20) * 0.3;
            ctx.globalAlpha = alpha;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      // Draw active walkers
      walkers.forEach(walker => {
        const lifeRatio = walker.life / 3000;
        const alpha = lifeRatio * 0.6;
        
        ctx.fillStyle = `rgba(100,80,80,${alpha})`;
        ctx.beginPath();
        ctx.arc(walker.x, walker.y, 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Trail
        ctx.strokeStyle = `rgba(80,60,60,${alpha * 0.5})`;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.moveTo(walker.x - walker.vx * 3, walker.y - walker.vy * 3);
        ctx.lineTo(walker.x, walker.y);
        ctx.stroke();
      });

      // Display statistics
      const maxGeneration = Math.max(...particles.filter(p => p.stuck).map(p => p.generation));
      ctx.font = '11px serif';
      ctx.fillStyle = 'rgba(60,60,60,0.8)';
      ctx.fillText(`Particles: ${particles.filter(p => p.stuck).length}`, 10, 25);
      ctx.fillText(`Max Generation: ${maxGeneration}`, 10, 40);
      ctx.fillText(`Active Walkers: ${walkers.length}`, 10, 55);

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
  themes: "aggregation growth, fractal dendrites, diffusion-limited structures",
  visualisation: "Aggregating particles form fractal dendritic structures through random walks",
  promptSuggestion: "1. Adjust walker spawn rate and lifetime\n2. Vary sticking probability and conditions\n3. Control fractal growth visualization"
};
(BrownianTree as any).metadata = metadata;

export default BrownianTree;

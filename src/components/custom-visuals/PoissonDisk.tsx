// Themes: natural spacing, organic distribution, harmonious distances
// Visualisation: Particles maintain minimum distance in organic arrangements, creating natural patterns
// Unique mechanism: Poisson disk sampling with relaxation for natural spacing patterns

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const PoissonDisk: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 91837;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    interface Point {
      x: number;
      y: number;
      radius: number;
      age: number;
      vx: number;
      vy: number;
      energy: number;
    }

    const points: Point[] = [];
    const minRadius = 15;
    const maxRadius = 35;
    const maxAttempts = 30;

    // Fast spatial grid for collision detection
    const cellSize = maxRadius * 2;
    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);
    let grid: Point[][];

    const initGrid = () => {
      grid = Array(cols).fill(null).map(() => Array(rows).fill(null).map(() => []));
    };

    const addToGrid = (point: Point) => {
      const col = Math.floor(point.x / cellSize);
      const row = Math.floor(point.y / cellSize);
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        grid[col][row].push(point);
      }
    };

    const removeFromGrid = (point: Point) => {
      const col = Math.floor(point.x / cellSize);
      const row = Math.floor(point.y / cellSize);
      if (col >= 0 && col < cols && row >= 0 && row < rows) {
        const index = grid[col][row].indexOf(point);
        if (index > -1) grid[col][row].splice(index, 1);
      }
    };

    const checkCollision = (x: number, y: number, radius: number, excludePoint?: Point) => {
      const col = Math.floor(x / cellSize);
      const row = Math.floor(y / cellSize);
      
      for (let c = Math.max(0, col - 1); c <= Math.min(cols - 1, col + 1); c++) {
        for (let r = Math.max(0, row - 1); r <= Math.min(rows - 1, row + 1); r++) {
          for (const point of grid[c][r]) {
            if (point === excludePoint) continue;
            const dx = x - point.x;
            const dy = y - point.y;
            const dist = Math.sqrt(dx * dx + dy * dy);
            const minDist = radius + point.radius;
            if (dist < minDist) return true;
          }
        }
      }
      return false;
    };

    // Poisson disk sampling
    const generateInitialPoints = () => {
      initGrid();
      points.length = 0;
      
      const activeList: Point[] = [];
      
      // Initial seed point
      const firstPoint: Point = {
        x: width / 2,
        y: height / 2,
        radius: minRadius + random() * (maxRadius - minRadius),
        age: 0,
        vx: 0,
        vy: 0,
        energy: 1
      };
      points.push(firstPoint);
      activeList.push(firstPoint);
      addToGrid(firstPoint);

      // Generate points using Poisson disk sampling
      while (activeList.length > 0 && points.length < 200) {
        const activeIndex = Math.floor(random() * activeList.length);
        const activePoint = activeList[activeIndex];
        let found = false;

        for (let attempt = 0; attempt < maxAttempts; attempt++) {
          const angle = random() * Math.PI * 2;
          const distance = activePoint.radius * 2 + random() * activePoint.radius;
          const newX = activePoint.x + Math.cos(angle) * distance;
          const newY = activePoint.y + Math.sin(angle) * distance;
          const newRadius = minRadius + random() * (maxRadius - minRadius);

          if (newX >= newRadius && newX < width - newRadius && 
              newY >= newRadius && newY < height - newRadius) {
            
            if (!checkCollision(newX, newY, newRadius)) {
              const newPoint: Point = {
                x: newX,
                y: newY,
                radius: newRadius,
                age: 0,
                vx: (random() - 0.5) * 0.1,
                vy: (random() - 0.5) * 0.1,
                energy: random() * 0.5 + 0.5
              };
              points.push(newPoint);
              activeList.push(newPoint);
              addToGrid(newPoint);
              found = true;
              break;
            }
          }
        }

        if (!found) {
          activeList.splice(activeIndex, 1);
        }
      }
    };

    // Lloyd relaxation for better distribution
    const relax = () => {
      const forces: Array<{fx: number, fy: number}> = [];
      
      points.forEach((point, i) => {
        let fx = 0, fy = 0;
        
        points.forEach((other, j) => {
          if (i === j) return;
          const dx = point.x - other.x;
          const dy = point.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const minDist = point.radius + other.radius;
          
          if (dist > 0 && dist < minDist * 2) {
            const force = (minDist * 1.5 - dist) / (dist * 50);
            fx += dx * force;
            fy += dy * force;
          }
        });
        
        forces.push({fx, fy});
      });
      
      points.forEach((point, i) => {
        removeFromGrid(point);
        point.vx += forces[i].fx;
        point.vy += forces[i].fy;
        point.vx *= 0.9; // Damping
        point.vy *= 0.9;
        point.x += point.vx;
        point.y += point.vy;
        
        // Boundary constraints
        point.x = Math.max(point.radius, Math.min(width - point.radius, point.x));
        point.y = Math.max(point.radius, Math.min(height - point.radius, point.y));
        
        addToGrid(point);
      });
    };

    generateInitialPoints();

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.08)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Update point properties
      points.forEach(point => {
        point.age += 0.02;
        point.energy = 0.7 + Math.sin(point.age + point.x * 0.01) * 0.3;
      });

      // Perform relaxation every few frames
      if (Math.floor(time * 10) % 3 === 0) {
        relax();
      }

      // Draw Voronoi-like connections between nearby points
      ctx.strokeStyle = 'rgba(80,80,80,0.15)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const p1 = points[i];
          const p2 = points[j];
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < (p1.radius + p2.radius) * 2.5) {
            const alpha = Math.max(0, 1 - dist / ((p1.radius + p2.radius) * 2.5));
            ctx.globalAlpha = alpha * 0.2;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      // Draw points with breathing effect
      points.forEach(point => {
        const breathe = Math.sin(time * 0.5 + point.age) * 0.1 + 0.9;
        const currentRadius = point.radius * breathe * point.energy;
        
        // Outer ring
        ctx.strokeStyle = `rgba(60,60,60,${0.4 * point.energy})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(point.x, point.y, currentRadius, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner fill
        ctx.fillStyle = `rgba(80,80,80,${0.2 * point.energy})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, currentRadius * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Central dot
        ctx.fillStyle = `rgba(50,50,50,${0.8 * point.energy})`;
        ctx.beginPath();
        ctx.arc(point.x, point.y, 2, 0, Math.PI * 2);
        ctx.fill();
      });

      // Periodically regenerate pattern
      if (Math.floor(time * 0.1) % 100 === 0) {
        generateInitialPoints();
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

// Differs from others by: Uses Poisson disk sampling algorithm with Lloyd relaxation for natural minimum distance spacing - no other visual implements blue noise sampling

const metadata = {
  themes: "natural spacing, organic distribution, harmonious distances",
  visualisation: "Particles maintain minimum distance in organic arrangements, creating natural patterns",
  promptSuggestion: "1. Adjust minimum distance constraints\n2. Vary relaxation strength\n3. Control breathing patterns"
};
(PoissonDisk as any).metadata = metadata;

export default PoissonDisk;

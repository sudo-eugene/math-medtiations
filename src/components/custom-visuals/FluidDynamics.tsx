// Themes: invisible obstacles, flow meditation, fluid consciousness
// Visualisation: Smoke-like patterns flow around invisible obstacles using fluid simulation
// Unique mechanism: Lattice Boltzmann method for computational fluid dynamics with obstacle interaction

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const FluidDynamics: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 34892;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Lattice Boltzmann fluid simulation
    const gridWidth = Math.floor(width / 4);
    const gridHeight = Math.floor(height / 4);
    
    // Velocity distributions (9 directions)
    const f = Array(gridWidth).fill(null).map(() => 
      Array(gridHeight).fill(null).map(() => new Array(9).fill(0))
    );
    const fNew = Array(gridWidth).fill(null).map(() => 
      Array(gridHeight).fill(null).map(() => new Array(9).fill(0))
    );
    
    // Macroscopic variables
    const rho = Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(1));
    const ux = Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(0));
    const uy = Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(0));
    
    // Obstacle map
    const obstacle = Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(false));
    
    // LBM direction vectors
    const ex = [0, 1, 0, -1, 0, 1, -1, -1, 1];
    const ey = [0, 0, 1, 0, -1, 1, 1, -1, -1];
    const w = [4/9, 1/9, 1/9, 1/9, 1/9, 1/36, 1/36, 1/36, 1/36];
    
    const omega = 1.7; // Relaxation parameter
    
    // Initialize obstacles
    const initObstacles = () => {
      for (let i = 0; i < 6; i++) {
        const cx = Math.floor(random() * gridWidth);
        const cy = Math.floor(random() * gridHeight);
        const radius = 8 + random() * 15;
        
        for (let x = 0; x < gridWidth; x++) {
          for (let y = 0; y < gridHeight; y++) {
            const dx = x - cx;
            const dy = y - cy;
            if (dx * dx + dy * dy < radius * radius) {
              obstacle[x][y] = true;
            }
          }
        }
      }
    };
    
    // Initialize fluid
    const initFluid = () => {
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          if (!obstacle[x][y]) {
            const rho0 = 1.0;
            const ux0 = 0.1 + random() * 0.05; // Base flow velocity
            const uy0 = (random() - 0.5) * 0.02;
            
            rho[x][y] = rho0;
            ux[x][y] = ux0;
            uy[x][y] = uy0;
            
            // Initialize equilibrium distribution
            for (let i = 0; i < 9; i++) {
              const cu = ex[i] * ux0 + ey[i] * uy0;
              const u2 = ux0 * ux0 + uy0 * uy0;
              f[x][y][i] = w[i] * rho0 * (1 + 3 * cu + 4.5 * cu * cu - 1.5 * u2);
            }
          }
        }
      }
    };

    // Equilibrium distribution function
    const equilibrium = (rho: number, ux: number, uy: number, i: number): number => {
      const cu = ex[i] * ux + ey[i] * uy;
      const u2 = ux * ux + uy * uy;
      return w[i] * rho * (1 + 3 * cu + 4.5 * cu * cu - 1.5 * u2);
    };

    // Collision step
    const collide = () => {
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          if (!obstacle[x][y]) {
            // Calculate macroscopic variables
            rho[x][y] = 0;
            ux[x][y] = 0;
            uy[x][y] = 0;
            
            for (let i = 0; i < 9; i++) {
              rho[x][y] += f[x][y][i];
              ux[x][y] += ex[i] * f[x][y][i];
              uy[x][y] += ey[i] * f[x][y][i];
            }
            
            ux[x][y] /= rho[x][y];
            uy[x][y] /= rho[x][y];
            
            // Collision with relaxation
            for (let i = 0; i < 9; i++) {
              const feq = equilibrium(rho[x][y], ux[x][y], uy[x][y], i);
              f[x][y][i] += omega * (feq - f[x][y][i]);
            }
          }
        }
      }
    };

    // Streaming step
    const stream = () => {
      // Copy current state
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          for (let i = 0; i < 9; i++) {
            fNew[x][y][i] = f[x][y][i];
          }
        }
      }
      
      // Stream to neighboring cells
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          for (let i = 1; i < 9; i++) {
            const nx = x + ex[i];
            const ny = y + ey[i];
            
            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
              if (!obstacle[nx][ny]) {
                f[nx][ny][i] = fNew[x][y][i];
              } else {
                // Bounce back from obstacles
                const opposite = [0, 3, 4, 1, 2, 7, 8, 5, 6];
                f[x][y][opposite[i]] = fNew[x][y][i];
              }
            }
          }
        }
      }
    };

    // Apply boundary conditions
    const boundaries = () => {
      // Left boundary - constant inflow
      for (let y = 0; y < gridHeight; y++) {
        if (!obstacle[0][y]) {
          const rho0 = 1.0;
          const ux0 = 0.1;
          const uy0 = 0.0;
          
          rho[0][y] = rho0;
          ux[0][y] = ux0;
          uy[0][y] = uy0;
          
          for (let i = 0; i < 9; i++) {
            f[0][y][i] = equilibrium(rho0, ux0, uy0, i);
          }
        }
      }
      
      // Right boundary - outflow
      for (let y = 0; y < gridHeight; y++) {
        if (!obstacle[gridWidth-1][y]) {
          for (let i = 0; i < 9; i++) {
            f[gridWidth-1][y][i] = f[gridWidth-2][y][i];
          }
        }
      }
    };

    initObstacles();
    initFluid();

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.1)';
      ctx.fillRect(0, 0, width, height);

      // Run fluid simulation steps
      collide();
      stream();
      boundaries();

      // Visualize fluid
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          const pixelX = x * 4;
          const pixelY = y * 4;
          
          if (!obstacle[x][y]) {
            // Visualize velocity magnitude and curl
            const speed = Math.sqrt(ux[x][y] * ux[x][y] + uy[x][y] * uy[x][y]);
            const intensity = Math.min(255, speed * 2000);
            
            // Calculate vorticity (curl)
            let curl = 0;
            if (x > 0 && x < gridWidth-1 && y > 0 && y < gridHeight-1) {
              curl = (uy[x+1][y] - uy[x-1][y]) - (ux[x][y+1] - ux[x][y-1]);
            }
            const vorticity = Math.abs(curl) * 1000;
            
            // Fill 4x4 pixel block
            for (let dx = 0; dx < 4; dx++) {
              for (let dy = 0; dy < 4; dy++) {
                const px = pixelX + dx;
                const py = pixelY + dy;
                if (px < width && py < height) {
                  const idx = (py * width + px) * 4;
                  data[idx] = Math.min(120, 60 + intensity);     // R
                  data[idx + 1] = Math.min(120, 60 + intensity); // G
                  data[idx + 2] = Math.min(120, 60 + intensity); // B
                  data[idx + 3] = Math.min(255, 100 + intensity + vorticity); // A
                }
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Draw obstacles with subtle indication
      ctx.fillStyle = 'rgba(50,50,50,0.3)';
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          if (obstacle[x][y]) {
            ctx.fillRect(x * 4, y * 4, 4, 4);
          }
        }
      }

      // Draw streamlines
      ctx.strokeStyle = 'rgba(70,70,70,0.4)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < 8; i++) {
        let x = 5;
        let y = 10 + i * (gridHeight / 8);
        
        ctx.beginPath();
        ctx.moveTo(x * 4, y * 4);
        
        for (let step = 0; step < 50 && x < gridWidth-1 && y >= 1 && y < gridHeight-1; step++) {
          if (!obstacle[Math.floor(x)][Math.floor(y)]) {
            const gridX = Math.floor(x);
            const gridY = Math.floor(y);
            x += ux[gridX][gridY] * 20;
            y += uy[gridX][gridY] * 20;
            ctx.lineTo(x * 4, y * 4);
          } else {
            break;
          }
        }
        ctx.stroke();
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

// Differs from others by: Implements computational fluid dynamics using Lattice Boltzmann method - no other visual simulates actual fluid flow physics

const metadata = {
  themes: "invisible obstacles, flow meditation, fluid consciousness",
  visualisation: "Smoke-like patterns flow around invisible obstacles using fluid simulation",
  promptSuggestion: "1. Adjust fluid viscosity and flow speed\n2. Vary obstacle shapes and positions\n3. Control streamline visualization"
};
(FluidDynamics as any).metadata = metadata;

export default FluidDynamics;

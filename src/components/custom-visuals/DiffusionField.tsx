// Themes: chemical emergence, pattern formation, reaction-diffusion
// Visualisation: Chemical gradients create emerging patterns through diffusion and reaction
// Unique mechanism: Reaction-diffusion system using Gray-Scott model for pattern formation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const DiffusionField: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 23847;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Gray-Scott reaction-diffusion parameters
    const gridWidth = Math.floor(width / 2);
    const gridHeight = Math.floor(height / 2);
    
    // Chemical concentration grids
    const u = Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(1));
    const v = Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(0));
    const uNext = Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(0));
    const vNext = Array(gridWidth).fill(null).map(() => Array(gridHeight).fill(0));

    // Gray-Scott parameters for different patterns
    let Da = 1.0;    // Diffusion rate of chemical A
    let Db = 0.5;    // Diffusion rate of chemical B  
    let feed = 0.055; // Feed rate
    let kill = 0.062; // Kill rate
    
    const dt = 1.0;

    // Initialize with random perturbations
    const initializeField = () => {
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          u[x][y] = 1.0;
          v[x][y] = 0.0;
          
          // Add random seeds
          if (random() < 0.02) {
            const seedSize = 3 + Math.floor(random() * 5);
            for (let dx = -seedSize; dx <= seedSize; dx++) {
              for (let dy = -seedSize; dy <= seedSize; dy++) {
                const nx = x + dx;
                const ny = y + dy;
                if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
                  const dist = Math.sqrt(dx * dx + dy * dy);
                  if (dist < seedSize) {
                    v[nx][ny] = 0.25 + random() * 0.5;
                    u[nx][ny] = 0.5 - v[nx][ny] * 0.5;
                  }
                }
              }
            }
          }
        }
      }
    };

    // Laplacian operator for diffusion
    const laplacian = (field: number[][], x: number, y: number): number => {
      const center = field[x][y];
      let neighbors = 0;
      let count = 0;
      
      // Von Neumann neighborhood (4-connected)
      const directions = [[-1,0], [1,0], [0,-1], [0,1]];
      
      directions.forEach(([dx, dy]) => {
        const nx = x + dx;
        const ny = y + dy;
        if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
          neighbors += field[nx][ny];
          count++;
        } else {
          neighbors += center; // Neumann boundary condition
          count++;
        }
      });
      
      return neighbors - count * center;
    };

    // Gray-Scott reaction-diffusion step
    const updateReactionDiffusion = () => {
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          const uVal = u[x][y];
          const vVal = v[x][y];
          
          const lapU = laplacian(u, x, y);
          const lapV = laplacian(v, x, y);
          
          // Gray-Scott equations:
          // ∂u/∂t = Da∇²u - uv² + feed(1-u)
          // ∂v/∂t = Db∇²v + uv² - (kill+feed)v
          
          const reaction = uVal * vVal * vVal;
          
          uNext[x][y] = uVal + dt * (Da * lapU - reaction + feed * (1 - uVal));
          vNext[x][y] = vVal + dt * (Db * lapV + reaction - (kill + feed) * vVal);
          
          // Clamp values
          uNext[x][y] = Math.max(0, Math.min(1, uNext[x][y]));
          vNext[x][y] = Math.max(0, Math.min(1, vNext[x][y]));
        }
      }
      
      // Swap buffers
      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          u[x][y] = uNext[x][y];
          v[x][y] = vNext[x][y];
        }
      }
    };

    initializeField();

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.03)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Vary parameters slowly for pattern evolution
      feed = 0.055 + Math.sin(time * 0.1) * 0.01;
      kill = 0.062 + Math.cos(time * 0.07) * 0.008;

      // Run several simulation steps per frame
      for (let step = 0; step < 2; step++) {
        updateReactionDiffusion();
      }

      // Visualize the concentration fields
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;

      for (let x = 0; x < gridWidth; x++) {
        for (let y = 0; y < gridHeight; y++) {
          const uVal = u[x][y];
          const vVal = v[x][y];
          
          // Color based on chemical concentrations
          const intensity = vVal;
          const background = uVal;
          
          const r = Math.floor(60 + intensity * 40 + (1 - background) * 20);
          const g = Math.floor(60 + intensity * 40 + (1 - background) * 20);  
          const b = Math.floor(60 + intensity * 50 + (1 - background) * 30);
          const a = Math.floor(200 + intensity * 55);
          
          // Fill 2x2 pixel block
          for (let dx = 0; dx < 2; dx++) {
            for (let dy = 0; dy < 2; dy++) {
              const px = x * 2 + dx;
              const py = y * 2 + dy;
              if (px < width && py < height) {
                const idx = (py * width + px) * 4;
                data[idx] = r;
                data[idx + 1] = g;
                data[idx + 2] = b;
                data[idx + 3] = a;
              }
            }
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      // Draw concentration gradients as contour lines
      ctx.strokeStyle = 'rgba(70,70,70,0.3)';
      ctx.lineWidth = 1;

      const contourLevels = [0.2, 0.4, 0.6, 0.8];
      contourLevels.forEach(level => {
        ctx.beginPath();
        for (let x = 1; x < gridWidth - 1; x++) {
          for (let y = 1; y < gridHeight - 1; y++) {
            const val = v[x][y];
            
            // Check for contour crossing
            if ((val < level && v[x+1][y] >= level) || (val >= level && v[x+1][y] < level)) {
              ctx.moveTo(x * 2 + 2, y * 2);
              ctx.lineTo(x * 2 + 2, y * 2 + 2);
            }
            if ((val < level && v[x][y+1] >= level) || (val >= level && v[x][y+1] < level)) {
              ctx.moveTo(x * 2, y * 2 + 2);
              ctx.lineTo(x * 2 + 2, y * 2 + 2);
            }
          }
        }
        ctx.stroke();
      });

      // Show flow field (chemical gradients)
      ctx.strokeStyle = 'rgba(50,50,50,0.2)';
      ctx.lineWidth = 0.5;
      
      for (let x = 4; x < gridWidth - 4; x += 6) {
        for (let y = 4; y < gridHeight - 4; y += 6) {
          const gradX = (v[x+1][y] - v[x-1][y]) * 0.5;
          const gradY = (v[x][y+1] - v[x][y-1]) * 0.5;
          const magnitude = Math.sqrt(gradX * gradX + gradY * gradY);
          
          if (magnitude > 0.1) {
            const startX = x * 2;
            const startY = y * 2;
            const endX = startX + gradX * 20;
            const endY = startY + gradY * 20;
            
            ctx.beginPath();
            ctx.moveTo(startX, startY);
            ctx.lineTo(endX, endY);
            ctx.stroke();
          }
        }
      }

      // Occasionally add new perturbations
      if (random() < 0.005) {
        const px = Math.floor(random() * gridWidth);
        const py = Math.floor(random() * gridHeight);
        const perturbRadius = 2 + Math.floor(random() * 4);
        
        for (let dx = -perturbRadius; dx <= perturbRadius; dx++) {
          for (let dy = -perturbRadius; dy <= perturbRadius; dy++) {
            const nx = px + dx;
            const ny = py + dy;
            if (nx >= 0 && nx < gridWidth && ny >= 0 && ny < gridHeight) {
              const dist = Math.sqrt(dx * dx + dy * dy);
              if (dist < perturbRadius) {
                v[nx][ny] = Math.min(1, v[nx][ny] + random() * 0.3);
                u[nx][ny] = Math.max(0, u[nx][ny] - v[nx][ny] * 0.2);
              }
            }
          }
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

// Differs from others by: Implements Gray-Scott reaction-diffusion system for chemical pattern formation - no other visual simulates chemical reaction dynamics

const metadata = {
  themes: "chemical emergence, pattern formation, reaction-diffusion",
  visualisation: "Chemical gradients create emerging patterns through diffusion and reaction",
  promptSuggestion: "1. Adjust reaction parameters for different patterns\n2. Vary diffusion rates and chemical seeding\n3. Control pattern evolution speed"
};
(DiffusionField as any).metadata = metadata;

export default DiffusionField;

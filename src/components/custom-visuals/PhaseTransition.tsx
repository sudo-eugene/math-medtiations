// Themes: transformation, harmony, graceful change, unity and diversity
// Visualisation: Gentle flowing patterns of unity and diversity in harmonious transformation
// Unique mechanism: Ising model Monte Carlo simulation transformed into ethereal meditation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const PhaseTransition: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 19273;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Ising model grid
    const gridSize = 50;
    const spins = Array(gridSize).fill(null).map(() => 
      Array(gridSize).fill(null).map(() => random() > 0.5 ? 1 : -1)
    );

    let temperature = 2.5; // Critical temperature ≈ 2.269
    const J = 1.0; // Coupling constant

    // Calculate total energy of the system
    const calculateEnergy = (): number => {
      let energy = 0;
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const spin = spins[i][j];
          // Sum over nearest neighbors with periodic boundary conditions
          const neighbors = [
            spins[(i + 1) % gridSize][j],
            spins[(i - 1 + gridSize) % gridSize][j],
            spins[i][(j + 1) % gridSize],
            spins[i][(j - 1 + gridSize) % gridSize]
          ];
          energy += -J * spin * neighbors.reduce((sum, neighbor) => sum + neighbor, 0);
        }
      }
      return energy / 2; // Avoid double counting
    };

    // Calculate magnetization
    const calculateMagnetization = (): number => {
      let magnetization = 0;
      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          magnetization += spins[i][j];
        }
      }
      return Math.abs(magnetization) / (gridSize * gridSize);
    };

    // Metropolis algorithm step
    const metropolisStep = () => {
      for (let step = 0; step < gridSize * gridSize; step++) {
        const i = Math.floor(random() * gridSize);
        const j = Math.floor(random() * gridSize);
        
        const currentSpin = spins[i][j];
        const neighbors = [
          spins[(i + 1) % gridSize][j],
          spins[(i - 1 + gridSize) % gridSize][j],
          spins[i][(j + 1) % gridSize],
          spins[i][(j - 1 + gridSize) % gridSize]
        ];
        
        const neighborSum = neighbors.reduce((sum, neighbor) => sum + neighbor, 0);
        const deltaE = 2 * J * currentSpin * neighborSum;
        
        // Accept or reject flip
        if (deltaE < 0 || random() < Math.exp(-deltaE / temperature)) {
          spins[i][j] = -currentSpin;
        }
      }
    };

    const render = (t: number) => {
      // Gentle fade for flowing transitions
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Vary temperature to show phase transition
      temperature = 2.269 + Math.sin(time * 0.1) * 1.5; // Critical temp ± 1.5

      // Run Monte Carlo steps for smooth transformation
      for (let i = 0; i < 8; i++) {
        metropolisStep();
      }

      const magnetization = calculateMagnetization();
      const energy = calculateEnergy();

      // Visualize spins with ethereal softness
      const cellWidth = width / gridSize;
      const cellHeight = height / gridSize;

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const spin = spins[i][j];
          const x = i * cellWidth;
          const y = j * cellHeight;

          // Calculate harmony with neighbors
          const neighbors = [
            spins[(i + 1) % gridSize][j],
            spins[(i - 1 + gridSize) % gridSize][j],
            spins[i][(j + 1) % gridSize],
            spins[i][(j - 1 + gridSize) % gridSize]
          ];
          const neighborAlignment = neighbors.filter(n => n === spin).length / 4;

          // Soft, ethereal colors based on state and harmony
          const centerX = x + cellWidth / 2;
          const centerY = y + cellHeight / 2;
          
          // Add gentle breathing pulse to size
          const breathe = Math.sin(time * 1.5 + i * 0.3 + j * 0.3) * 0.1 + 1;
          const radius = Math.min(cellWidth, cellHeight) * 0.4 * breathe;
          
          // Create gentle gradient for each particle
          const gradient = ctx.createRadialGradient(
            centerX, centerY, 0,
            centerX, centerY, radius * 1.5
          );
          
          if (spin > 0) {
            // Warm, luminous tones for one state
            const warmth = 140 + neighborAlignment * 40;
            const glow = 0.25 + neighborAlignment * 0.35 + Math.sin(time * 2) * 0.1;
            gradient.addColorStop(0, `rgba(${warmth}, ${warmth - 20}, ${warmth - 40}, ${glow})`);
            gradient.addColorStop(1, `rgba(${warmth}, ${warmth - 20}, ${warmth - 40}, 0)`);
          } else {
            // Cool, serene tones for the other state
            const coolness = 120 + neighborAlignment * 40;
            const glow = 0.25 + neighborAlignment * 0.35 + Math.sin(time * 2 + Math.PI) * 0.1;
            gradient.addColorStop(0, `rgba(${coolness - 30}, ${coolness - 10}, ${coolness + 20}, ${glow})`);
            gradient.addColorStop(1, `rgba(${coolness - 30}, ${coolness - 10}, ${coolness + 20}, 0)`);
          }
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
          ctx.fill();
          
          // Add subtle connecting lines between harmonious neighbors
          if (neighborAlignment > 0.5) {
            const connectionGlow = 0.12 * neighborAlignment + Math.sin(time * 2.5) * 0.04;
            ctx.strokeStyle = spin > 0 
              ? `rgba(160, 140, 100, ${connectionGlow})`
              : `rgba(90, 110, 140, ${connectionGlow})`;
            ctx.lineWidth = 0.8;
            
            // Draw gentle connections
            neighbors.forEach((neighbor, idx) => {
              if (neighbor === spin) {
                const [ni, nj] = [
                  [(i + 1) % gridSize, j],
                  [(i - 1 + gridSize) % gridSize, j],
                  [i, (j + 1) % gridSize],
                  [i, (j - 1 + gridSize) % gridSize]
                ][idx];
                const nx = ni * cellWidth + cellWidth / 2;
                const ny = nj * cellHeight + cellHeight / 2;
                
                ctx.beginPath();
                ctx.moveTo(centerX, centerY);
                ctx.lineTo(nx, ny);
                ctx.stroke();
              }
            });
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

// Differs from others by: Implements Ising model Monte Carlo simulation showing order-disorder phase transitions - no other visual models statistical physics critical phenomena

const metadata = {
  themes: "transformation, harmony, graceful change, unity and diversity",
  visualisation: "Gentle flowing patterns of unity and diversity in harmonious transformation",
  promptSuggestion: "1. Adjust transformation rhythm\n2. Vary harmony patterns\n3. Control visual softness and glow"
};
(PhaseTransition as any).metadata = metadata;

export default PhaseTransition;

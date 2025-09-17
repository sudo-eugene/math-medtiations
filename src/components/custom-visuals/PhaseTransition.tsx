// Themes: order-disorder transitions, critical phenomena, statistical physics meditation
// Visualisation: Order-disorder transitions in particle arrangements showing critical behavior
// Unique mechanism: Ising model Monte Carlo simulation with phase transition dynamics

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
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.1)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Vary temperature to show phase transition
      temperature = 2.269 + Math.sin(time * 0.1) * 1.5; // Critical temp ± 1.5

      // Run Monte Carlo steps
      for (let i = 0; i < 5; i++) {
        metropolisStep();
      }

      const magnetization = calculateMagnetization();
      const energy = calculateEnergy();

      // Visualize spins
      const cellWidth = width / gridSize;
      const cellHeight = height / gridSize;

      for (let i = 0; i < gridSize; i++) {
        for (let j = 0; j < gridSize; j++) {
          const spin = spins[i][j];
          const x = i * cellWidth;
          const y = j * cellHeight;

          // Color based on spin and local order
          let neighborAlignment = 0;
          const neighbors = [
            spins[(i + 1) % gridSize][j],
            spins[(i - 1 + gridSize) % gridSize][j],
            spins[i][(j + 1) % gridSize],
            spins[i][(j - 1 + gridSize) % gridSize]
          ];
          neighborAlignment = neighbors.filter(n => n === spin).length / 4;

          const alpha = 0.3 + neighborAlignment * 0.5;
          const intensity = (spin + 1) / 2; // Convert -1,1 to 0,1

          ctx.fillStyle = `rgba(${60 + intensity * 40}, ${60 + intensity * 40}, ${60 + intensity * 40}, ${alpha})`;
          ctx.fillRect(x, y, cellWidth, cellHeight);

          // Draw spin direction indicator
          const centerX = x + cellWidth / 2;
          const centerY = y + cellHeight / 2;
          const arrowSize = Math.min(cellWidth, cellHeight) * 0.3;

          ctx.strokeStyle = `rgba(50,50,50,${0.6 * neighborAlignment})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.moveTo(centerX, centerY);
          
          if (spin > 0) {
            // Up arrow
            ctx.lineTo(centerX, centerY - arrowSize);
            ctx.moveTo(centerX - arrowSize/3, centerY - arrowSize*0.7);
            ctx.lineTo(centerX, centerY - arrowSize);
            ctx.lineTo(centerX + arrowSize/3, centerY - arrowSize*0.7);
          } else {
            // Down arrow
            ctx.lineTo(centerX, centerY + arrowSize);
            ctx.moveTo(centerX - arrowSize/3, centerY + arrowSize*0.7);
            ctx.lineTo(centerX, centerY + arrowSize);
            ctx.lineTo(centerX + arrowSize/3, centerY + arrowSize*0.7);
          }
          ctx.stroke();
        }
      }

      // Draw domain boundaries
      ctx.strokeStyle = 'rgba(40,40,40,0.4)';
      ctx.lineWidth = 2;

      for (let i = 0; i < gridSize - 1; i++) {
        for (let j = 0; j < gridSize - 1; j++) {
          const spin = spins[i][j];
          
          // Check for domain boundary
          if (spins[i + 1][j] !== spin) {
            // Vertical boundary
            ctx.beginPath();
            ctx.moveTo((i + 1) * cellWidth, j * cellHeight);
            ctx.lineTo((i + 1) * cellWidth, (j + 1) * cellHeight);
            ctx.stroke();
          }
          
          if (spins[i][j + 1] !== spin) {
            // Horizontal boundary
            ctx.beginPath();
            ctx.moveTo(i * cellWidth, (j + 1) * cellHeight);
            ctx.lineTo((i + 1) * cellWidth, (j + 1) * cellHeight);
            ctx.stroke();
          }
        }
      }

      // Display system properties
      ctx.font = '12px serif';
      ctx.fillStyle = 'rgba(60,60,60,0.8)';
      ctx.fillText(`Temperature: ${temperature.toFixed(2)}`, 10, 25);
      ctx.fillText(`Magnetization: ${magnetization.toFixed(3)}`, 10, 45);
      ctx.fillText(`Energy: ${(energy / (gridSize * gridSize)).toFixed(2)}`, 10, 65);

      // Phase indicator
      const phase = temperature < 2.269 ? 'Ordered' : 'Disordered';
      const phaseColor = temperature < 2.269 ? 'rgba(80,120,80,0.8)' : 'rgba(120,80,80,0.8)';
      ctx.fillStyle = phaseColor;
      ctx.fillText(`Phase: ${phase}`, 10, 85);

      // Critical temperature line
      if (Math.abs(temperature - 2.269) < 0.1) {
        ctx.fillStyle = 'rgba(120,60,60,0.8)';
        ctx.fillText('~ CRITICAL POINT ~', 10, 105);
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
  themes: "order-disorder transitions, critical phenomena, statistical physics meditation",
  visualisation: "Order-disorder transitions in particle arrangements showing critical behavior",
  promptSuggestion: "1. Adjust temperature cycling range\n2. Vary coupling strength and magnetic field\n3. Control domain boundary visualization"
};
(PhaseTransition as any).metadata = metadata;

export default PhaseTransition;

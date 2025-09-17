// Themes: frustrated magnetism, glassy dynamics, competing interactions
// Visualisation: Magnetic spins create frustrated, glassy dynamics with competing forces
// Unique mechanism: Edwards-Anderson spin glass model with frustrated magnetic interactions

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const SpinGlass: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 65432;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    interface Spin {
      x: number;
      y: number;
      value: number; // -1 or +1
      frustration: number;
      energy: number;
      connections: Array<{target: number, coupling: number}>;
    }

    const numSpins = 80;
    const spins: Spin[] = [];
    const temperature = 0.5;

    // Initialize spins in random positions
    for (let i = 0; i < numSpins; i++) {
      spins.push({
        x: 50 + random() * (width - 100),
        y: 50 + random() * (height - 100),
        value: random() > 0.5 ? 1 : -1,
        frustration: 0,
        energy: 0,
        connections: []
      });
    }

    // Create random couplings between nearby spins (Edwards-Anderson model)
    for (let i = 0; i < spins.length; i++) {
      for (let j = i + 1; j < spins.length; j++) {
        const dx = spins[i].x - spins[j].x;
        const dy = spins[i].y - spins[j].y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 80 && random() < 0.3) {
          // Random coupling strength (can be positive or negative)
          const coupling = (random() - 0.5) * 2;
          
          spins[i].connections.push({target: j, coupling: coupling});
          spins[j].connections.push({target: i, coupling: coupling});
        }
      }
    }

    // Calculate local energy and frustration for each spin
    const updateSpinProperties = () => {
      spins.forEach((spin, i) => {
        let localEnergy = 0;
        let frustrationCount = 0;
        
        spin.connections.forEach(conn => {
          const otherSpin = spins[conn.target];
          const interaction = -conn.coupling * spin.value * otherSpin.value;
          localEnergy += interaction;
          
          // Count frustrated bonds (negative interactions)
          if (interaction > 0) {
            frustrationCount++;
          }
        });
        
        spin.energy = localEnergy;
        spin.frustration = frustrationCount / Math.max(1, spin.connections.length);
      });
    };

    // Spin glass dynamics (simplified Glauber dynamics)
    const updateSpins = () => {
      for (let i = 0; i < 5; i++) {
        const spinIndex = Math.floor(random() * spins.length);
        const spin = spins[spinIndex];
        
        // Calculate energy change if spin flips
        let deltaE = 0;
        spin.connections.forEach(conn => {
          const otherSpin = spins[conn.target];
          deltaE += 2 * conn.coupling * spin.value * otherSpin.value;
        });
        
        // Metropolis criterion
        if (deltaE < 0 || random() < Math.exp(-deltaE / temperature)) {
          spin.value *= -1;
        }
      }
    };

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.08)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      updateSpins();
      updateSpinProperties();

      // Draw connections with frustration indication
      spins.forEach((spin, i) => {
        spin.connections.forEach(conn => {
          const otherSpin = spins[conn.target];
          const interaction = -conn.coupling * spin.value * otherSpin.value;
          const isFrustrated = interaction > 0;
          
          // Color based on coupling strength and frustration
          const alpha = Math.abs(conn.coupling) * 0.5;
          const color = isFrustrated ? 'rgba(120,60,60,' : 'rgba(60,120,60,';
          
          ctx.strokeStyle = color + alpha + ')';
          ctx.lineWidth = Math.abs(conn.coupling) * 2 + 0.5;
          
          // Draw wavy line for frustrated bonds
          ctx.beginPath();
          if (isFrustrated) {
            const segments = 8;
            for (let seg = 0; seg <= segments; seg++) {
              const t = seg / segments;
              const x = spin.x + (otherSpin.x - spin.x) * t;
              const y = spin.y + (otherSpin.y - spin.y) * t + Math.sin(t * Math.PI * 4) * 3;
              
              if (seg === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
          } else {
            ctx.moveTo(spin.x, spin.y);
            ctx.lineTo(otherSpin.x, otherSpin.y);
          }
          ctx.stroke();
        });
      });

      // Draw spins
      spins.forEach(spin => {
        const frustrationLevel = spin.frustration;
        const energyLevel = Math.abs(spin.energy) / 5;
        
        // Spin visualization
        const size = 8 + energyLevel * 4;
        const pulse = Math.sin(time * 2 + spin.x * 0.01) * 0.2 + 0.8;
        
        // Frustration halo
        if (frustrationLevel > 0.3) {
          const gradient = ctx.createRadialGradient(
            spin.x, spin.y, 0,
            spin.x, spin.y, size * 2
          );
          gradient.addColorStop(0, `rgba(150,80,80,${frustrationLevel * 0.3})`);
          gradient.addColorStop(1, 'rgba(150,80,80,0)');
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(spin.x, spin.y, size * 2, 0, Math.PI * 2);
          ctx.fill();
        }
        
        // Spin direction indicator
        const spinColor = spin.value > 0 ? 'rgba(80,80,80,0.8)' : 'rgba(50,50,50,0.8)';
        ctx.fillStyle = spinColor;
        ctx.strokeStyle = 'rgba(40,40,40,0.6)';
        ctx.lineWidth = 1.5;
        
        ctx.beginPath();
        ctx.arc(spin.x, spin.y, size * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Arrow indicating spin direction
        const arrowSize = size * 0.6;
        ctx.strokeStyle = 'rgba(30,30,30,0.8)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        if (spin.value > 0) {
          // Up arrow
          ctx.moveTo(spin.x, spin.y - arrowSize);
          ctx.lineTo(spin.x, spin.y + arrowSize);
          ctx.moveTo(spin.x - arrowSize/2, spin.y - arrowSize/2);
          ctx.lineTo(spin.x, spin.y - arrowSize);
          ctx.lineTo(spin.x + arrowSize/2, spin.y - arrowSize/2);
        } else {
          // Down arrow
          ctx.moveTo(spin.x, spin.y - arrowSize);
          ctx.lineTo(spin.x, spin.y + arrowSize);
          ctx.moveTo(spin.x - arrowSize/2, spin.y + arrowSize/2);
          ctx.lineTo(spin.x, spin.y + arrowSize);
          ctx.lineTo(spin.x + arrowSize/2, spin.y + arrowSize/2);
        }
        ctx.stroke();
      });

      // Display frustration statistics
      const totalFrustration = spins.reduce((sum, spin) => sum + spin.frustration, 0);
      const avgFrustration = totalFrustration / spins.length;
      
      ctx.font = '11px serif';
      ctx.fillStyle = 'rgba(60,60,60,0.8)';
      ctx.fillText(`Avg Frustration: ${avgFrustration.toFixed(3)}`, 10, 25);
      ctx.fillText(`Temperature: ${temperature}`, 10, 40);
      
      const glassyState = avgFrustration > 0.2 ? 'Glassy' : 'Ordered';
      ctx.fillStyle = avgFrustration > 0.2 ? 'rgba(120,60,60,0.8)' : 'rgba(60,120,60,0.8)';
      ctx.fillText(`State: ${glassyState}`, 10, 55);

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

// Differs from others by: Implements Edwards-Anderson spin glass model with frustrated magnetic interactions and glassy dynamics - no other visual models competing magnetic forces

const metadata = {
  themes: "frustrated magnetism, glassy dynamics, competing interactions",
  visualisation: "Magnetic spins create frustrated, glassy dynamics with competing forces",
  promptSuggestion: "1. Adjust temperature and coupling distributions\n2. Vary frustration visualization\n3. Control spin flip dynamics"
};
(SpinGlass as any).metadata = metadata;

export default SpinGlass;

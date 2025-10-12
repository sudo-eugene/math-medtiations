// Themes: interconnection, flowing tensions, graceful balance, inner dynamics
// Visualisation: Particles find balance through gentle connections and flowing relationships
// Unique mechanism: Edwards-Anderson spin glass model transformed into meditation on balance

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
      for (let i = 0; i < 8; i++) {
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
      // Gentle fade for flowing movement
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      updateSpins();
      updateSpinProperties();

      // Draw ethereal connections
      spins.forEach((spin, i) => {
        spin.connections.forEach(conn => {
          const otherSpin = spins[conn.target];
          const interaction = -conn.coupling * spin.value * otherSpin.value;
          const inHarmony = interaction < 0;
          
          // Subtle neutral colors for connections
          const strength = Math.abs(conn.coupling);
          const pulse = Math.sin(time * 1.5 + i * 0.1) * 0.05 + 0.95;
          const alpha = strength * 0.15 * pulse;
          
          // Neutral grays with subtle variation
          const grayTone = inHarmony ? 100 : 80;
          ctx.strokeStyle = `rgba(${grayTone}, ${grayTone}, ${grayTone}, ${alpha})`;
          ctx.lineWidth = strength * 1.2 + 0.3;
          
          // Draw gently flowing lines
          ctx.beginPath();
          const segments = 12;
          for (let seg = 0; seg <= segments; seg++) {
            const t = seg / segments;
            const flowOffset = Math.sin(time * 0.5 + t * Math.PI * 2) * 2;
            const x = spin.x + (otherSpin.x - spin.x) * t;
            const y = spin.y + (otherSpin.y - spin.y) * t + flowOffset;
            
            if (seg === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        });
      });

      // Draw particles with ethereal glow
      spins.forEach((spin, idx) => {
        const energyLevel = Math.abs(spin.energy) / 5;
        const connectionCount = spin.connections.length;
        
        // Gentle breathing pulse
        const breathe = Math.sin(time * 1.2 + idx * 0.2) * 0.15 + 1;
        const size = 7 + energyLevel * 3;
        
        // Subtle ethereal halo based on connections
        const haloSize = size * (1.5 + connectionCount * 0.15);
        const gradient = ctx.createRadialGradient(
          spin.x, spin.y, 0,
          spin.x, spin.y, haloSize * breathe
        );
        
        // Neutral tones - lighter for one state, darker for another
        const baseTone = spin.value > 0 ? 110 : 85;
        const glowIntensity = 0.12 + (connectionCount / 10) * 0.08;
        
        gradient.addColorStop(0, `rgba(${baseTone}, ${baseTone}, ${baseTone}, ${glowIntensity})`);
        gradient.addColorStop(0.5, `rgba(${baseTone}, ${baseTone}, ${baseTone}, ${glowIntensity * 0.4})`);
        gradient.addColorStop(1, `rgba(${baseTone}, ${baseTone}, ${baseTone}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(spin.x, spin.y, haloSize * breathe, 0, Math.PI * 2);
        ctx.fill();
        
        // Core particle with soft edge
        const coreGradient = ctx.createRadialGradient(
          spin.x, spin.y, 0,
          spin.x, spin.y, size * breathe
        );
        
        const coreTone = spin.value > 0 ? 95 : 70;
        coreGradient.addColorStop(0, `rgba(${coreTone}, ${coreTone}, ${coreTone}, 0.7)`);
        coreGradient.addColorStop(1, `rgba(${coreTone}, ${coreTone}, ${coreTone}, 0.2)`);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(spin.x, spin.y, size * breathe, 0, Math.PI * 2);
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

// Differs from others by: Implements Edwards-Anderson spin glass model with frustrated magnetic interactions and glassy dynamics - no other visual models competing magnetic forces

const metadata = {
  themes: "interconnection, flowing tensions, graceful balance, inner dynamics",
  visualisation: "Particles find balance through gentle connections and flowing relationships",
  promptSuggestion: "1. Adjust connection patterns\n2. Vary particle dynamics\n3. Control flow and harmony"
};
(SpinGlass as any).metadata = metadata;

export default SpinGlass;

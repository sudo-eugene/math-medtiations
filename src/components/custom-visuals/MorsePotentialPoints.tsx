// Themes: molecular calm, potential wells, floating points, harmonious attraction
// Visualisation: Particles settle into gentle potential wells, breathing and pulsing together
// Unique mechanism: Morse potential energy landscape guides particle positions with natural settling dynamics
import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const createRng = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  phase: number;
  wellIndex: number;
}

interface PotentialWell {
  x: number;
  y: number;
  depth: number;
  equilibrium: number;
}

const MorsePotentialPoints: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    const rng = createRng(0x6fdc8a31);

    // Create potential wells at different locations
    const wells: PotentialWell[] = [
      { x: width * 0.3, y: height * 0.35, depth: 1.2, equilibrium: 80 },
      { x: width * 0.65, y: height * 0.4, depth: 1.0, equilibrium: 85 },
      { x: width * 0.5, y: height * 0.65, depth: 0.9, equilibrium: 75 },
      { x: width * 0.25, y: height * 0.7, depth: 0.85, equilibrium: 70 },
      { x: width * 0.75, y: height * 0.7, depth: 0.95, equilibrium: 78 }
    ];

    // Morse potential function: V(r) = D * (1 - exp(-a(r - r0)))^2
    const morsePotential = (x: number, y: number, well: PotentialWell): number => {
      const dx = x - well.x;
      const dy = y - well.y;
      const r = Math.sqrt(dx * dx + dy * dy);
      const a = 0.02; // Controls the width of the well
      const De = well.depth;
      return De * Math.pow(1 - Math.exp(-a * (r - well.equilibrium)), 2);
    };

    // Calculate force from Morse potential (negative gradient)
    const morseForce = (x: number, y: number, well: PotentialWell): { fx: number; fy: number } => {
      const dx = x - well.x;
      const dy = y - well.y;
      const r = Math.sqrt(dx * dx + dy * dy) + 0.01;
      const a = 0.02;
      const De = well.depth;
      
      const expTerm = Math.exp(-a * (r - well.equilibrium));
      const force = -2 * De * a * (1 - expTerm) * expTerm / r;
      
      return {
        fx: force * dx,
        fy: force * dy
      };
    };

    // Create particles near potential wells
    const particles: Particle[] = [];
    const particlesPerWell = 80;

    wells.forEach((well, wellIdx) => {
      for (let i = 0; i < particlesPerWell; i++) {
        const angle = rng() * Math.PI * 2;
        const dist = well.equilibrium * (0.5 + rng() * 1.5);
        particles.push({
          x: well.x + Math.cos(angle) * dist,
          y: well.y + Math.sin(angle) * dist,
          vx: (rng() - 0.5) * 0.5,
          vy: (rng() - 0.5) * 0.5,
          size: 2 + rng() * 2,
          phase: rng() * Math.PI * 2,
          wellIndex: wellIdx
        });
      }
    });

    const render = (t: number) => {
      // Gentle fade for trails
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Update particle physics
      particles.forEach(particle => {
        // Calculate forces from all wells
        let totalFx = 0;
        let totalFy = 0;

        wells.forEach(well => {
          const { fx, fy } = morseForce(particle.x, particle.y, well);
          totalFx += fx;
          totalFy += fy;
        });

        // Apply damping for stable settling
        const damping = 0.95;
        particle.vx = (particle.vx + totalFx * 0.1) * damping;
        particle.vy = (particle.vy + totalFy * 0.1) * damping;

        // Update position
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Soft boundary constraints
        if (particle.x < 20 || particle.x > width - 20) particle.vx *= -0.5;
        if (particle.y < 20 || particle.y > height - 20) particle.vy *= -0.5;
        particle.x = Math.max(20, Math.min(width - 20, particle.x));
        particle.y = Math.max(20, Math.min(height - 20, particle.y));
      });

      // Draw ethereal particles
      particles.forEach((particle, idx) => {
        const breathe = Math.sin(time * 1.2 + particle.phase) * 0.15 + 1;
        const size = particle.size * breathe;

        // Calculate depth based on potential energy
        const well = wells[particle.wellIndex];
        const potential = morsePotential(particle.x, particle.y, well);
        const settled = Math.max(0, 1 - potential / 2);
        
        const baseTone = 85 + settled * 20;
        const glowIntensity = 0.15 + settled * 0.15 + Math.sin(time * 1.5 + idx * 0.1) * 0.05;

        // Outer glow
        const gradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size * 2.5
        );
        gradient.addColorStop(0, `rgba(${baseTone}, ${baseTone}, ${baseTone}, ${glowIntensity})`);
        gradient.addColorStop(1, `rgba(${baseTone}, ${baseTone}, ${baseTone}, 0)`);

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size * 2.5, 0, Math.PI * 2);
        ctx.fill();

        // Core particle
        const coreGradient = ctx.createRadialGradient(
          particle.x, particle.y, 0,
          particle.x, particle.y, size
        );
        coreGradient.addColorStop(0, `rgba(${baseTone - 10}, ${baseTone - 10}, ${baseTone - 10}, 0.6)`);
        coreGradient.addColorStop(1, `rgba(${baseTone - 10}, ${baseTone - 10}, ${baseTone - 10}, 0.2)`);

        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw subtle well centers with pulsing glow
      wells.forEach((well, idx) => {
        const pulse = Math.sin(time * 0.8 + idx * 0.5) * 0.2 + 0.8;
        const wellGlow = ctx.createRadialGradient(
          well.x, well.y, 0,
          well.x, well.y, well.equilibrium * pulse
        );
        wellGlow.addColorStop(0, `rgba(95, 95, 95, 0.08)`);
        wellGlow.addColorStop(0.5, `rgba(95, 95, 95, 0.03)`);
        wellGlow.addColorStop(1, `rgba(95, 95, 95, 0)`);

        ctx.fillStyle = wellGlow;
        ctx.beginPath();
        ctx.arc(well.x, well.y, well.equilibrium * pulse, 0, Math.PI * 2);
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

const metadata = {
  themes: 'molecular calm, potential wells, floating points, harmonious attraction',
  visualisation: 'Particles settle into gentle potential wells, breathing and pulsing together',
  promptSuggestion: '1. Picture molecular wells humming softly\n2. Watch points pulse in conserved depth\n3. Breathe with the floating lattice'
};
(MorsePotentialPoints as any).metadata = metadata;

export default MorsePotentialPoints;

// Differs from others by: Implements Morse potential energy landscape with particle settling dynamics and force calculations

// Themes: deterministic chaos, strange attractors, butterfly effect
// Visualisation: Strange attractor orbit creates meditative trails through phase space
// Unique mechanism: Lorenz differential equation integration with chaos theory visualization

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const LorenzAttractor: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 67432;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    // Lorenz system parameters
    const sigma = 10.0;
    const rho = 28.0;
    const beta = 8.0 / 3.0;
    const dt = 0.005; // Integration timestep

    interface Trajectory {
      x: number;
      y: number;
      z: number;
      trail: Array<{x: number, y: number, z: number, age: number}>;
      color: {r: number, g: number, b: number};
    }

    const trajectories: Trajectory[] = [];
    const maxTrail = 800;

    // Initialize multiple trajectories with slight variations
    for (let i = 0; i < 3; i++) {
      trajectories.push({
        x: 1 + random() * 0.01,  // Slight perturbations
        y: 1 + random() * 0.01,
        z: 1 + random() * 0.01,
        trail: [],
        color: {
          r: 60 + i * 15,
          g: 60 + i * 15, 
          b: 60 + i * 15
        }
      });
    }

    // Lorenz system differential equations
    const lorenzStep = (trajectory: Trajectory) => {
      const { x, y, z } = trajectory;
      
      // dx/dt = σ(y - x)
      // dy/dt = x(ρ - z) - y  
      // dz/dt = xy - βz
      const dx = sigma * (y - x);
      const dy = x * (rho - z) - y;
      const dz = x * y - beta * z;
      
      trajectory.x += dx * dt;
      trajectory.y += dy * dt;
      trajectory.z += dz * dt;
    };

    // 3D to 2D projection
    const project3D = (x: number, y: number, z: number) => {
      const scale = 8;
      const offsetX = width / 2 - 90;
      const offsetY = height / 2 + 80;
      
      // Rotate for better viewing angle
      const rotX = Math.PI / 6;
      const rotY = Math.PI / 8;
      
      // Apply rotations
      const cosX = Math.cos(rotX);
      const sinX = Math.sin(rotX);
      const cosY = Math.cos(rotY);
      const sinY = Math.sin(rotY);
      
      const y1 = y * cosX - z * sinX;
      const z1 = y * sinX + z * cosX;
      
      const x2 = x * cosY + z1 * sinY;
      const z2 = -x * sinY + z1 * cosY;
      
      return {
        x: offsetX + x2 * scale,
        y: offsetY + y1 * scale
      };
    };

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.02)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Update each trajectory
      trajectories.forEach((trajectory, i) => {
        // Integrate Lorenz equations
        for (let step = 0; step < 2; step++) {
          lorenzStep(trajectory);
        }
        
        // Add current position to trail
        trajectory.trail.push({
          x: trajectory.x,
          y: trajectory.y,
          z: trajectory.z,
          age: 0
        });
        
        // Age trail points and remove old ones
        trajectory.trail = trajectory.trail.filter(point => {
          point.age++;
          return point.age < maxTrail;
        });
        
        // Occasionally reset trajectory to explore different regions
        if (random() < 0.0005) {
          trajectory.x = 1 + (random() - 0.5) * 0.1;
          trajectory.y = 1 + (random() - 0.5) * 0.1;
          trajectory.z = 1 + (random() - 0.5) * 0.1;
          trajectory.trail = [];
        }
      });

      // Draw attractor structure (fixed points visualization)
      const fixedPoints = [
        {x: Math.sqrt(beta * (rho - 1)), y: Math.sqrt(beta * (rho - 1)), z: rho - 1},
        {x: -Math.sqrt(beta * (rho - 1)), y: -Math.sqrt(beta * (rho - 1)), z: rho - 1}
      ];
      
      fixedPoints.forEach(point => {
        const projected = project3D(point.x, point.y, point.z);
        const pulse = Math.sin(time * 2) * 0.3 + 0.7;
        
        ctx.fillStyle = `rgba(50,50,50,${0.4 * pulse})`;
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, 6 * pulse, 0, Math.PI * 2);
        ctx.fill();
        
        // Draw attractor basin rings
        for (let r = 20; r < 80; r += 20) {
          ctx.strokeStyle = `rgba(60,60,60,${0.1 * (80 - r) / 80})`;
          ctx.lineWidth = 0.5;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, r, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Draw trajectory trails
      trajectories.forEach((trajectory, trajIndex) => {
        if (trajectory.trail.length < 2) return;
        
        // Draw trail segments with fading alpha
        for (let i = 1; i < trajectory.trail.length; i++) {
          const point = trajectory.trail[i];
          const prevPoint = trajectory.trail[i - 1];
          
          const alpha = (1 - point.age / maxTrail) * 0.6;
          const { r, g, b } = trajectory.color;
          
          const curr = project3D(point.x, point.y, point.z);
          const prev = project3D(prevPoint.x, prevPoint.y, prevPoint.z);
          
          // Vary line width based on z-coordinate for depth
          const depth = (point.z + 30) / 60; // Normalize z
          const lineWidth = 0.5 + depth * 1.5;
          
          ctx.strokeStyle = `rgba(${r},${g},${b},${alpha})`;
          ctx.lineWidth = lineWidth;
          
          ctx.beginPath();
          ctx.moveTo(prev.x, prev.y);
          ctx.lineTo(curr.x, curr.y);
          ctx.stroke();
        }
        
        // Draw current position
        if (trajectory.trail.length > 0) {
          const current = trajectory.trail[trajectory.trail.length - 1];
          const projected = project3D(current.x, current.y, current.z);
          
          ctx.fillStyle = `rgba(${trajectory.color.r},${trajectory.color.g},${trajectory.color.b},0.8)`;
          ctx.beginPath();
          ctx.arc(projected.x, projected.y, 3, 0, Math.PI * 2);
          ctx.fill();
        }
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

// Differs from others by: Integrates Lorenz differential equations to trace chaotic attractor orbits in 3D phase space - no other visual implements chaos theory dynamics

const metadata = {
  themes: "deterministic chaos, strange attractors, butterfly effect",
  visualisation: "Strange attractor orbit creates meditative trails through phase space",
  promptSuggestion: "1. Adjust chaos parameters (sigma, rho, beta)\n2. Vary trajectory count and colors\n3. Control trail length and fading"
};
(LorenzAttractor as any).metadata = metadata;

export default LorenzAttractor;

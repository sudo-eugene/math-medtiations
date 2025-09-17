import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: fluid motion, turbulent chaos becoming order, flow states of consciousness
// visualization: Navier-Stokes fluid dynamics with vorticity and pressure fields

const FluidTurbulence: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;

    // Fluid simulation grid
    const gridWidth = Math.floor(width / 4);
    const gridHeight = Math.floor(height / 4);
    
    // Velocity field (u, v components)
    let velocityU = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0));
    let velocityV = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0));
    let pressure = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0));
    let vorticity = Array(gridHeight).fill().map(() => Array(gridWidth).fill(0));
    
    // Fluid tracers for visualization
    const tracers = [];
    const numTracers = 800;
    
    // Initialize tracers
    for (let i = 0; i < numTracers; i++) {
      tracers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        age: 0,
        maxAge: 100 + Math.random() * 200
      });
    }

    let time = 0;
    let animationId = null;

    // Bilinear interpolation for smooth velocity field
    const interpolate = (field, x, y) => {
      const gx = (x / width) * (gridWidth - 1);
      const gy = (y / height) * (gridHeight - 1);
      const i = Math.floor(gx);
      const j = Math.floor(gy);
      
      if (i < 0 || i >= gridWidth - 1 || j < 0 || j >= gridHeight - 1) return 0;
      
      const fx = gx - i;
      const fy = gy - j;
      
      return field[j][i] * (1 - fx) * (1 - fy) +
             field[j][i + 1] * fx * (1 - fy) +
             field[j + 1][i] * (1 - fx) * fy +
             field[j + 1][i + 1] * fx * fy;
    };

    // Update fluid simulation
    const updateFluid = () => {
      // Add turbulent forces
      for (let j = 1; j < gridHeight - 1; j++) {
        for (let i = 1; i < gridWidth - 1; i++) {
          // Vortex generators
          const centerX = gridWidth * 0.3 + Math.sin(time * 0.1) * gridWidth * 0.2;
          const centerY = gridHeight * 0.5 + Math.cos(time * 0.07) * gridHeight * 0.2;
          const dx = i - centerX;
          const dy = j - centerY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist > 0 && dist < 15) {
            const strength = (15 - dist) / 15 * 0.5;
            velocityU[j][i] += -dy * strength * Math.sin(time * 0.5);
            velocityV[j][i] += dx * strength * Math.sin(time * 0.5);
          }
          
          // Second vortex
          const center2X = gridWidth * 0.7 + Math.cos(time * 0.08) * gridWidth * 0.15;
          const center2Y = gridHeight * 0.3 + Math.sin(time * 0.12) * gridHeight * 0.15;
          const dx2 = i - center2X;
          const dy2 = j - center2Y;
          const dist2 = Math.sqrt(dx2 * dx2 + dy2 * dy2);
          
          if (dist2 > 0 && dist2 < 12) {
            const strength2 = (12 - dist2) / 12 * -0.4;
            velocityU[j][i] += -dy2 * strength2 * Math.cos(time * 0.3);
            velocityV[j][i] += dx2 * strength2 * Math.cos(time * 0.3);
          }
        }
      }

      // Calculate vorticity (curl of velocity field)
      for (let j = 1; j < gridHeight - 1; j++) {
        for (let i = 1; i < gridWidth - 1; i++) {
          const dvdx = (velocityV[j][i + 1] - velocityV[j][i - 1]) / 2;
          const dudy = (velocityU[j + 1][i] - velocityU[j - 1][i]) / 2;
          vorticity[j][i] = dvdx - dudy;
        }
      }

      // Apply viscous diffusion
      const viscosity = 0.98;
      for (let j = 1; j < gridHeight - 1; j++) {
        for (let i = 1; i < gridWidth - 1; i++) {
          velocityU[j][i] *= viscosity;
          velocityV[j][i] *= viscosity;
        }
      }

      // Boundary conditions (no-slip)
      for (let i = 0; i < gridWidth; i++) {
        velocityU[0][i] = velocityU[gridHeight - 1][i] = 0;
        velocityV[0][i] = velocityV[gridHeight - 1][i] = 0;
      }
      for (let j = 0; j < gridHeight; j++) {
        velocityU[j][0] = velocityU[j][gridWidth - 1] = 0;
        velocityV[j][0] = velocityV[j][gridWidth - 1] = 0;
      }
    };

    // Update tracer particles
    const updateTracers = () => {
      tracers.forEach(tracer => {
        // Get velocity at tracer position
        const u = interpolate(velocityU, tracer.x, tracer.y);
        const v = interpolate(velocityV, tracer.x, tracer.y);
        
        // Advect tracer
        tracer.x += u * 8;
        tracer.y += v * 8;
        tracer.age++;
        
        // Wrap around boundaries
        if (tracer.x < 0) tracer.x = width;
        if (tracer.x > width) tracer.x = 0;
        if (tracer.y < 0) tracer.y = height;
        if (tracer.y > height) tracer.y = 0;
        
        // Reset aged tracers
        if (tracer.age > tracer.maxAge) {
          tracer.x = Math.random() * width;
          tracer.y = Math.random() * height;
          tracer.age = 0;
          tracer.maxAge = 100 + Math.random() * 200;
        }
      });
    };

    const animate = () => {
      // Background
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      time += 1;
      
      // Update fluid simulation
      updateFluid();
      updateTracers();

      // Draw velocity field as background
      const imageData = ctx.createImageData(width, height);
      const data = imageData.data;
      
      for (let y = 0; y < height; y += 2) {
        for (let x = 0; x < width; x += 2) {
          const u = interpolate(velocityU, x, y);
          const v = interpolate(velocityV, x, y);
          const vorticity_val = interpolate(vorticity, x, y);
          
          const speed = Math.sqrt(u * u + v * v);
          const intensity = Math.min(255, speed * 100 + 200);
          const vorticityColor = Math.abs(vorticity_val) * 50;
          
          const index = (y * width + x) * 4;
          if (index < data.length - 3) {
            data[index] = intensity - vorticityColor;     // R
            data[index + 1] = intensity - vorticityColor; // G  
            data[index + 2] = intensity - vorticityColor; // B
            data[index + 3] = 255; // A
          }
        }
      }
      
      ctx.putImageData(imageData, 0, 0);

      // Draw streamlines
      ctx.strokeStyle = 'rgba(60, 60, 60, 0.1)';
      ctx.lineWidth = 1;
      
      for (let startY = 20; startY < height; startY += 40) {
        for (let startX = 20; startX < width; startX += 40) {
          ctx.beginPath();
          let x = startX;
          let y = startY;
          ctx.moveTo(x, y);
          
          for (let step = 0; step < 50; step++) {
            const u = interpolate(velocityU, x, y);
            const v = interpolate(velocityV, x, y);
            
            if (Math.abs(u) < 0.01 && Math.abs(v) < 0.01) break;
            
            x += u * 4;
            y += v * 4;
            
            if (x < 0 || x > width || y < 0 || y > height) break;
            
            ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }

      // Draw tracer particles
      tracers.forEach(tracer => {
        const alpha = 1 - (tracer.age / tracer.maxAge);
        const size = 1 + alpha * 2;
        
        ctx.fillStyle = `rgba(40, 40, 40, ${alpha * 0.6})`;
        ctx.beginPath();
        ctx.arc(tracer.x, tracer.y, size, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw vorticity contours
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.3)';
      ctx.lineWidth = 1;
      
      for (let j = 2; j < gridHeight - 2; j += 3) {
        for (let i = 2; i < gridWidth - 2; i += 3) {
          if (Math.abs(vorticity[j][i]) > 0.1) {
            const x = (i / gridWidth) * width;
            const y = (j / gridHeight) * height;
            const radius = Math.abs(vorticity[j][i]) * 20;
            
            ctx.beginPath();
            ctx.arc(x, y, radius, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [width, height]);

  return (
    <div style={{ 
      width: `${width}px`, 
      height: `${height}px`, 
      backgroundColor: '#F0EEE6' 
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default FluidTurbulence;

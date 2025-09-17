// Themes: recursive infinity, dimensional fractals, Cantor dust meditation
// Visualisation: Cantor dust particles dance in recursive patterns across multiple scales
// Unique mechanism: Cantor set generation with dimensional interpolation and fractal dynamics

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const FractalDust: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 56742;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    interface DustParticle {
      x: number;
      y: number;
      level: number;
      size: number;
      phase: number;
      dimension: number; // Fractal dimension
      age: number;
    }

    const dustParticles: DustParticle[] = [];
    const maxLevels = 8;

    // Generate Cantor set positions at given level
    const generateCantorPositions = (level: number, start: number, end: number): number[] => {
      if (level === 0) {
        return [(start + end) / 2];
      }
      
      const third = (end - start) / 3;
      const leftStart = start;
      const leftEnd = start + third;
      const rightStart = end - third;
      const rightEnd = end;
      
      return [
        ...generateCantorPositions(level - 1, leftStart, leftEnd),
        ...generateCantorPositions(level - 1, rightStart, rightEnd)
      ];
    };

    // Initialize fractal dust
    const initializeDust = () => {
      dustParticles.length = 0;
      
      for (let level = 0; level < maxLevels; level++) {
        const positions = generateCantorPositions(level, 0, 1);
        const dimension = Math.log(2) / Math.log(3); // Cantor set dimension ≈ 0.63
        
        positions.forEach(pos => {
          // Create particles at multiple y-levels for 2D Cantor dust
          for (let yLevel = 0; yLevel < Math.min(4, level + 1); yLevel++) {
            const yPositions = generateCantorPositions(yLevel, 0, 1);
            
            yPositions.forEach(yPos => {
              dustParticles.push({
                x: pos * width,
                y: yPos * height,
                level: level,
                size: Math.max(0.5, 8 - level * 1.2),
                phase: random() * Math.PI * 2,
                dimension: dimension,
                age: 0
              });
            });
          }
        });
      }
    };

    // Sierpinski triangle dust (alternative fractal)
    const addSierpinskiDust = () => {
      const triangleVertices = [
        { x: width / 2, y: 50 },
        { x: 100, y: height - 50 },
        { x: width - 100, y: height - 50 }
      ];

      let currentPoint = { x: width / 2, y: height / 2 };
      
      for (let i = 0; i < 500; i++) {
        const targetVertex = triangleVertices[Math.floor(random() * 3)];
        currentPoint.x = (currentPoint.x + targetVertex.x) / 2;
        currentPoint.y = (currentPoint.y + targetVertex.y) / 2;
        
        dustParticles.push({
          x: currentPoint.x,
          y: currentPoint.y,
          level: i % maxLevels,
          size: 1 + Math.sin(i * 0.1) * 2,
          phase: i * 0.1,
          dimension: Math.log(3) / Math.log(2), // Sierpinski dimension ≈ 1.58
          age: 0
        });
      }
    };

    initializeDust();
    if (random() > 0.5) addSierpinskiDust();

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Update particle properties
      dustParticles.forEach((particle, i) => {
        particle.age += 0.01;
        particle.phase += 0.02;
        
        // Fractal breathing based on dimension
        const breathe = Math.sin(particle.phase + particle.level * 0.5) * 0.3 + 0.7;
        const dimensionalPulse = Math.sin(time * 0.5 + particle.dimension) * 0.2 + 0.8;
        
        particle.size = Math.max(0.3, (8 - particle.level * 1.2) * breathe * dimensionalPulse);
      });

      // Draw particles with fractal hierarchy
      const levelGroups: {[key: number]: DustParticle[]} = {};
      dustParticles.forEach(particle => {
        if (!levelGroups[particle.level]) levelGroups[particle.level] = [];
        levelGroups[particle.level].push(particle);
      });

      // Draw from deepest level to shallowest
      for (let level = maxLevels - 1; level >= 0; level--) {
        if (!levelGroups[level]) continue;
        
        const alpha = Math.max(0.1, 1 - level * 0.15);
        const particles = levelGroups[level];
        
        particles.forEach(particle => {
          const pulse = Math.sin(particle.phase) * 0.3 + 0.7;
          const particleAlpha = alpha * pulse * (1 - particle.age * 0.1);
          
          if (particleAlpha <= 0) return;
          
          // Draw particle with fractal glow
          const gradient = ctx.createRadialGradient(
            particle.x, particle.y, 0,
            particle.x, particle.y, particle.size * 3
          );
          gradient.addColorStop(0, `rgba(70,70,70,${particleAlpha * 0.8})`);
          gradient.addColorStop(0.5, `rgba(80,80,80,${particleAlpha * 0.4})`);
          gradient.addColorStop(1, `rgba(90,90,90,0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, particle.size * 3, 0, Math.PI * 2);
          ctx.fill();
          
          // Central dot
          ctx.fillStyle = `rgba(50,50,50,${particleAlpha})`;
          ctx.beginPath();
          ctx.arc(particle.x, particle.y, Math.max(0.5, particle.size * 0.3), 0, Math.PI * 2);
          ctx.fill();
        });
      }

      // Draw fractal connection lines between nearby particles
      ctx.strokeStyle = 'rgba(60,60,60,0.1)';
      ctx.lineWidth = 0.5;
      
      for (let i = 0; i < Math.min(200, dustParticles.length); i++) {
        const p1 = dustParticles[i];
        if (p1.age > 1) continue;
        
        for (let j = i + 1; j < Math.min(200, dustParticles.length); j++) {
          const p2 = dustParticles[j];
          if (p2.age > 1) continue;
          
          const dx = p1.x - p2.x;
          const dy = p1.y - p2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          // Connect particles at similar scales
          if (dist < 50 && Math.abs(p1.level - p2.level) <= 1) {
            const connectionAlpha = Math.max(0, 0.2 - dist / 250);
            ctx.globalAlpha = connectionAlpha;
            ctx.beginPath();
            ctx.moveTo(p1.x, p1.y);
            ctx.lineTo(p2.x, p2.y);
            ctx.stroke();
            ctx.globalAlpha = 1;
          }
        }
      }

      // Draw dimensional indicator
      ctx.font = '10px serif';
      ctx.fillStyle = 'rgba(60,60,60,0.4)';
      ctx.fillText('Fractal Dimension ≈ 0.63 - 1.58', 10, height - 15);

      // Occasionally regenerate dust
      if (Math.floor(time * 0.05) % 120 === 0) {
        initializeDust();
        if (random() > 0.7) addSierpinskiDust();
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

// Differs from others by: Generates Cantor set and Sierpinski triangle fractal dust with dimensional interpolation - no other visual implements multifractal geometry

const metadata = {
  themes: "recursive infinity, dimensional fractals, Cantor dust meditation",
  visualisation: "Cantor dust particles dance in recursive patterns across multiple scales",
  promptSuggestion: "1. Adjust fractal generation depth\n2. Vary dimensional breathing patterns\n3. Control particle scale hierarchy"
};
(FractalDust as any).metadata = metadata;

export default FractalDust;

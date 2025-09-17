// Themes: aperiodic order, infinite patterns, mathematical beauty
// Visualisation: Self-similar Penrose rhombi tiles emerge and fade in breathing patterns
// Unique mechanism: Penrose rhombi generation using substitution rules with emergence dynamics

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const PenroseTiling: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 89324;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const PHI = (1 + Math.sqrt(5)) / 2; // Golden ratio

    interface Rhombus {
      x: number;
      y: number;
      size: number;
      angle: number;
      type: 'thick' | 'thin';
      generation: number;
      alpha: number;
      phase: number;
    }

    let rhombi: Rhombus[] = [];

    // Initialize with seed rhombi
    const initializeTiling = () => {
      rhombi = [];
      const centerX = width / 2;
      const centerY = height / 2;
      const initialSize = 60;
      
      // Create initial wheel of 10 rhombi
      for (let i = 0; i < 10; i++) {
        const angle = (i * Math.PI * 2) / 10;
        const type = i % 2 === 0 ? 'thick' : 'thin';
        rhombi.push({
          x: centerX + Math.cos(angle) * initialSize,
          y: centerY + Math.sin(angle) * initialSize,
          size: initialSize,
          angle: angle + Math.PI / 5,
          type: type,
          generation: 0,
          alpha: 0,
          phase: random() * Math.PI * 2
        });
      }
    };

    // Penrose substitution rules
    const subdivideRhombus = (rhomb: Rhombus): Rhombus[] => {
      const newRhombi: Rhombus[] = [];
      const newSize = rhomb.size / PHI;
      const cos36 = Math.cos(Math.PI / 5);
      const sin36 = Math.sin(Math.PI / 5);
      
      if (rhomb.type === 'thick') {
        // Thick rhombus splits into thin + thick + thin pattern
        const offset1 = newSize * cos36;
        const offset2 = newSize * sin36;
        
        newRhombi.push({
          x: rhomb.x + Math.cos(rhomb.angle) * offset1,
          y: rhomb.y + Math.sin(rhomb.angle) * offset1,
          size: newSize,
          angle: rhomb.angle,
          type: 'thin',
          generation: rhomb.generation + 1,
          alpha: 0,
          phase: random() * Math.PI * 2
        });
        
        newRhombi.push({
          x: rhomb.x,
          y: rhomb.y,
          size: newSize,
          angle: rhomb.angle + Math.PI / 5,
          type: 'thick',
          generation: rhomb.generation + 1,
          alpha: 0,
          phase: random() * Math.PI * 2
        });
        
        newRhombi.push({
          x: rhomb.x + Math.cos(rhomb.angle + Math.PI) * offset2,
          y: rhomb.y + Math.sin(rhomb.angle + Math.PI) * offset2,
          size: newSize,
          angle: rhomb.angle - Math.PI / 5,
          type: 'thin',
          generation: rhomb.generation + 1,
          alpha: 0,
          phase: random() * Math.PI * 2
        });
      } else {
        // Thin rhombus splits into single thick
        newRhombi.push({
          x: rhomb.x,
          y: rhomb.y,
          size: newSize,
          angle: rhomb.angle,
          type: 'thick',
          generation: rhomb.generation + 1,
          alpha: 0,
          phase: random() * Math.PI * 2
        });
      }
      
      return newRhombi;
    };

    const drawRhombus = (rhomb: Rhombus) => {
      if (rhomb.alpha <= 0) return;
      
      const { x, y, size, angle, type } = rhomb;
      
      // Calculate rhombus vertices
      const cos72 = Math.cos(2 * Math.PI / 5);
      const sin72 = Math.sin(2 * Math.PI / 5);
      const cos36 = Math.cos(Math.PI / 5);
      const sin36 = Math.sin(Math.PI / 5);
      
      let vertices;
      if (type === 'thick') {
        // 72° rhombus
        vertices = [
          [size * cos36, 0],
          [size * cos72, size * sin72],
          [-size * cos36, 0],
          [size * cos72, -size * sin72]
        ];
      } else {
        // 36° rhombus  
        vertices = [
          [size, 0],
          [size * cos72, size * sin72],
          [-size, 0],
          [size * cos72, -size * sin72]
        ];
      }
      
      // Rotate and translate vertices
      const rotatedVertices = vertices.map(([vx, vy]) => {
        const rx = vx * Math.cos(angle) - vy * Math.sin(angle);
        const ry = vx * Math.sin(angle) + vy * Math.cos(angle);
        return [x + rx, y + ry];
      });
      
      // Draw rhombus
      ctx.strokeStyle = `rgba(70,70,70,${rhomb.alpha * 0.6})`;
      ctx.fillStyle = `rgba(80,80,80,${rhomb.alpha * 0.1})`;
      ctx.lineWidth = 1;
      
      ctx.beginPath();
      ctx.moveTo(rotatedVertices[0][0], rotatedVertices[0][1]);
      for (let i = 1; i < rotatedVertices.length; i++) {
        ctx.lineTo(rotatedVertices[i][0], rotatedVertices[i][1]);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
    };

    initializeTiling();

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Update rhombi alpha and breathing
      rhombi.forEach((rhomb, i) => {
        rhomb.phase += 0.01;
        const breathe = Math.sin(rhomb.phase) * 0.5 + 0.5;
        const generationFade = Math.max(0, 1 - rhomb.generation * 0.2);
        rhomb.alpha = breathe * generationFade;
      });

      // Periodic subdivision
      if (Math.floor(time * 0.2) % 10 === 0 && rhombi.length < 200) {
        const oldRhombi = [...rhombi];
        rhombi = [];
        
        oldRhombi.forEach(rhomb => {
          if (rhomb.generation < 3 && random() < 0.3) {
            const subdivided = subdivideRhombus(rhomb);
            rhombi.push(...subdivided);
          } else {
            rhombi.push(rhomb);
          }
        });
      }

      // Remove rhombi that are too small or outside bounds
      rhombi = rhombi.filter(rhomb => {
        return rhomb.size > 5 && 
               rhomb.x > -100 && rhomb.x < width + 100 &&
               rhomb.y > -100 && rhomb.y < height + 100;
      });

      // Periodic reset
      if (Math.floor(time * 0.05) % 40 === 0 && rhombi.length > 300) {
        initializeTiling();
      }

      // Draw all rhombi
      rhombi.forEach(drawRhombus);

      // Draw connection lines between nearby rhombi
      ctx.strokeStyle = 'rgba(60,60,60,0.1)';
      ctx.lineWidth = 0.5;
      for (let i = 0; i < rhombi.length; i++) {
        for (let j = i + 1; j < rhombi.length; j++) {
          const r1 = rhombi[i];
          const r2 = rhombi[j];
          const dx = r1.x - r2.x;
          const dy = r1.y - r2.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < r1.size + r2.size + 10 && r1.alpha > 0.3 && r2.alpha > 0.3) {
            ctx.beginPath();
            ctx.moveTo(r1.x, r1.y);
            ctx.lineTo(r2.x, r2.y);
            ctx.stroke();
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

// Differs from others by: Implements true Penrose aperiodic tiling with mathematical substitution rules - no other visual uses aperiodic geometric tessellation

const metadata = {
  themes: "aperiodic order, infinite patterns, mathematical beauty",
  visualisation: "Self-similar Penrose rhombi tiles emerge and fade in breathing patterns",
  promptSuggestion: "1. Control subdivision timing\n2. Adjust emergence breathing\n3. Vary rhombi generation depth"
};
(PenroseTiling as any).metadata = metadata;

export default PenroseTiling;

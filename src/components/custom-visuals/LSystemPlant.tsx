import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// L-System Plant using Canvas 2D instead of THREE.js

const LSystemPlant: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;

    const lsystem = {
      axiom: 'X',
      rules: {
        X: 'F+[[X]-X]-F[-FX]+X',
        F: 'FF',
      },
      angle: 25,
      iterations: 4,
    };

    const generateLSystem = (axiom: string, rules: { [key: string]: string }, iterations: number) => {
      let current = axiom;
      for (let i = 0; i < iterations; i++) {
        current = current.split('').map(char => rules[char] || char).join('');
      }
      return current;
    };

    const plantString = generateLSystem(lsystem.axiom, lsystem.rules, lsystem.iterations);

    const turtle = {
      x: width / 2,
      y: height - 50,
      angle: -Math.PI / 2, // Point upward
      stack: [] as { x: number, y: number, angle: number }[],
    };

    const angleStep = (lsystem.angle * Math.PI) / 180;
    const stepLength = 8;
    const lines: { x1: number, y1: number, x2: number, y2: number }[] = [];

    for (const char of plantString) {
      switch (char) {
        case 'F': {
          const x1 = turtle.x;
          const y1 = turtle.y;
          const x2 = turtle.x + Math.cos(turtle.angle) * stepLength;
          const y2 = turtle.y + Math.sin(turtle.angle) * stepLength;
          
          lines.push({ x1, y1, x2, y2 });
          turtle.x = x2;
          turtle.y = y2;
          break;
        }
        case '+':
          turtle.angle += angleStep;
          break;
        case '-':
          turtle.angle -= angleStep;
          break;
        case '[':
          turtle.stack.push({ x: turtle.x, y: turtle.y, angle: turtle.angle });
          break;
        case ']': {
          const popped = turtle.stack.pop();
          if (popped) {
            turtle.x = popped.x;
            turtle.y = popped.y;
            turtle.angle = popped.angle;
          }
          break;
        }
      }
    }

    // Set background
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);
    
    let step = 0;
    const animate = () => {
      // Clear canvas with background color
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      // Draw lines up to current step
      ctx.strokeStyle = 'rgba(60, 80, 60, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.lineCap = 'round';
      
      for (let i = 0; i < Math.min(step, lines.length); i++) {
        const line = lines[i];
        ctx.beginPath();
        ctx.moveTo(line.x1, line.y1);
        ctx.lineTo(line.x2, line.y2);
        ctx.stroke();
      }
      
      if (step < lines.length) {
        step += 2; // Draw 2 lines per frame for faster growth
      }
      
      requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // No cleanup needed for canvas
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

export default LSystemPlant;

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: natural growth patterns, mathematical harmony in nature, emergence of complexity
// visualization: Fibonacci spirals that grow and branch organically like living plants

const FibonacciGrowth: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;

    // Fibonacci sequence and golden ratio
    const phi = (1 + Math.sqrt(5)) / 2;
    let time = 0;
    
    // Growth system
    const branches = [];
    const maxBranches = 12;
    
    // Initialize main stems
    for (let i = 0; i < 3; i++) {
      branches.push({
        x: width * (0.3 + i * 0.2),
        y: height * 0.9,
        angle: -Math.PI/2 + (Math.random() - 0.5) * 0.4,
        length: 0,
        maxLength: 80 + Math.random() * 60,
        generation: 0,
        age: Math.random() * 20,
        growth: 0.8 + Math.random() * 0.4,
        children: []
      });
    }

    let animationId = null;

    const drawFibonacciSpiral = (centerX, centerY, scale, rotation, alpha) => {
      ctx.save();
      ctx.translate(centerX, centerY);
      ctx.rotate(rotation);
      ctx.strokeStyle = `rgba(70, 70, 70, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.beginPath();
      
      // Draw Fibonacci spiral
      let angle = 0;
      const steps = 100;
      let radius = scale * 2;
      
      for (let i = 0; i < steps; i++) {
        const spiralRadius = radius * Math.pow(phi, angle / (Math.PI * 2));
        const x = Math.cos(angle) * spiralRadius;
        const y = Math.sin(angle) * spiralRadius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
        
        angle += 0.2;
        if (spiralRadius > scale * 30) break;
      }
      
      ctx.stroke();
      ctx.restore();
    };

    const drawLeaf = (x, y, size, angle, alpha) => {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      
      // Leaf shape based on golden ratio proportions
      ctx.fillStyle = `rgba(60, 60, 60, ${alpha})`;
      ctx.beginPath();
      ctx.ellipse(0, 0, size * phi, size, 0, 0, Math.PI * 2);
      ctx.fill();
      
      // Leaf veins
      ctx.strokeStyle = `rgba(80, 80, 80, ${alpha * 0.5})`;
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(-size * phi * 0.8, 0);
      ctx.lineTo(size * phi * 0.8, 0);
      ctx.stroke();
      
      ctx.restore();
    };

    const growBranch = (branch) => {
      if (branch.length < branch.maxLength) {
        branch.length += branch.growth;
        branch.age += 0.1;
        
        // Calculate branch tip position
        const tipX = branch.x + Math.cos(branch.angle) * branch.length;
        const tipY = branch.y + Math.sin(branch.angle) * branch.length;
        
        // Fibonacci-based branching
        const fibNumbers = [1, 1, 2, 3, 5, 8, 13];
        const shouldBranch = branch.age > fibNumbers[Math.min(branch.generation + 2, 6)] * 8;
        
        if (shouldBranch && branch.generation < 4 && branches.length < maxBranches) {
          // Create new branches at golden ratio angles
          const branchAngle1 = branch.angle + Math.PI / phi;
          const branchAngle2 = branch.angle - Math.PI / phi;
          
          if (Math.random() > 0.3) {
            branches.push({
              x: tipX,
              y: tipY,
              angle: branchAngle1,
              length: 0,
              maxLength: branch.maxLength * 0.618, // Golden ratio reduction
              generation: branch.generation + 1,
              age: 0,
              growth: branch.growth * 0.8,
              children: []
            });
          }
          
          if (Math.random() > 0.5) {
            branches.push({
              x: tipX,
              y: tipY,
              angle: branchAngle2,
              length: 0,
              maxLength: branch.maxLength * 0.618,
              generation: branch.generation + 1,
              age: 0,
              growth: branch.growth * 0.8,
              children: []
            });
          }
          
          branch.age = 0; // Reset age after branching
        }
      }
    };

    const animate = () => {
      // Background
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      time += 0.01;

      // Grow all branches
      branches.forEach(growBranch);

      // Draw branches
      branches.forEach(branch => {
        if (branch.length > 0) {
          const tipX = branch.x + Math.cos(branch.angle) * branch.length;
          const tipY = branch.y + Math.sin(branch.angle) * branch.length;
          
          // Branch thickness based on generation
          const thickness = Math.max(1, 4 - branch.generation);
          ctx.strokeStyle = `rgba(50, 50, 50, 0.7)`;
          ctx.lineWidth = thickness;
          ctx.beginPath();
          ctx.moveTo(branch.x, branch.y);
          ctx.lineTo(tipX, tipY);
          ctx.stroke();
          
          // Add leaves at Fibonacci intervals
          const leafCount = Math.floor(branch.length / 15);
          for (let i = 1; i <= leafCount; i++) {
            const t = i / leafCount;
            const leafX = branch.x + Math.cos(branch.angle) * branch.length * t;
            const leafY = branch.y + Math.sin(branch.angle) * branch.length * t;
            const leafAngle = branch.angle + Math.sin(time * 2 + i) * 0.3;
            const leafSize = 3 + Math.sin(time + i * phi) * 1;
            const leafAlpha = 0.4 + Math.sin(time * 0.5 + i) * 0.2;
            
            drawLeaf(leafX, leafY, leafSize, leafAngle, leafAlpha);
          }
          
          // Fibonacci spiral at branch tips
          if (branch.generation >= 2 && branch.length > branch.maxLength * 0.8) {
            const spiralScale = 5 - branch.generation;
            const spiralRotation = time * 0.5 + branch.generation;
            const spiralAlpha = 0.3;
            
            drawFibonacciSpiral(tipX, tipY, spiralScale, spiralRotation, spiralAlpha);
          }
        }
      });

      // Draw golden ratio rectangles in background
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.1)';
      ctx.lineWidth = 1;
      for (let i = 0; i < 5; i++) {
        const size = 20 * Math.pow(phi, i);
        const x = width * 0.8 + Math.sin(time * 0.3 + i) * 30;
        const y = height * 0.2 + Math.cos(time * 0.2 + i) * 20;
        
        ctx.strokeRect(x - size/2, y - size/2, size, size / phi);
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

export default FibonacciGrowth;

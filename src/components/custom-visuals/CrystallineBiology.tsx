import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: balance of opposites, return to wholeness, keep to the block
// visualization: Crystalline forms grow in perfect balance, always returning to their core structure

const CrystallineBiology: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    let time = 0;
    let crystals = [];
    const numCrystals = 4;

    class Crystal {
      constructor(x, y, size) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.segments = [];
        this.angle = 0;
        this.rotationSpeed = 0.001; // Increased from 0.0002 to ensure visible rotation
        this.sides = 6;
        this.baseGrowthPhase = Math.random() * Math.PI * 2;
        this.lastGrowthPhase = 0;
        this.currentGrowthPhase = 0;
        
        this.generateStructure();
      }

      generateStructure() {
        this.segments = [];
        
        // Create balanced structure of opposites
        for (let ring = 0; ring < 5; ring++) {
          const ringRadius = this.size * (0.15 + ring * 0.17);
          const numSegments = this.sides * (ring + 1);
          
          for (let i = 0; i < numSegments; i++) {
            const angle = (i / numSegments) * Math.PI * 2;
            const innerRadius = ring === 0 ? 0 : this.size * (0.15 + (ring - 1) * 0.17);
            
            this.segments.push({
              angle: angle,
              innerRadius: innerRadius,
              outerRadius: ringRadius,
              basePhase: Math.random() * Math.PI * 2,
              currentInnerRadius: innerRadius,
              currentOuterRadius: ringRadius,
              currentAngle: angle,
              branching: ring > 2 && Math.random() < 0.2
            });
          }
        }
      }

      update(time) {
        // Make sure rotation continues even after initial development
        this.angle += this.rotationSpeed * 5; // Increased to ensure visible rotation
        
        // Very smooth, gradual breathing effect
        this.lastGrowthPhase = this.currentGrowthPhase;
        const targetGrowthPhase = Math.sin(time * 0.05 + this.baseGrowthPhase) * 0.15 + 0.85; // Slower oscillation (0.1 -> 0.05)
        this.currentGrowthPhase += (targetGrowthPhase - this.currentGrowthPhase) * 0.005; // Much slower interpolation (0.02 -> 0.005)
        
        // Update segments with extreme smoothing
        this.segments.forEach(segment => {
          const targetInnerRadius = segment.innerRadius * this.currentGrowthPhase;
          const targetOuterRadius = segment.outerRadius * this.currentGrowthPhase;
          const targetAngle = segment.angle + Math.sin(time * 0.15 + segment.basePhase) * 0.005; // Slowed down (0.3 -> 0.15)
          
          // Much slower, more extreme smoothing for initial development
          segment.currentInnerRadius += (targetInnerRadius - segment.currentInnerRadius) * 0.005; // Slowed down (0.02 -> 0.005)
          segment.currentOuterRadius += (targetOuterRadius - segment.currentOuterRadius) * 0.005; // Slowed down (0.02 -> 0.005)
          segment.currentAngle += (targetAngle - segment.currentAngle) * 0.005; // Slowed down (0.02 -> 0.005)
        });
      }

      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.angle);
        
        // Draw delicate geometric base
        ctx.strokeStyle = 'rgba(100, 100, 100, 0.2)';
        ctx.lineWidth = 1;
        
        for (let i = 0; i < this.sides; i++) {
          const angle = (i / this.sides) * Math.PI * 2;
          ctx.beginPath();
          ctx.moveTo(0, 0);
          ctx.lineTo(
            Math.cos(angle) * this.size,
            Math.sin(angle) * this.size
          );
          ctx.stroke();
        }
        
        // Draw segments with consistent styling
        this.segments.forEach(segment => {
          const innerX = Math.cos(segment.currentAngle) * segment.currentInnerRadius;
          const innerY = Math.sin(segment.currentAngle) * segment.currentInnerRadius;
          const outerX = Math.cos(segment.currentAngle) * segment.currentOuterRadius;
          const outerY = Math.sin(segment.currentAngle) * segment.currentOuterRadius;
          
          // Main segment
          ctx.strokeStyle = 'rgba(60, 60, 60, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.beginPath();
          ctx.moveTo(innerX, innerY);
          ctx.lineTo(outerX, outerY);
          ctx.stroke();
          
          // Nodes along segment (fewer, more stable)
          const numNodes = 1;
          for (let n = 0; n < numNodes; n++) {
            const t = 0.6; // Fixed position along segment
            const nodeX = innerX + (outerX - innerX) * t;
            const nodeY = innerY + (outerY - innerY) * t;
            const nodeSize = 6;
            
            // Smooth node shape
            const nodePoints = 8;
            ctx.beginPath();
            for (let p = 0; p <= nodePoints; p++) {
              const a = (p / nodePoints) * Math.PI * 2;
              const r = nodeSize * (1 + Math.sin(a * 2 + segment.basePhase) * 0.05);
              const px = nodeX + Math.cos(a) * r;
              const py = nodeY + Math.sin(a) * r;
              
              if (p === 0) ctx.moveTo(px, py);
              else ctx.lineTo(px, py);
            }
            
            ctx.strokeStyle = 'rgba(50, 50, 50, 0.5)';
            ctx.lineWidth = 0.8;
            ctx.stroke();
            
            // Node core
            ctx.beginPath();
            ctx.arc(nodeX, nodeY, nodeSize * 0.25, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(50, 50, 50, 0.3)';
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
          
          // Stable branching
          if (segment.branching) {
            const branchAngle = segment.currentAngle + 0.2;
            const branchLength = segment.currentOuterRadius * 0.3;
            const branchX = outerX + Math.cos(branchAngle) * branchLength;
            const branchY = outerY + Math.sin(branchAngle) * branchLength;
            
            ctx.strokeStyle = 'rgba(60, 60, 60, 0.3)';
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            ctx.moveTo(outerX, outerY);
            ctx.lineTo(branchX, branchY);
            ctx.stroke();
            
            // Branch terminal
            ctx.beginPath();
            ctx.arc(branchX, branchY, 2.5, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(60, 60, 60, 0.4)';
            ctx.stroke();
          }
        });
        
        // Keep to the block - the stable core within
        const coreSize = this.size * 0.06;
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.5)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(0, 0, coreSize, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner core
        ctx.beginPath();
        ctx.arc(0, 0, coreSize * 0.5, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        ctx.restore();
      }
    }

    // Initialize crystals
    function initCrystals() {
      crystals = [];
      for (let i = 0; i < numCrystals; i++) {
        const x = canvas.width * (0.2 + Math.random() * 0.6);
        const y = canvas.height * (0.2 + Math.random() * 0.6);
        const size = 70 + Math.random() * 30;
        crystals.push(new Crystal(x, y, size));
      }
    }

    initCrystals();

    // Animation timing control variables
    let animationFrameId = null;
    let lastFrameTime = 0;
    const targetFPS = 16.7; // Equivalent to 60ms interval (16.7fps)
    const frameInterval = 1000 / targetFPS;
    
    // Animation function with time delta control
    function animate(currentTime) {
      // Initialize lastFrameTime on first frame
      if (!lastFrameTime) {
        lastFrameTime = currentTime;
      }
      
      const deltaTime = currentTime - lastFrameTime;
      
      // Only update animation when enough time has passed (mimics setInterval at 60ms)
      if (deltaTime >= frameInterval) {
        // Soft background with no transparency for no flashing
        ctx.fillStyle = '#F0EEE6';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        time += 0.005; // Very slow time progression

        // Update and draw crystals
        crystals = crystals.filter(crystal => !crystal.isDead);
        crystals.forEach(crystal => {
          crystal.update(time);
          crystal.draw(ctx);
        });

        // Draw crystal connections - very subtle and stable
        for (let i = 0; i < crystals.length; i++) {
          for (let j = i + 1; j < crystals.length; j++) {
            const crystalA = crystals[i];
            const crystalB = crystals[j];
            
            const distance = Math.sqrt(
              (crystalA.x - crystalB.x) * (crystalA.x - crystalB.x) + 
              (crystalA.y - crystalB.y) * (crystalA.y - crystalB.y)
            );
            
            if (distance < 280) {
              const opacity = Math.pow(1 - distance / 280, 2) * 0.1;
              
              ctx.strokeStyle = `rgba(60, 60, 60, ${opacity})`;
              ctx.lineWidth = 0.8;
              ctx.beginPath();
              
              // Straight, stable connection
              ctx.moveTo(crystalA.x, crystalA.y);
              ctx.lineTo(crystalB.x, crystalB.y);
              ctx.stroke();
            }
          }
        }
        
        // Update lastFrameTime, accounting for any remainder to prevent drift
        lastFrameTime = currentTime - (deltaTime % frameInterval);
      }
      
      // Continue animation loop
      animationFrameId = requestAnimationFrame(animate);
    }
    
    // Start animation
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      // Cancel animation frame to prevent memory leaks
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Clear crystals array to prevent memory leaks
      crystals.length = 0;
    };
  }, [width, height]);

  return (
    <div style={{ 
      width: `${width}px`, 
      height: `${height}px`, 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center', 
      backgroundColor: '#F0EEE6',
      overflow: 'hidden',
      border: '1px solid #ddd',
      borderRadius: '8px'
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default CrystallineBiology;

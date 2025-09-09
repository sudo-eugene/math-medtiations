import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: lead without force, achieve without boasting, nature's unceasing momentum
// visualization: Forms guide each other through gentle influence, moving with nature's flow

const DimensionalResonance: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let time = 0;
    
    // Configuration for three-dimensional layers - REDUCED BY HALF
    const LAYER_COUNT = 5; // Reduced from 10 to 5
    const layers = [];
    
    // Size scale factor (12.5% larger than original)
    const sizeFactor = 1.125; 
    
    // Movement enhancement factor - REDUCED to be closer to original
    const movementFactor = 1.1; // Reduced from 1.8 to 1.1
    
    // Rotation enhancement factor
    const rotationFactor = 1.8; // Enhanced rotation specifically
    
    // Base forms (adjusted for new size)
    const baseForms = [
      { 
        centerX: 225 * sizeFactor, 
        centerY: 200 * sizeFactor, 
        radiusX: 100 * sizeFactor, 
        radiusY: 100 * sizeFactor, 
        rotation: 0, 
        phase: 0 
      },
      {
        centerX: 350 * sizeFactor, 
        centerY: 175 * sizeFactor, 
        radiusX: 90 * sizeFactor, 
        radiusY: 100 * sizeFactor, 
        rotation: Math.PI / 6, 
        phase: 2 
      },
      {
        centerX: 275 * sizeFactor, 
        centerY: 325 * sizeFactor, 
        radiusX: 100 * sizeFactor, 
        radiusY: 90 * sizeFactor, 
        rotation: -Math.PI / 4, 
        phase: 4 
      }
    ];
    
    const setupCanvas = () => {
      canvas.width = width;
      canvas.height = height;
      
      // Recenter the forms to fit in the canvas
      const centerAdjustX = (width / 2) - (275 * sizeFactor);
      const centerAdjustY = (height / 2) - (225 * sizeFactor);
      
      baseForms.forEach(form => {
        form.centerX += centerAdjustX;
        form.centerY += centerAdjustY;
      });
      
      // Each layer leads without forcing, following nature's way
      for (let i = 0; i < LAYER_COUNT; i++) {
        const depth = i / (LAYER_COUNT - 1); // 0 to 1
        const layerForms = baseForms.map(baseForm => {
          // Create variations based on depth
          const scale = 0.8 + depth * 0.4; // Deeper layers are smaller
          return {
            ...baseForm,
            centerX: baseForm.centerX + (depth - 0.5) * 30 * sizeFactor, // Offset deeper layers for parallax
            centerY: baseForm.centerY + (depth - 0.5) * 20 * sizeFactor,
            radiusX: baseForm.radiusX * scale,
            radiusY: baseForm.radiusY * scale,
            rotation: baseForm.rotation + depth * Math.PI * 0.1, // Slight rotation offset
            depth: depth,
            lineCount: Math.floor(30 - depth * 15), 
            lineWidth: 0.5 + depth * 0.7, 
            opacity: 0.2 + depth * 0.8, // Deeper layers are more opaque
            speed: (0.5 + depth * 1.5) * movementFactor // Reduced movement factor
          };
        });
        
        layers.push({
          depth: depth,
          forms: layerForms
        });
      }
    };
    
    const drawSpiralForm = (form, lineCount) => {
      const { centerX, centerY, radiusX, radiusY, rotation, depth, lineWidth, opacity, speed } = form;
      
      // Move with nature's unceasing momentum
      const breathFactor = Math.sin(time * 0.2 * speed + form.phase) * 0.15 * movementFactor + 1;
      const currentRadiusX = radiusX * breathFactor;
      const currentRadiusY = radiusY * breathFactor;
      
      // Enhanced back-and-forth rotation
      const oscillatingRotation = Math.sin(time * 0.15) * 0.2 * rotationFactor;
      const currentRotation = rotation + oscillatingRotation;
      
      for (let i = 0; i < lineCount; i++) {
        const scale = i / lineCount;
        const currentScale = scale * 0.9; // Leave a small hole in the middle
        
        ctx.beginPath();
        
        for (let angle = 0; angle <= Math.PI * 2; angle += 0.05) {
          const spiralOffset = angle * 0.2;
          const r = currentScale + Math.sin(angle * 10 + time * 0.1 * speed + form.phase) * 0.01 * movementFactor;
          
          // Calculate spiral wave effect - reduced amplitude
          const waveX = Math.sin(angle * 5 + time * 0.1 * speed) * radiusX * 0.05 * scale * movementFactor;
          const waveY = Math.cos(angle * 5 + time * 0.1 * speed) * radiusY * 0.05 * scale * movementFactor;
          
          // Calculate position with enhanced back-and-forth rotation
          const rX = currentRadiusX * r * Math.cos(angle + spiralOffset + currentRotation + time * 0.02 * speed);
          const rY = currentRadiusY * r * Math.sin(angle + spiralOffset + currentRotation + time * 0.02 * speed);
          
          const x = centerX + rX + waveX;
          const y = centerY + rY + waveY;
          
          if (angle === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.closePath();
        
        // Adjust opacity based on scale
        const lineOpacity = opacity * (0.2 + scale * 0.8);
        // Using dark gray for project colors
        ctx.strokeStyle = `rgba(50, 50, 50, ${lineOpacity})`;
        ctx.lineWidth = lineWidth;
        ctx.stroke();
      }
    };
    
    const render = () => {
      // Project cream color background
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Draw layers from back to front
      for (let i = 0; i < layers.length; i++) {
        const layer = layers[i];
        
        // Draw each form in the layer
        for (const form of layer.forms) {
          drawSpiralForm(form, form.lineCount);
        }
      }
      
      // Animate over time
      time += 0.005;
      animationFrameId = requestAnimationFrame(render);
    };
    
    setupCanvas();
    render();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
      
      // Clear canvas context
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Clear layers array to prevent memory leaks
      layers.length = 0;
    }
  }, [width, height]);
  
  return (
    <div 
      className="flex items-center justify-center bg-[#F0EEE6]"
      style={{ width: `${width}px`, height: `${height}px` }}
    >
      <canvas
        ref={canvasRef}
        width={width}
        height={height}
        className="max-w-full max-h-full shadow-lg"
      />
    </div>
  );
};

export default DimensionalResonance;

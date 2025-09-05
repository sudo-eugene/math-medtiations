import React, { useState, useEffect, useRef } from 'react';

// themes: yielding overcomes, emptying brings fullness, non-attachment leads to strength
// visualization: A vessel that disperses when touched, finding strength through yielding

const Dispersing3DVase = () => {
  const canvasRef = useRef(null);
      const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
    const mouseRef = useRef({ x: 0, y: 0 });
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 550;
    canvas.height = 550;
    
    let time = 0;
    let nodes = [];
    let animationFrameId = null;
    
    // Initialize vase nodes
    const vaseHeightPoints = 60; // More points for density
    const vaseRadialPoints = 50; // More points around circumference
    
    // Create vessel that yields to become stronger
    for (let i = 0; i < vaseHeightPoints; i++) {
      const t = i / vaseHeightPoints;
      const y = (t - 0.5) * 400; // Vase height
      
      // Vase profile function - creates a traditional vase shape
      let radius = 50;
      
      if (t < 0.05) {
        // Flared rim
        radius = 80 * (1 + (0.05 - t) * 4);
      } else if (t < 0.15) {
        // Upper neck - narrows
        radius = 80 - (t - 0.05) * 300;
      } else if (t < 0.4) {
        // Shoulder - bulge
        radius = 50 + Math.sin((t - 0.15) * Math.PI / 0.25) * 60;
      } else if (t < 0.75) {
        // Body - gentle curve
        radius = 110 - Math.cos((t - 0.4) * Math.PI / 0.35) * 30;
      } else if (t < 0.9) {
        // Lower body - taper
        radius = 80 - (t - 0.75) * 200;
      } else {
        // Base - small foot
        radius = 50 + (t - 0.9) * 100;
      }
      
      for (let j = 0; j < vaseRadialPoints; j++) {
        const angle = (j / vaseRadialPoints) * Math.PI * 2;
        nodes.push({
          originalX: Math.cos(angle) * radius,
          originalY: y,
          originalZ: Math.sin(angle) * radius,
          x: Math.cos(angle) * radius,
          y: y,
          z: Math.sin(angle) * radius,
          vx: 0,
          vy: 0,
          vz: 0,
          dispersing: false,
          disperseTime: 0
        });
      }
    }
    
    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      mouseRef.current = { x, y };
    };
    
    // Global window event handlers
    const handleWindowResize = () => {
      // Maintain canvas size if needed
      // This handler is needed if you want to resize the canvas on window resize
    };
    
    // Add event listeners
    canvas.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('resize', handleWindowResize);
    
    function project3DPoint(x, y, z, rotationX) {
      // 3D rotation around X axis
      const rotatedY = y * Math.cos(rotationX) - z * Math.sin(rotationX);
      const rotatedZ = y * Math.sin(rotationX) + z * Math.cos(rotationX);
      
      // Simple perspective projection
      const scale = 400 / (400 + rotatedZ);
      return {
        x: x * scale + canvas.width / 2,
        y: rotatedY * scale + canvas.height / 2,
        z: rotatedZ,
        scale: scale
      };
    }
    
    function animate() {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      time += 0.005; // Cut base speed in half
      const rotationX = time * 0.15; // Cut rotation speed in half
      
      // Update nodes
      const candidateNodes = [];
      
      // First pass: find nodes close to mouse
      nodes.forEach(node => {
        const projected = project3DPoint(node.x, node.y, node.z, rotationX);
        const distanceToMouse = Math.hypot(projected.x - (mouseRef.current?.x || 0), projected.y - (mouseRef.current?.y || 0));
        
        if (distanceToMouse < 120 && !node.dispersing) {
          candidateNodes.push({ node, distance: distanceToMouse });
        }
      });
      
      // Sort candidates by distance and only disperse the 5 closest
      candidateNodes.sort((a, b) => a.distance - b.distance);
      candidateNodes.slice(0, 5).forEach(({ node }) => {
        // Start dispersing
        node.dispersing = true;
        node.disperseTime = 0;
        
        // Calculate disperse direction from center of vase to node
        const disperseAngle = Math.atan2(node.z, node.x);
        const disperseY = node.y / 200; // Vertical component
        
        node.vx = Math.cos(disperseAngle) * 1.5; // Cut dispersion velocity in half
        node.vy = disperseY * 1;
        node.vz = Math.sin(disperseAngle) * 1.5;
      });
      
      // Update dispersing nodes
      nodes.forEach(node => {
        if (node.dispersing) {
          // Update disperse animation
          node.disperseTime += 0.01; // Cut disperse time increment in half
          
          // Apply velocity
          node.x += node.vx;
          node.y += node.vy;
          node.z += node.vz;
          
          // Gravity effect
          node.vy += 0.04; // Cut gravity in half
          
          // Friction
          node.vx *= 0.96;
          node.vy *= 0.96;
          node.vz *= 0.96;
          
          // Reset if too far or timeout
          if (node.disperseTime > 4 || Math.abs(node.x) > 300 || Math.abs(node.z) > 300) {
            node.dispersing = false;
            node.x = node.originalX;
            node.y = node.originalY;
            node.z = node.originalZ;
            node.vx = 0;
            node.vy = 0;
            node.vz = 0;
          }
        }
      });
      
      // Sort nodes by depth for proper rendering
      const sortedNodes = [...nodes].sort((a, b) => {
        const projectedA = project3DPoint(a.x, a.y, a.z, rotationX);
        const projectedB = project3DPoint(b.x, b.y, b.z, rotationX);
        return projectedB.z - projectedA.z;
      });
      
      // Draw nodes
      sortedNodes.forEach(node => {
        const projected = project3DPoint(node.x, node.y, node.z, rotationX);
        
        // Calculate opacity and size based on depth
        const depth = (projected.z + 200) / 400;
        const alpha = node.dispersing ? 
          0.3 * projected.scale * (1 - node.disperseTime / 5) : 
          0.6 * projected.scale;
        
        const size = 0.5 + 0.25 * projected.scale; // 25% of original size
        
        ctx.fillStyle = `rgba(68, 68, 68, ${alpha})`;
        ctx.beginPath();
        ctx.arc(projected.x, projected.y, size, 0, Math.PI * 2);
        ctx.fill();
      });
      
      // Draw central emptiness - the source of fullness
      const centerY = canvas.height / 2;
      const voidGradient = ctx.createRadialGradient(
        canvas.width / 2, centerY, 0,
        canvas.width / 2, centerY, 80
      );
      voidGradient.addColorStop(0, 'rgba(240, 238, 230, 0.8)');
      voidGradient.addColorStop(1, 'rgba(240, 238, 230, 0)');
      
      ctx.fillStyle = voidGradient;
      ctx.beginPath();
      ctx.ellipse(canvas.width / 2, centerY, 80, 20, 0, 0, Math.PI * 2);
      ctx.fill();
      
      animationFrameId = requestAnimationFrame(animate);
    }
    
    // Start animation
    animate();
    
    // Cleanup function
    return () => {
      // Cancel animation frame
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Remove all event listeners
      canvas.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('resize', handleWindowResize);
      
      // Clear canvas context
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Clear all data structures to prevent memory leaks
      nodes.length = 0;
      mouseRef.current = null;
    };
  }, []);
  
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-[550px] h-[550px] shadow-lg rounded-lg overflow-hidden">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full cursor-pointer"
        />
      </div>
    </div>
  );
};

export default Dispersing3DVase;

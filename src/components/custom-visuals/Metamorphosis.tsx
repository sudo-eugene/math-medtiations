import React, { useEffect, useRef } from 'react';

// themes: inner over outer, simplicity over sensation, open heart over thought
// visualization: A form that transforms from complex to simple, revealing inner essence beneath surface appearance

const Metamorphosis = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Configuration
    const numLines = 120;
    const lineSegments = 180;
    const lineAlpha = 0.5;
    const lineWidth = 0.6;
    const morphSpeed = 0.0005;
    const rotateSpeed = 0.00025;
    
    // Start after initial pause
    let time = 2000;
    
    // Form definitions - moving from outer complexity to inner simplicity
    const forms = [
      // Form 1: Draped cloth-like shape
      (u, v, t) => {
        const theta = u * Math.PI * 2;
        const phi = v * Math.PI;
        
        let r = 120 + 30 * Math.sin(phi * 4 + theta * 2);
        r += 20 * Math.sin(phi * 6) * Math.cos(theta * 3);
        
        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.sin(phi) * Math.sin(theta);
        let z = r * Math.cos(phi) + 20 * Math.sin(theta * 5 + phi * 3);
        
        return { x, y, z };
      },
      
      // Form 2: More angular folded shape
      (u, v, t) => {
        const theta = u * Math.PI * 2;
        const phi = v * Math.PI;
        
        let r = 150 + 20 * Math.cos(phi * 8);
        r *= 0.8 + 0.2 * Math.abs(Math.cos(theta * 2));
        
        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.sin(phi) * Math.sin(theta);
        let z = r * Math.cos(phi) * (0.8 + 0.3 * Math.sin(theta * 4));
        
        return { x, y, z };
      },
      
      // Form 3: Organic bulbous shape
      (u, v, t) => {
        const theta = u * Math.PI * 2;
        const phi = v * Math.PI;
        
        let r = 120;
        r += 50 * Math.sin(phi * 3) * Math.sin(theta * 2.5);
        r += 30 * Math.cos(phi * 5 + theta);
        
        let x = r * Math.sin(phi) * Math.cos(theta);
        let y = r * Math.sin(phi) * Math.sin(theta);
        let z = r * Math.cos(phi);
        
        // Create some hollow areas
        const hollow = Math.max(0, Math.sin(phi * 2 + theta * 3) - 0.7);
        r *= 1 - hollow * 0.8;
        
        return { x, y, z };
      }
    ];
    
    // Interpolate between forms - letting go of surface to reveal essence
    const interpolateForms = (formA, formB, u, v, t, blend) => {
      const pointA = formA(u, v, t);
      const pointB = formB(u, v, t);
      
      return {
        x: pointA.x * (1 - blend) + pointB.x * blend,
        y: pointA.y * (1 - blend) + pointB.y * blend,
        z: pointA.z * (1 - blend) + pointB.z * blend
      };
    };
    
    // Get the current form - opening to transformation with an open heart
    const getCurrentForm = (u, v, t) => {
      // Calculate which two forms to blend between
      const totalForms = forms.length;
      const cycleTime = 600; // Time to complete one full cycle
      const position = (t % (cycleTime * totalForms)) / cycleTime;
      const formIndex = Math.floor(position);
      const nextFormIndex = (formIndex + 1) % totalForms;
      
      // Calculate blend with pause and easing
      let rawBlend = position - formIndex;
      
      // No pause between transitions
      const pauseTime = 0;
      const transitionTime = 1 - (pauseTime * 2); // Remaining time for the transition
      
      let blend;
      if (rawBlend < pauseTime) {
        // Initial pause
        blend = 0;
      } else if (rawBlend > (1 - pauseTime)) {
        // End pause
        blend = 1;
      } else {
        // Transition with easing
        const normalizedTime = (rawBlend - pauseTime) / transitionTime;
        // Ease in-out cubic
        blend = normalizedTime < 0.5
          ? 4 * normalizedTime * normalizedTime * normalizedTime
          : 1 - Math.pow(-2 * normalizedTime + 2, 3) / 2;
      }
      
      return interpolateForms(
        forms[formIndex], 
        forms[nextFormIndex], 
        u, v, t, blend
      );
    };
    
    // Animation loop
    const animate = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      // Calculate rotation based on time
      const rotateX = Math.sin(time * rotateSpeed) * 0.5;
      const rotateY = Math.cos(time * rotateSpeed * 0.7) * 0.3;
      const rotateZ = time * rotateSpeed * 0.1;
      
      // Draw horizontal contour lines
      for (let i = 0; i < numLines; i++) {
        const v = i / (numLines - 1);
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(51, 51, 51, ${lineAlpha})`;
        ctx.lineWidth = lineWidth;
        
        let lastPointVisible = false;
        let lastPoint = null;
        
        for (let j = 0; j <= lineSegments; j++) {
          const u = j / lineSegments;
          
          // Get the current form
          const point = getCurrentForm(u, v, time);
          
          // Apply rotation
          const rotatedX = point.x * Math.cos(rotateZ) - point.y * Math.sin(rotateZ);
          const rotatedY = point.x * Math.sin(rotateZ) + point.y * Math.cos(rotateZ);
          const rotatedZ = point.z;
          
          // Project to screen
          const scale = 1.5 + rotatedZ * 0.001;
          const projX = width / 2 + rotatedX * scale;
          const projY = height / 2 + rotatedY * scale;
          
          // Check if point should be visible (simple back-face culling)
          const pointVisible = rotatedZ > -50;
          
          if (j === 0) {
            if (pointVisible) {
              ctx.moveTo(projX, projY);
              lastPointVisible = true;
              lastPoint = { x: projX, y: projY };
            }
          } else {
            if (pointVisible && lastPointVisible) {
              ctx.lineTo(projX, projY);
            } else if (pointVisible && !lastPointVisible) {
              ctx.moveTo(projX, projY);
            }
          }
          
          lastPointVisible = pointVisible;
          lastPoint = { x: projX, y: projY };
        }
        
        ctx.stroke();
      }
      
      // Draw vertical contour lines (fewer)
      for (let i = 0; i < numLines * 0.3; i++) {
        const u = i / (numLines * 0.3 - 1);
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(51, 51, 51, ${lineAlpha * 0.7})`;
        ctx.lineWidth = lineWidth * 0.7;
        
        let lastPointVisible = false;
        let lastPoint = null;
        
        for (let j = 0; j <= lineSegments * 0.5; j++) {
          const v = j / (lineSegments * 0.5);
          
          // Get the current form
          const point = getCurrentForm(u, v, time);
          
          // Apply rotation
          const rotatedX = point.x * Math.cos(rotateZ) - point.y * Math.sin(rotateZ);
          const rotatedY = point.x * Math.sin(rotateZ) + point.y * Math.cos(rotateZ);
          const rotatedZ = point.z;
          
          // Project to screen
          const scale = 1.5 + rotatedZ * 0.001;
          const projX = width / 2 + rotatedX * scale;
          const projY = height / 2 + rotatedY * scale;
          
          // Check if point should be visible
          const pointVisible = rotatedZ > -50;
          
          if (j === 0) {
            if (pointVisible) {
              ctx.moveTo(projX, projY);
              lastPointVisible = true;
              lastPoint = { x: projX, y: projY };
            }
          } else {
            if (pointVisible && lastPointVisible) {
              ctx.lineTo(projX, projY);
            } else if (pointVisible && !lastPointVisible) {
              ctx.moveTo(projX, projY);
            }
          }
          
          lastPointVisible = pointVisible;
          lastPoint = { x: projX, y: projY };
        }
        
        ctx.stroke();
      }
      
      time += 0.5;
      animationFrameRef.current = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      if (canvas && ctx) {
        ctx.clearRect(0, 0, width, height);
      }
    };
  }, []);
  
  return (
    <div className="flex items-center justify-center bg-[#F0EEE6] w-full h-full">
      <canvas ref={canvasRef} width={550} height={550} />
    </div>
  );
};

export default Metamorphosis;

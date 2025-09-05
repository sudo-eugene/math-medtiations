import React, { useEffect, useRef } from 'react';

// themes: natural silence, opening to source, trust in response
// visualization: Forms spiral inward to silence, naturally responding to an unseen center

const FibonacciRectangleSpiral = () => {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    canvas.width = 550;
    canvas.height = 550;
    
    let time = 0;
    const phi = (1 + Math.sqrt(5)) / 2; // Golden ratio
    let animationFrameId = null;
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.save();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      
      // Animate the number of rectangles
      const maxRectangles = Math.min(60, Math.floor((time * 0.02) % 80));
      
      // Begin from silence at the center
      let width = 300;
      let height = width / phi;
      let scale = 1;
      let angle = time * 0.00025; // Half speed global rotation
      
      for (let i = 0; i < maxRectangles; i++) {
        ctx.save();
        
        // Calculate position along Fibonacci spiral
        const spiralAngle = i * 0.174533; // Approximately 10 degrees per step
        const radius = scale * 100;
        
        // Position rectangle along the spiral
        const x = Math.cos(spiralAngle) * radius;
        const y = Math.sin(spiralAngle) * radius;
        
        ctx.translate(x, y);
        ctx.rotate(spiralAngle + angle);
        
        // Draw the rectangle with lighter lines
        const alpha = 0.5 - i * 0.01;  // Reduced base alpha from 0.85 to 0.5
        ctx.strokeStyle = `rgba(83, 81, 70, ${alpha})`;  // Using rubin-slate color (535146) instead of black
        ctx.lineWidth = 0.8;  // Slightly thinner lines
        ctx.strokeRect(-width/2, -height/2, width, height);
        
        // Add subtle internal divisions
        if (i % 3 === 0) {
          // Draw diagonals
          ctx.beginPath();
          ctx.moveTo(-width/2, -height/2);
          ctx.lineTo(width/2, height/2);
          ctx.moveTo(width/2, -height/2);
          ctx.lineTo(-width/2, height/2);
          ctx.strokeStyle = `rgba(50, 50, 50, ${alpha * 0.2})`;
          ctx.lineWidth = 0.5;
          ctx.stroke();
        }
        
        ctx.restore();
        
        // Update for next rectangle
        // Scale down by the golden ratio
        width *= 0.95;
        height *= 0.95;
        scale *= 0.98;
      }
      
      // Draw the natural response to source
      ctx.beginPath();
      for (let i = 0; i <= maxRectangles; i++) {
        const spiralAngle = i * 0.174533;
        const radius = Math.pow(0.98, i) * 100;
        const x = Math.cos(spiralAngle) * radius;
        const y = Math.sin(spiralAngle) * radius;
        
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.strokeStyle = 'rgba(150, 150, 150, 0.3)';
      ctx.lineWidth = 1;
      ctx.stroke();
      
      // No center circle - keeping clean like the reference
      
      ctx.restore();
      
      time += 0.75; // 75% speed time increment
      animationFrameId = requestAnimationFrame(animate);
    };
    
    animate();
    
    // Cleanup function to cancel animation frame when component unmounts
    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      
      // Clear canvas context
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, []);
  
  return (
    <div className="flex items-center justify-center w-full h-full">
      <div className="w-[550px] h-[550px] bg-[#F0EEE6]">
        <canvas 
          ref={canvasRef} 
          className="w-full h-full"
        />
      </div>
    </div>
  );
};

export default FibonacciRectangleSpiral;

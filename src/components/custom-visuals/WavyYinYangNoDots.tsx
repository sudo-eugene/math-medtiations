import React, { useEffect, useRef } from 'react';

// themes: present awareness, leading without control, doing without expectation
// visualization: A meditative circle that breathes and flows while remaining centered in stillness

const WavyYinYangNoDots = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = width * 0.45;
    
    let time = 0;
    
    const draw = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      // Draw wavy concentric lines - present in each moment of transformation
      for (let r = 5; r < maxRadius; r += 3) {
        ctx.beginPath();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 0.6;
        
        for (let angle = 0; angle < Math.PI * 2; angle += 0.02) {
          // Animate the wave with time
          const wave = Math.sin(angle * 8 + r * 0.1 + time) * 2;
          const x = centerX + (r + wave) * Math.cos(angle);
          const y = centerY + (r + wave) * Math.sin(angle);
          
          // Create yin-yang boundary - leading without controlling its flow
          const isYin = (angle > Math.PI) ? 
            (Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - (centerY + maxRadius/4), 2)) < maxRadius/4) :
            (Math.sqrt(Math.pow(x - centerX, 2) + Math.pow(y - (centerY - maxRadius/4), 2)) > maxRadius/4);
          
          if (isYin) {
            ctx.strokeStyle = 'rgba(0,0,0,0.3)';
            ctx.lineTo(x, y);
          } else {
            ctx.strokeStyle = '#000';
            ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
      
      // Continue without expectation, each frame arising naturally
      time += 0.015;
      animationFrameRef.current = requestAnimationFrame(draw);
    };
    
    draw();
    
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    }
  }, []);
  
  return (
    <div style={{ width: '550px', height: '550px', backgroundColor: '#F0EEE6' }}>
      <canvas ref={canvasRef} width="550" height="550" />
    </div>
  );
};

export default WavyYinYangNoDots;

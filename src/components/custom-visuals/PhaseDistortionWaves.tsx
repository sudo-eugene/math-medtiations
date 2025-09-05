import React, { useEffect, useRef } from 'react';

// themes: source flows everywhere, silent fulfillment, humble greatness
// visualization: Waves flow silently in all directions, achieving greatness without recognition

export default function PhaseDistortionWaves() {
  const canvasRef = useRef(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    
    // Set canvas dimensions
    canvas.width = 550;
    canvas.height = 550;
    
    let t = 0;
    
    // Draw waves that silently fulfill their nature
    const drawWave = (yCenter, amplitude, frequency, phaseOffset, thickness) => {
      ctx.beginPath();
      
      // Draw wave path
      for (let x = 0; x < canvas.width; x++) {
        // Calculate phase distortion based on position and time (slowed down)
        const distortion = 
          Math.sin(x * 0.02 + t * 0.05) * 2 + 
          Math.cos(x * 0.01 - t * 0.03) * 3;
        
        // Apply distortion to base wave
        const y = yCenter + 
                 amplitude * Math.sin(x * frequency + t + phaseOffset + distortion);
        
        if (x === 0) {
          ctx.moveTo(x, y);
        } else {
          ctx.lineTo(x, y);
        }
      }
      
      ctx.lineWidth = thickness;
      ctx.stroke();
    };
    
    let animationFrameId;
    const render = () => {
      // Clear canvas with specified background color
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      ctx.strokeStyle = 'rgba(51, 51, 51, 0.6)';
      
      // Draw multiple waves with different parameters
      const waveCount = 15;
      for (let i = 0; i < waveCount; i++) {
        const yCenter = 100 + (canvas.height - 200) * (i / (waveCount - 1));
        const amplitude = 10 + Math.sin(t * 0.025 + i * 0.3) * 5;
        const frequency = 0.02 + 0.01 * Math.sin(i * 0.2);
        const phaseOffset = i * 0.3;
        const thickness = 1 + Math.sin(t + i) * 0.5;
        
        drawWave(yCenter, amplitude, frequency, phaseOffset, thickness);
      }
      
      // Source flows in all directions with humble grace
      ctx.globalCompositeOperation = 'multiply';
      ctx.strokeStyle = 'rgba(51, 51, 51, 0.3)';
      
      for (let i = 0; i < waveCount; i++) {
        const xCenter = 100 + (canvas.width - 200) * (i / (waveCount - 1));
        const amplitude = 15 + Math.cos(t * 0.04 + i * 0.3) * 8;
        const frequency = 0.02 + 0.01 * Math.cos(i * 0.3);
        const phaseOffset = i * 0.4;
        const thickness = 1 + Math.cos(t + i) * 0.5;
        
        // Draw vertical waves
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(Math.PI / 2);
        ctx.translate(-canvas.width / 2, -canvas.height / 2);
        
        drawWave(xCenter, amplitude, frequency, phaseOffset, thickness);
        
        ctx.restore();
      }
      
      ctx.globalCompositeOperation = 'source-over';
      
      t += 0.004;
      animationFrameId = requestAnimationFrame(render);
    };
    
    render();
    
    return () => {
      // Cleanup
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
    <div 
      className="w-full h-screen flex items-center justify-center"
      style={{ backgroundColor: '#F0EEE6' }}
    >
      <div 
        style={{ width: '550px', height: '550px' }}
        className="border border-gray-200 rounded-md shadow-md"
      >
        <canvas 
          ref={canvasRef} 
          className="w-full h-full rounded-md"
        />
      </div>
    </div>
  );
}
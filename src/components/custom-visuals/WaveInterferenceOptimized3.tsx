import { useEffect, useRef } from 'react';

// Themes: power through humility, leading from below, non-competition
// Visualization: Waves that influence each other without domination, showing how strength emerges from yielding

const WaveInterferenceOptimized3 = () => {
  const canvasRef = useRef(null);
  const animationFrameRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d', { alpha: false });
    const width = 550;
    const height = 550;
    canvas.width = width;
    canvas.height = height;

    // Optimized resolution
    const resolution = 5;
    const rows = Math.floor(height / resolution);
    const cols = Math.floor(width / resolution);
    
    // Begin with a central source that serves all others
    const sources = [
      { x: width/2, y: height/2, wavelength: 60, phase: 0, amplitude: 1.5 }, // Gentle influence
    ];
    
    // Each source finds its place in the whole
    const numRadialSources = 6;  // Balance in relationship
    const radius = 150;          // Space to unfold
    for (let i = 0; i < numRadialSources; i++) {
      const angle = (i / numRadialSources) * Math.PI * 2;
      sources.push({
        x: width/2 + Math.cos(angle) * radius,
        y: height/2 + Math.sin(angle) * radius,
        wavelength: 50, // Doubled wavelength for slower waves
        phase: angle,
        amplitude: 0.8
      });
    }

    let time = 0;
    
    // Pre-allocate arrays
    const field = new Float32Array(rows * cols);
    
    // Create offscreen canvas for double buffering
    const bufferCanvas = document.createElement('canvas');
    bufferCanvas.width = width;
    bufferCanvas.height = height;
    const bufferCtx = bufferCanvas.getContext('2d', { alpha: false });

    const animate = () => {
      // Clear buffer
      bufferCtx.fillStyle = '#F0EEE6';
      bufferCtx.fillRect(0, 0, width, height);

      // Calculate interference pattern
      for (let i = 0; i < rows; i++) {
        for (let j = 0; j < cols; j++) {
          const x = j * resolution;
          const y = i * resolution;
          let amplitude = 0;

          // Optimized source calculation
          for (let s = 0; s < sources.length; s++) {
            const source = sources[s];
            const dx = x - source.x;
            const dy = y - source.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            // Simplified falloff
            const falloff = Math.max(0, 1 - distance / 400);
            amplitude += source.amplitude * falloff * 
              Math.sin((distance / source.wavelength - time) * 2 * Math.PI + source.phase);
          }

          field[i * cols + j] = amplitude;
        }
      }

      // Optimized contour drawing
      bufferCtx.strokeStyle = '#333';
      bufferCtx.lineWidth = 1;
      bufferCtx.beginPath();
      
      // Single contour level for performance
      const level = 0;
      
      for (let i = 0; i < rows - 1; i++) {
        for (let j = 0; j < cols - 1; j++) {
          const idx = i * cols + j;
          const x = j * resolution;
          const y = i * resolution;
          
          // Simplified marching squares (only 4 cases)
          const v00 = field[idx] > level;
          const v10 = field[idx + 1] > level;
          const v11 = field[idx + cols + 1] > level;
          const v01 = field[idx + cols] > level;
          
          if (v00 && !v10) {
            bufferCtx.moveTo(x + resolution / 2, y);
            bufferCtx.lineTo(x + resolution, y + resolution / 2);
          }
          if (v10 && !v11) {
            bufferCtx.moveTo(x + resolution, y + resolution / 2);
            bufferCtx.lineTo(x + resolution / 2, y + resolution);
          }
          if (v11 && !v01) {
            bufferCtx.moveTo(x + resolution / 2, y + resolution);
            bufferCtx.lineTo(x, y + resolution / 2);
          }
          if (v01 && !v00) {
            bufferCtx.moveTo(x, y + resolution / 2);
            bufferCtx.lineTo(x + resolution / 2, y);
          }
        }
      }
      
      bufferCtx.stroke();
      
      // Draw buffer to main canvas
      ctx.drawImage(bufferCanvas, 0, 0);

      time += 0.000625; // 1/32 speed
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      // Cancel the animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      
      // Clear the canvas
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      // Clear the buffer canvas
      if (bufferCanvas && bufferCtx) {
        bufferCtx.clearRect(0, 0, bufferCanvas.width, bufferCanvas.height);
        bufferCanvas.width = 0; // Force garbage collection
        bufferCanvas.height = 0;
      }
      
      // Clear arrays
      field.fill(0);
    };
  }, []);

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      alignItems: 'center',
      width: '100%', 
      height: '100%', 
      backgroundColor: '#F0EEE6' 
    }}>
      <canvas 
        ref={canvasRef} 
        style={{ 
          width: '550px',
          height: '550px'
        }} 
      />
    </div>
  );
};

export default WaveInterferenceOptimized3;
import { useRef, useEffect, useState } from 'react';

// Themes: learning from failure, personal responsibility, natural service
// Visualization: Lines that find their way through entanglement, showing how clarity emerges from confusion

const TangledLines = () => {
  const canvasRef = useRef(null);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Zoom control - adjust this to zoom in/out
  const zoom = 1;  // 1 = normal, 0.5 = zoomed out, 2 = zoomed in
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    
    // Function to resize canvas while maintaining aspect ratio
    const resizeCanvas = () => {
      const container = canvas.parentElement;
      const containerWidth = container.clientWidth;
      const containerHeight = container.clientHeight;
      
      // Set canvas size to container size
      canvas.width = containerWidth;
      canvas.height = containerHeight;
      
      // Calculate the aspect ratio to use
      const canvasAspectRatio = containerWidth / containerHeight;
      
      // Set canvas internal drawing size
      canvas.style.width = containerWidth + 'px';
      canvas.style.height = containerHeight + 'px';
    };
    
    // Initial resize
    resizeCanvas();
    
    // Resize canvas when window resizes
    window.addEventListener('resize', resizeCanvas);
    
    let time = 0;
    let layers = [];
    const layerCount = 7; // Represents the hierarchical levels
    
    class Layer {
      constructor(index) {
        this.index = index;
        this.radius = 50 + index * 35;
        this.rotation = 0;
        this.particles = [];
        this.particleCount = 3 + index * 4;
        this.thickness = 0.5 + index * 0.2;
        this.drift = Math.random() * Math.PI * 2;
        
        // Create particles for each layer
        for (let i = 0; i < this.particleCount; i++) {
          this.particles.push({
            angle: (i / this.particleCount) * Math.PI * 2,
            offset: Math.random() * 10,
            phase: Math.random() * Math.PI * 2,
            amplitude: 3 + Math.random() * 5,
            flowSpeed: 0.0017 + Math.random() * 0.0017  // Reduced to 1/3 of previous value
          });
        }
      }
      
      update(mouseInfluence) {
        this.rotation += (0.00025 / (this.index + 1)) * (1 + mouseInfluence * 0.2);  // Reduced to 1/3 of previous value
        this.drift += 0.0008;  // Reduced to 1/3 of previous value
        
        // Update particle positions
        this.particles.forEach(particle => {
          particle.angle += particle.flowSpeed * (1 - this.index / layerCount);
        });
      }
      
      draw(ctx, centerX, centerY, mouseInfluence, scale) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        
        // Draw main ring with 20% opacity
        ctx.beginPath();
        ctx.strokeStyle = `rgba(80, 80, 80, 0.20)`;
        ctx.lineWidth = this.thickness;
        
        // Create more organic, flowing path using particles
        this.particles.forEach((particle, i) => {
          const angle = particle.angle + Math.sin(time * 0.04 + particle.phase) * 0.1;  // Reduced to 1/3 of previous value
          const radiusOffset = Math.sin(time + particle.phase) * particle.amplitude;
          const radius = this.radius + radiusOffset + particle.offset;
          
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius;
          
          if (i === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        });
        
        ctx.closePath();
        ctx.stroke();
        
        ctx.restore();
      }
    }
    
    // Create hierarchical layers
    for (let i = 0; i < layerCount; i++) {
      layers.push(new Layer(i));
    }
    
    function animate() {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      // Calculate mouse influence
      const dx = mousePosition.x - centerX;
      const dy = mousePosition.y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      const mouseInfluence = Math.max(0, 1 - distance / 200);
      
      // Calculate scale based on canvas dimensions and zoom
      const minDimension = Math.min(canvas.width, canvas.height);
      const scale = (minDimension / 800) * zoom; // 800 is the base dimension
      
      // Draw subtle radial energy lines
      const rayCount = 24;
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + time * 0.004;  // Reduced to 1/3 of previous value
        const length = 300 * scale + Math.sin(time + i) * 50 * scale;
        
        ctx.beginPath();
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.05)';
        ctx.lineWidth = 0.5;
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
          centerX + Math.cos(angle) * length,
          centerY + Math.sin(angle) * length
        );
        ctx.stroke();
      }
      
      // Update and draw layers from inner to outer
      layers.forEach(layer => {
        layer.update(mouseInfluence);
      });
      
      // Draw layers in reverse order (outer first for proper overlap)
      for (let i = layers.length - 1; i >= 0; i--) {
        layers[i].draw(ctx, centerX, centerY, mouseInfluence, scale);
      }
      
      time += 0.0005;  // Further reduced from 0.0015 to 0.0005
      animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      window.removeEventListener('resize', resizeCanvas);
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }
      
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
      
      layers.forEach(layer => {
        if (layer.particles) {
          layer.particles.length = 0;
        }
      });
      layers.length = 0;
      time = 0;
    };
  }, []);
  
  const handleMouseMove = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const rect = canvas.getBoundingClientRect();
    setMousePosition({
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    });
  };
  
  return (
    <div style={{ 
      backgroundColor: '#F0EEE6',
      margin: 0,
      padding: 0,
      overflow: 'hidden',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center'
    }}>
      <canvas 
        ref={canvasRef} 
        onMouseMove={handleMouseMove}
        style={{ 
          cursor: 'crosshair',
          display: 'block'
        }}
      />
    </div>
  );
};

export default TangledLines;
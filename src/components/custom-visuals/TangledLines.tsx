import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

// Themes: learning from failure, personal responsibility, natural service
// Visualization: Lines that find their way through entanglement, showing how clarity emerges from confusion

const TangledLines: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const zoom = 1;
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    
    canvas.width = width;
    canvas.height = height;
    
    let time = 0;
    let layers: Layer[] = [];
    const layerCount = 7;
    
    class Layer {
      index: number;
      radius: number;
      rotation: number;
      particles: { angle: number; offset: number; phase: number; amplitude: number; flowSpeed: number; }[];
      particleCount: number;
      thickness: number;
      drift: number;

      constructor(index: number) {
        this.index = index;
        this.radius = 50 + index * 35;
        this.rotation = 0;
        this.particles = [];
        this.particleCount = 3 + index * 4;
        this.thickness = 0.5 + index * 0.2;
        this.drift = Math.random() * Math.PI * 2;
        
        for (let i = 0; i < this.particleCount; i++) {
          this.particles.push({
            angle: (i / this.particleCount) * Math.PI * 2,
            offset: Math.random() * 10,
            phase: Math.random() * Math.PI * 2,
            amplitude: 3 + Math.random() * 5,
            flowSpeed: 0.0017 + Math.random() * 0.0017
          });
        }
      }
      
      update() {
        this.rotation += (0.00025 / (this.index + 1));
        this.drift += 0.0008;
        
        this.particles.forEach(particle => {
          particle.angle += particle.flowSpeed * (1 - this.index / layerCount);
        });
      }
      
      draw(ctx: CanvasRenderingContext2D, centerX: number, centerY: number, scale: number) {
        ctx.save();
        ctx.translate(centerX, centerY);
        ctx.rotate(this.rotation);
        
        ctx.beginPath();
        ctx.strokeStyle = `rgba(80, 80, 80, 0.20)`;
        ctx.lineWidth = this.thickness;
        
        this.particles.forEach((particle, i) => {
          const angle = particle.angle + Math.sin(time * 0.04 + particle.phase) * 0.1;
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
    
    for (let i = 0; i < layerCount; i++) {
      layers.push(new Layer(i));
    }
    
    function animate() {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      const centerX = canvas.width / 2;
      const centerY = canvas.height / 2;
      
      const minDimension = Math.min(canvas.width, canvas.height);
      const scale = (minDimension / 800) * zoom;
      
      const rayCount = 24;
      for (let i = 0; i < rayCount; i++) {
        const angle = (i / rayCount) * Math.PI * 2 + time * 0.004;
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
      
      layers.forEach(layer => {
        layer.update();
      });
      
      for (let i = layers.length - 1; i >= 0; i--) {
        layers[i].draw(ctx, centerX, centerY, scale);
      }
      
      time += 0.0005;
      animationFrameId = requestAnimationFrame(animate);
    }
    
    animate();
    
    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [width, height, zoom]);
  
  return (
    <div style={{ 
      width: `${width}px`,
      height: `${height}px`,
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
        width={width}
        height={height}
        style={{ 
          display: 'block'
        }}
      />
    </div>
  );
};

export default TangledLines;
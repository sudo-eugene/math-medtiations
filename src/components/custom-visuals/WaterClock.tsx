import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: temporal fluidity, time as flowing water, impossible geometric vessels
// visualization: Time flows like water through impossible geometric vessels, embodying temporal fluidity

const WaterClock: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;
    
    let time = 0;
    let animationId;
    let droplets = [];
    let vessels = [];
    
    class Vessel {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'hourglass', 'spiral', 'infinity'
        this.size = 40 + Math.random() * 30;
        this.rotation = 0;
        this.rotationSpeed = (Math.random() - 0.5) * 0.005;
        this.waterLevel = 0;
        this.targetWaterLevel = 0;
        this.fillPhase = Math.random() * Math.PI * 2;
        this.opacity = 0.3 + Math.random() * 0.3;
      }
      
      update(time) {
        this.rotation += this.rotationSpeed;
        this.fillPhase += 0.02;
        
        // Cyclic water level
        this.targetWaterLevel = (Math.sin(time * 0.01 + this.fillPhase) + 1) / 2;
        this.waterLevel += (this.targetWaterLevel - this.waterLevel) * 0.01;
      }
      
      draw(ctx) {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        
        ctx.strokeStyle = `rgba(60, 60, 60, ${this.opacity})`;
        ctx.lineWidth = 1.2;
        
        if (this.type === 'hourglass') {
          this.drawHourglass(ctx);
        } else if (this.type === 'spiral') {
          this.drawSpiral(ctx);
        } else if (this.type === 'infinity') {
          this.drawInfinity(ctx);
        }
        
        ctx.restore();
      }
      
      drawHourglass(ctx) {
        const size = this.size;
        
        // Hourglass outline
        ctx.beginPath();
        ctx.moveTo(-size/2, -size);
        ctx.lineTo(size/2, -size);
        ctx.lineTo(size/4, -size/4);
        ctx.lineTo(0, 0);
        ctx.lineTo(-size/4, -size/4);
        ctx.closePath();
        ctx.moveTo(-size/2, size);
        ctx.lineTo(size/2, size);
        ctx.lineTo(size/4, size/4);
        ctx.lineTo(0, 0);
        ctx.lineTo(-size/4, size/4);
        ctx.closePath();
        ctx.stroke();
        
        // Water in bottom chamber
        const waterHeight = this.waterLevel * size * 0.8;
        if (waterHeight > 0) {
          ctx.fillStyle = `rgba(70, 70, 70, ${this.opacity * 0.5})`;
          ctx.beginPath();
          ctx.moveTo(-size/2, size);
          ctx.lineTo(size/2, size);
          ctx.lineTo(size/4, size/4);
          ctx.lineTo(-size/4, size/4);
          ctx.closePath();
          ctx.fill();
        }
      }
      
      drawSpiral(ctx) {
        const size = this.size;
        const turns = 3;
        const points = 60;
        
        ctx.beginPath();
        for (let i = 0; i <= points; i++) {
          const t = i / points;
          const angle = t * turns * Math.PI * 2;
          const radius = size * (0.5 - t * 0.4);
          const x = Math.cos(angle) * radius;
          const y = Math.sin(angle) * radius - size * t;
          
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Water following spiral
        const waterPoints = Math.floor(points * this.waterLevel);
        if (waterPoints > 0) {
          ctx.strokeStyle = `rgba(50, 50, 50, ${this.opacity * 0.7})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          
          for (let i = 0; i <= waterPoints; i++) {
            const t = i / points;
            const angle = t * turns * Math.PI * 2;
            const radius = size * (0.5 - t * 0.4);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius - size * t;
            
            if (i === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      
      drawInfinity(ctx) {
        const size = this.size;
        const a = size * 0.6;
        
        // Infinity symbol (lemniscate)
        ctx.beginPath();
        for (let t = 0; t <= Math.PI * 2; t += 0.1) {
          const x = a * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
          const y = a * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
          
          if (t === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        
        // Water flowing through infinity
        const waterT = this.waterLevel * Math.PI * 2;
        if (waterT > 0) {
          ctx.strokeStyle = `rgba(50, 50, 50, ${this.opacity * 0.7})`;
          ctx.lineWidth = 3;
          ctx.beginPath();
          
          for (let t = 0; t <= waterT; t += 0.1) {
            const x = a * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
            const y = a * Math.sin(t) * Math.cos(t) / (1 + Math.sin(t) * Math.sin(t));
            
            if (t === 0) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
          ctx.stroke();
        }
      }
      
      getWaterSpawnPoint() {
        if (this.type === 'hourglass') {
          return { x: this.x, y: this.y - this.size };
        } else if (this.type === 'spiral') {
          return { x: this.x, y: this.y - this.size/2 };
        } else {
          return { x: this.x - this.size * 0.6, y: this.y };
        }
      }
    }
    
    class WaterDroplet {
      constructor(x, y, vessel) {
        this.x = x;
        this.y = y;
        this.vessel = vessel;
        this.life = 1;
        this.size = 1 + Math.random() * 2;
        this.velocity = {
          x: (Math.random() - 0.5) * 0.5,
          y: Math.random() * 0.5 + 0.2
        };
        this.opacity = 0.4 + Math.random() * 0.3;
        this.gravity = 0.02;
      }
      
      update() {
        this.x += this.velocity.x;
        this.y += this.velocity.y;
        this.velocity.y += this.gravity;
        this.life -= 0.008;
        
        // Interact with vessel
        if (this.vessel) {
          const dx = this.x - this.vessel.x;
          const dy = this.y - this.vessel.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < this.vessel.size * 0.6) {
            this.life -= 0.05; // Absorbed by vessel
          }
        }
      }
      
      draw(ctx) {
        if (this.life <= 0) return;
        
        const alpha = this.life * this.opacity;
        
        // Droplet body
        ctx.fillStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        
        // Droplet trail
        if (this.velocity.y > 0.5) {
          ctx.strokeStyle = `rgba(60, 60, 60, ${alpha * 0.3})`;
          ctx.lineWidth = this.size * 0.5;
          ctx.beginPath();
          ctx.moveTo(this.x, this.y);
          ctx.lineTo(this.x - this.velocity.x * 3, this.y - this.velocity.y * 3);
          ctx.stroke();
        }
      }
    }
    
    const initializeSystem = () => {
      vessels = [];
      droplets = [];
      
      const vesselTypes = ['hourglass', 'spiral', 'infinity'];
      const numVessels = 3 + Math.floor(Math.random() * 2);
      
      for (let i = 0; i < numVessels; i++) {
        const x = width * (0.2 + (i / (numVessels - 1)) * 0.6);
        const y = height * (0.3 + Math.random() * 0.4);
        const type = vesselTypes[i % vesselTypes.length];
        
        vessels.push(new Vessel(x, y, type));
      }
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Update vessels
      vessels.forEach(vessel => vessel.update(time));
      
      // Spawn new droplets
      if (Math.random() < 0.3) {
        const vessel = vessels[Math.floor(Math.random() * vessels.length)];
        const spawn = vessel.getWaterSpawnPoint();
        droplets.push(new WaterDroplet(spawn.x, spawn.y, vessel));
      }
      
      // Update droplets
      droplets.forEach(droplet => droplet.update());
      droplets = droplets.filter(droplet => droplet.life > 0 && droplet.y < height + 20);
      
      // Draw time flow connections
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([2, 6]);
      
      for (let i = 0; i < vessels.length - 1; i++) {
        const v1 = vessels[i];
        const v2 = vessels[i + 1];
        const flow = Math.sin(time * 0.02) * 0.1;
        
        ctx.beginPath();
        ctx.moveTo(v1.x, v1.y);
        const midX = (v1.x + v2.x) / 2;
        const midY = (v1.y + v2.y) / 2 + flow * 20;
        ctx.quadraticCurveTo(midX, midY, v2.x, v2.y);
        ctx.stroke();
      }
      ctx.setLineDash([]);
      
      // Draw vessels
      vessels.forEach(vessel => vessel.draw(ctx));
      
      // Draw droplets
      droplets.forEach(droplet => droplet.draw(ctx));
      
      // Draw temporal annotations
      ctx.font = '10px serif';
      ctx.fillStyle = 'rgba(60, 60, 60, 0.3)';
      ctx.textAlign = 'center';
      
      vessels.forEach((vessel, i) => {
        const labels = ['Past', 'Present', 'Future', 'Eternal', 'Moment'];
        if (labels[i]) {
          ctx.fillText(labels[i], vessel.x, vessel.y + vessel.size + 20);
        }
      });
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializeSystem();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      droplets = [];
      vessels = [];
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
      borderRadius: '8px'
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default WaterClock;

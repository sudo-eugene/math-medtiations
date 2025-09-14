import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: mental architecture, wisdom housed in structures, building and dissolving knowledge
// visualization: Architectural spaces that construct themselves from thought, then dissolve back into potential

const MemoryPalace: React.FC<VisualProps> = ({ width, height }) => {
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
    let rooms = [];
    
    class MemoryRoom {
      constructor(x, y, w, h, depth) {
        this.x = x;
        this.y = y;
        this.width = w;
        this.height = h;
        this.depth = depth;
        this.construction = 0; // 0 to 1, how built it is
        this.targetConstruction = 0;
        this.phase = Math.random() * Math.PI * 2;
        this.buildSpeed = 0.008 + Math.random() * 0.005;
        this.walls = this.generateWalls();
        this.memories = this.generateMemories();
        this.isBuilding = true;
        this.buildDelay = Math.random() * 200;
        this.age = 0;
      }
      
      generateWalls() {
        const walls = [];
        const segments = 6 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < segments; i++) {
          const angle = (i / segments) * Math.PI * 2;
          const nextAngle = ((i + 1) / segments) * Math.PI * 2;
          const radius = this.width * 0.3;
          
          walls.push({
            x1: this.x + Math.cos(angle) * radius,
            y1: this.y + Math.sin(angle) * radius,
            x2: this.x + Math.cos(nextAngle) * radius,
            y2: this.y + Math.sin(nextAngle) * radius,
            opacity: Math.random() * 0.4 + 0.2,
            buildOrder: i
          });
        }
        return walls;
      }
      
      generateMemories() {
        const memories = [];
        const count = 3 + Math.floor(Math.random() * 5);
        
        for (let i = 0; i < count; i++) {
          const angle = Math.random() * Math.PI * 2;
          const distance = Math.random() * this.width * 0.2;
          
          memories.push({
            x: this.x + Math.cos(angle) * distance,
            y: this.y + Math.sin(angle) * distance,
            size: 2 + Math.random() * 4,
            type: Math.random() > 0.5 ? 'knowledge' : 'experience',
            intensity: Math.random(),
            phase: Math.random() * Math.PI * 2,
            birthTime: i * 20
          });
        }
        return memories;
      }
      
      update(time) {
        this.age += 1;
        this.phase += 0.01;
        
        // Building phase
        if (this.isBuilding && this.age > this.buildDelay) {
          this.targetConstruction = 1;
          this.construction += (this.targetConstruction - this.construction) * this.buildSpeed;
          
          if (this.construction > 0.95) {
            this.isBuilding = false;
            // Start dissolution after some time
            setTimeout(() => {
              this.targetConstruction = 0;
              this.buildSpeed = 0.003; // Slower dissolution
            }, 3000 + Math.random() * 2000);
          }
        }
        
        // Dissolution phase
        if (!this.isBuilding && this.targetConstruction === 0) {
          this.construction += (this.targetConstruction - this.construction) * this.buildSpeed;
        }
      }
      
      draw(ctx) {
        if (this.construction < 0.05) return;
        
        const alpha = this.construction * 0.6;
        
        // Draw room structure
        this.walls.forEach((wall, index) => {
          const wallConstruction = Math.max(0, (this.construction * this.walls.length) - index);
          if (wallConstruction <= 0) return;
          
          const wallAlpha = Math.min(wallConstruction, 1) * wall.opacity * alpha;
          
          ctx.strokeStyle = `rgba(60, 60, 60, ${wallAlpha})`;
          ctx.lineWidth = 1 + wallConstruction * 0.5;
          ctx.beginPath();
          ctx.moveTo(wall.x1, wall.y1);
          ctx.lineTo(wall.x2, wall.y2);
          ctx.stroke();
          
          // Add construction particles
          if (wallConstruction > 0 && wallConstruction < 1) {
            const t = wallConstruction;
            const x = wall.x1 + (wall.x2 - wall.x1) * t;
            const y = wall.y1 + (wall.y2 - wall.y1) * t;
            
            ctx.fillStyle = `rgba(80, 80, 80, ${wallAlpha})`;
            ctx.beginPath();
            ctx.arc(x, y, 2, 0, Math.PI * 2);
            ctx.fill();
          }
        });
        
        // Draw memories
        this.memories.forEach((memory, index) => {
          const memoryAge = this.age - memory.birthTime;
          if (memoryAge < 0) return;
          
          const memoryAlpha = alpha * memory.intensity * Math.min(memoryAge / 50, 1);
          const size = memory.size * this.construction * (1 + Math.sin(time * 0.02 + memory.phase) * 0.2);
          
          if (memory.type === 'knowledge') {
            // Draw as geometric shapes
            ctx.strokeStyle = `rgba(70, 70, 70, ${memoryAlpha})`;
            ctx.lineWidth = 0.8;
            ctx.beginPath();
            const sides = 6;
            for (let s = 0; s <= sides; s++) {
              const angle = (s / sides) * Math.PI * 2;
              const x = memory.x + Math.cos(angle) * size;
              const y = memory.y + Math.sin(angle) * size;
              if (s === 0) ctx.moveTo(x, y);
              else ctx.lineTo(x, y);
            }
            ctx.stroke();
          } else {
            // Draw as organic shapes
            ctx.fillStyle = `rgba(50, 50, 50, ${memoryAlpha * 0.3})`;
            ctx.beginPath();
            ctx.arc(memory.x, memory.y, size, 0, Math.PI * 2);
            ctx.fill();
            
            ctx.strokeStyle = `rgba(60, 60, 60, ${memoryAlpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        });
        
        // Draw connections between memories
        for (let i = 0; i < this.memories.length; i++) {
          for (let j = i + 1; j < this.memories.length; j++) {
            const m1 = this.memories[i];
            const m2 = this.memories[j];
            const distance = Math.sqrt((m1.x - m2.x) ** 2 + (m1.y - m2.y) ** 2);
            
            if (distance < 60 && this.construction > 0.7) {
              const connectionAlpha = alpha * 0.2 * (1 - distance / 60);
              ctx.strokeStyle = `rgba(70, 70, 70, ${connectionAlpha})`;
              ctx.lineWidth = 0.3;
              ctx.setLineDash([2, 4]);
              ctx.beginPath();
              ctx.moveTo(m1.x, m1.y);
              ctx.lineTo(m2.x, m2.y);
              ctx.stroke();
              ctx.setLineDash([]);
            }
          }
        }
      }
    }
    
    const initializePalace = () => {
      rooms = [];
      const numRooms = 4 + Math.floor(Math.random() * 3);
      
      for (let i = 0; i < numRooms; i++) {
        const x = width * (0.2 + Math.random() * 0.6);
        const y = height * (0.2 + Math.random() * 0.6);
        const size = 40 + Math.random() * 60;
        
        rooms.push(new MemoryRoom(x, y, size, size, i));
      }
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Update rooms
      rooms.forEach(room => room.update(time));
      
      // Remove completely dissolved rooms and create new ones
      rooms = rooms.filter(room => room.construction > 0.01);
      
      if (rooms.length < 3 && Math.random() < 0.01) {
        const x = width * (0.2 + Math.random() * 0.6);
        const y = height * (0.2 + Math.random() * 0.6);
        const size = 40 + Math.random() * 60;
        rooms.push(new MemoryRoom(x, y, size, size, 0));
      }
      
      // Draw rooms
      rooms.forEach(room => room.draw(ctx));
      
      // Draw palace connections
      if (rooms.length > 1) {
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.1)';
        ctx.lineWidth = 0.5;
        ctx.setLineDash([1, 3]);
        
        for (let i = 0; i < rooms.length; i++) {
          for (let j = i + 1; j < rooms.length; j++) {
            const r1 = rooms[i];
            const r2 = rooms[j];
            const distance = Math.sqrt((r1.x - r2.x) ** 2 + (r1.y - r2.y) ** 2);
            
            if (distance < 200 && r1.construction > 0.5 && r2.construction > 0.5) {
              ctx.beginPath();
              ctx.moveTo(r1.x, r1.y);
              ctx.lineTo(r2.x, r2.y);
              ctx.stroke();
            }
          }
        }
        ctx.setLineDash([]);
      }
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializePalace();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      rooms = [];
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

export default MemoryPalace;

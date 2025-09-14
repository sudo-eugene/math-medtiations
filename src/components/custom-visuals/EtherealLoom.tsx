import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: energy patterns weave themselves into existence then unravel
// visualization: Energy patterns weave themselves into existence then unravel

const EtherealLoom: React.FC<VisualProps> = ({ width, height }) => {
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
    let energyThreads = [];
    let weavingNodes = [];
    
    class EnergyThread {
      constructor(startNode, endNode, pattern) {
        this.startNode = startNode;
        this.endNode = endNode;
        this.pattern = pattern; // 'creation', 'existence', 'dissolution'
        this.weavingProgress = 0;
        this.targetWeavingProgress = 0;
        this.dissolutionProgress = 0;
        this.targetDissolutionProgress = 0;
        this.opacity = 0.4 + Math.random() * 0.4;
        this.frequency = 0.02 + Math.random() * 0.03;
        this.amplitude = 5 + Math.random() * 10;
        this.phase = Math.random() * Math.PI * 2;
        this.life = 1;
        this.weaveSpeed = 0.008 + Math.random() * 0.005;
        this.dissolveSpeed = 0.004 + Math.random() * 0.003;
        this.creationTime = 0;
        this.existenceTime = 0;
        this.maxExistenceTime = 4000 + Math.random() * 3000;
        this.state = 'dormant'; // 'dormant', 'creating', 'existing', 'dissolving'
        this.energyNodes = [];
      }
      
      startCreation() {
        this.state = 'creating';
        this.targetWeavingProgress = 1;
      }
      
      startExistence() {
        this.state = 'existing';
        this.existenceTime = 0;
      }
      
      startDissolution() {
        this.state = 'dissolving';
        this.targetDissolutionProgress = 1;
      }
      
      update(time) {
        this.phase += this.frequency;
        
        switch (this.state) {
          case 'creating':
            this.weavingProgress += (this.targetWeavingProgress - this.weavingProgress) * this.weaveSpeed;
            if (this.weavingProgress > 0.95) {
              this.startExistence();
            }
            break;
            
          case 'existing':
            this.existenceTime += 1;
            if (this.existenceTime > this.maxExistenceTime) {
              this.startDissolution();
            }
            break;
            
          case 'dissolving':
            this.dissolutionProgress += (this.targetDissolutionProgress - this.dissolutionProgress) * this.dissolveSpeed;
            this.life = 1 - this.dissolutionProgress;
            break;
        }
        
        // Update energy nodes along thread
        this.updateEnergyNodes();
      }
      
      updateEnergyNodes() {
        // Create energy nodes along the thread during creation
        if (this.state === 'creating' && this.weavingProgress > 0.1) {
          if (Math.random() < 0.1) {
            const t = Math.random() * this.weavingProgress;
            const point = this.getPointAlongThread(t);
            
            this.energyNodes.push({
              x: point.x,
              y: point.y,
              life: 1,
              size: 1 + Math.random() * 2,
              pulse: Math.random() * Math.PI * 2
            });
          }
        }
        
        // Update existing energy nodes
        this.energyNodes.forEach(node => {
          node.life -= 0.02;
          node.pulse += 0.1;
        });
        
        this.energyNodes = this.energyNodes.filter(node => node.life > 0);
      }
      
      getPointAlongThread(t) {
        const dx = this.endNode.x - this.startNode.x;
        const dy = this.endNode.y - this.startNode.y;
        
        const baseX = this.startNode.x + dx * t;
        const baseY = this.startNode.y + dy * t;
        
        // Add wave motion
        const length = Math.sqrt(dx * dx + dy * dy);
        const perpX = -dy / length;
        const perpY = dx / length;
        const wave = Math.sin(time * 0.02 + this.phase + t * Math.PI * 4) * this.amplitude * (1 - Math.abs(t - 0.5) * 2);
        
        return {
          x: baseX + perpX * wave,
          y: baseY + perpY * wave
        };
      }
      
      draw(ctx) {
        if (this.life <= 0 || this.weavingProgress < 0.05) return;
        
        const alpha = this.opacity * this.life;
        const segments = 30;
        
        // Draw the main thread
        ctx.strokeStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.lineWidth = 1 + (1 - this.dissolutionProgress) * 0.5;
        ctx.beginPath();
        
        for (let i = 0; i <= segments; i++) {
          const t = (i / segments) * this.weavingProgress;
          const point = this.getPointAlongThread(t);
          
          if (i === 0) ctx.moveTo(point.x, point.y);
          else ctx.lineTo(point.x, point.y);
        }
        
        ctx.stroke();
        
        // Draw energy flow direction
        if (this.state === 'creating' || this.state === 'existing') {
          const arrowCount = 3;
          for (let a = 0; a < arrowCount; a++) {
            const t = (a + 1) / (arrowCount + 1) * this.weavingProgress;
            const point = this.getPointAlongThread(t);
            const nextPoint = this.getPointAlongThread(Math.min(t + 0.05, this.weavingProgress));
            
            const arrowAlpha = alpha * 0.6;
            ctx.strokeStyle = `rgba(70, 70, 70, ${arrowAlpha})`;
            ctx.lineWidth = 0.5;
            
            const dx = nextPoint.x - point.x;
            const dy = nextPoint.y - point.y;
            const angle = Math.atan2(dy, dx);
            
            const arrowSize = 3;
            ctx.beginPath();
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(
              point.x - Math.cos(angle - 0.5) * arrowSize,
              point.y - Math.sin(angle - 0.5) * arrowSize
            );
            ctx.moveTo(point.x, point.y);
            ctx.lineTo(
              point.x - Math.cos(angle + 0.5) * arrowSize,
              point.y - Math.sin(angle + 0.5) * arrowSize
            );
            ctx.stroke();
          }
        }
        
        // Draw energy nodes
        this.energyNodes.forEach(node => {
          const nodeAlpha = alpha * node.life;
          const nodeSize = node.size * (1 + Math.sin(node.pulse) * 0.3);
          
          const gradient = ctx.createRadialGradient(
            node.x, node.y, 0,
            node.x, node.y, nodeSize * 2
          );
          gradient.addColorStop(0, `rgba(80, 80, 80, ${nodeAlpha})`);
          gradient.addColorStop(1, `rgba(80, 80, 80, 0)`);
          
          ctx.fillStyle = gradient;
          ctx.beginPath();
          ctx.arc(node.x, node.y, nodeSize * 2, 0, Math.PI * 2);
          ctx.fill();
        });
        
        // Draw dissolution effects
        if (this.dissolutionProgress > 0.1) {
          this.drawDissolutionEffect(ctx);
        }
      }
      
      drawDissolutionEffect(ctx) {
        const particleCount = Math.floor(this.dissolutionProgress * 20);
        
        for (let p = 0; p < particleCount; p++) {
          const t = Math.random() * this.weavingProgress;
          const point = this.getPointAlongThread(t);
          
          const scatter = this.dissolutionProgress * 15;
          const particleX = point.x + (Math.random() - 0.5) * scatter;
          const particleY = point.y + (Math.random() - 0.5) * scatter;
          
          const particleAlpha = this.opacity * (1 - this.dissolutionProgress) * 0.5;
          ctx.fillStyle = `rgba(50, 50, 50, ${particleAlpha})`;
          ctx.beginPath();
          ctx.arc(particleX, particleY, 0.5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    
    class WeavingNode {
      constructor(x, y, type) {
        this.x = x;
        this.y = y;
        this.type = type; // 'source', 'transformer', 'sink'
        this.size = 4 + Math.random() * 6;
        this.energy = Math.random();
        this.targetEnergy = this.energy;
        this.pulse = Math.random() * Math.PI * 2;
        this.pulseSpeed = 0.03 + Math.random() * 0.02;
        this.connectedThreads = [];
        this.opacity = 0.5 + Math.random() * 0.3;
      }
      
      addThread(thread) {
        this.connectedThreads.push(thread);
      }
      
      update(time) {
        this.pulse += this.pulseSpeed;
        
        // Energy flows based on connected threads
        let energyInfluence = 0;
        this.connectedThreads.forEach(thread => {
          if (thread.state === 'creating' || thread.state === 'existing') {
            energyInfluence += 0.1;
          }
        });
        
        this.targetEnergy = Math.min(1, energyInfluence);
        this.energy += (this.targetEnergy - this.energy) * 0.05;
      }
      
      draw(ctx) {
        const pulseSize = this.size * (1 + Math.sin(this.pulse) * 0.2);
        const alpha = this.opacity * (0.6 + this.energy * 0.4);
        
        // Node glow
        const gradient = ctx.createRadialGradient(
          this.x, this.y, 0,
          this.x, this.y, pulseSize * 2
        );
        gradient.addColorStop(0, `rgba(70, 70, 70, ${alpha})`);
        gradient.addColorStop(1, `rgba(70, 70, 70, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(this.x, this.y, pulseSize * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Node core
        if (this.type === 'source') {
          // Draw as radiating spokes
          ctx.strokeStyle = `rgba(60, 60, 60, ${alpha})`;
          ctx.lineWidth = 1;
          
          const spokes = 6;
          for (let s = 0; s < spokes; s++) {
            const angle = (s / spokes) * Math.PI * 2 + this.pulse * 0.5;
            ctx.beginPath();
            ctx.moveTo(this.x, this.y);
            ctx.lineTo(
              this.x + Math.cos(angle) * pulseSize,
              this.y + Math.sin(angle) * pulseSize
            );
            ctx.stroke();
          }
        } else if (this.type === 'transformer') {
          // Draw as square
          ctx.strokeStyle = `rgba(60, 60, 60, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.rect(
            this.x - pulseSize / 2,
            this.y - pulseSize / 2,
            pulseSize,
            pulseSize
          );
          ctx.stroke();
        } else {
          // Draw as simple circle (sink)
          ctx.strokeStyle = `rgba(60, 60, 60, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(this.x, this.y, pulseSize, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }
    
    const initializeLoom = () => {
      energyThreads = [];
      weavingNodes = [];
      
      const nodeTypes = ['source', 'transformer', 'sink'];
      const numNodes = 6 + Math.floor(Math.random() * 4);
      
      // Create weaving nodes
      for (let i = 0; i < numNodes; i++) {
        const x = width * (0.15 + Math.random() * 0.7);
        const y = height * (0.15 + Math.random() * 0.7);
        const type = nodeTypes[Math.floor(Math.random() * nodeTypes.length)];
        
        weavingNodes.push(new WeavingNode(x, y, type));
      }
      
      // Create energy threads between nodes
      for (let i = 0; i < weavingNodes.length; i++) {
        for (let j = i + 1; j < weavingNodes.length; j++) {
          if (Math.random() < 0.4) {
            const node1 = weavingNodes[i];
            const node2 = weavingNodes[j];
            const distance = Math.sqrt((node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2);
            
            if (distance < 120) {
              const patterns = ['creation', 'existence', 'dissolution'];
              const pattern = patterns[Math.floor(Math.random() * patterns.length)];
              
              const thread = new EnergyThread(node1, node2, pattern);
              energyThreads.push(thread);
              node1.addThread(thread);
              node2.addThread(thread);
            }
          }
        }
      }
    };
    
    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);
      
      time += 1;
      
      // Start creation of dormant threads
      energyThreads.forEach(thread => {
        if (thread.state === 'dormant' && Math.random() < 0.002) {
          thread.startCreation();
        }
      });
      
      // Update weaving nodes
      weavingNodes.forEach(node => node.update(time));
      
      // Update energy threads
      energyThreads.forEach(thread => thread.update(time));
      
      // Remove dissolved threads and create new ones
      energyThreads = energyThreads.filter(thread => thread.life > 0.05);
      
      if (energyThreads.length < 8 && Math.random() < 0.01) {
        if (weavingNodes.length >= 2) {
          const node1 = weavingNodes[Math.floor(Math.random() * weavingNodes.length)];
          const node2 = weavingNodes[Math.floor(Math.random() * weavingNodes.length)];
          
          if (node1 !== node2) {
            const patterns = ['creation', 'existence', 'dissolution'];
            const pattern = patterns[Math.floor(Math.random() * patterns.length)];
            
            const thread = new EnergyThread(node1, node2, pattern);
            energyThreads.push(thread);
            node1.addThread(thread);
            node2.addThread(thread);
          }
        }
      }
      
      // Draw ethereal field
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.05)';
      ctx.lineWidth = 0.3;
      const fieldSize = 20;
      
      for (let x = fieldSize; x < width; x += fieldSize) {
        for (let y = fieldSize; y < height; y += fieldSize) {
          const fieldStrength = weavingNodes.reduce((sum, node) => {
            const distance = Math.sqrt((x - node.x) ** 2 + (y - node.y) ** 2);
            return sum + (node.energy / (1 + distance * 0.01));
          }, 0);
          
          if (fieldStrength > 0.1) {
            const distortion = Math.sin(time * 0.01 + x * 0.02 + y * 0.02) * fieldStrength * 2;
            ctx.beginPath();
            ctx.arc(x + distortion, y + distortion, 0.5, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
      
      // Draw energy threads
      energyThreads.forEach(thread => thread.draw(ctx));
      
      // Draw weaving nodes
      weavingNodes.forEach(node => node.draw(ctx));
      
      // Draw loom framework
      ctx.strokeStyle = 'rgba(70, 70, 70, 0.1)';
      ctx.lineWidth = 0.5;
      ctx.setLineDash([5, 15]);
      
      // Horizontal framework
      for (let y = height * 0.2; y <= height * 0.8; y += height * 0.2) {
        ctx.beginPath();
        ctx.moveTo(width * 0.1, y);
        ctx.lineTo(width * 0.9, y);
        ctx.stroke();
      }
      
      // Vertical framework
      for (let x = width * 0.2; x <= width * 0.8; x += width * 0.2) {
        ctx.beginPath();
        ctx.moveTo(x, height * 0.1);
        ctx.lineTo(x, height * 0.9);
        ctx.stroke();
      }
      
      ctx.setLineDash([]);
      
      // Philosophy text
      ctx.font = '9px serif';
      ctx.fillStyle = 'rgba(60, 60, 60, 0.3)';
      ctx.textAlign = 'center';
      ctx.fillText('From potential to form to void', width / 2, height - 15);
      
      animationId = requestAnimationFrame(animate);
    };
    
    initializeLoom();
    animate();
    
    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
      energyThreads = [];
      weavingNodes = [];
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

export default EtherealLoom;

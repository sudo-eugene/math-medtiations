import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: structural harmony, molecular bonds, crystalline perfection emerging from chaos
// visualization: Dynamic crystal lattice formation with symmetry breaking and phase transitions

const CrystallineLattice: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    
    canvas.width = width;
    canvas.height = height;

    const centerX = width / 2;
    const centerY = height / 2;
    let time = 0;

    // Crystal lattice nodes
    const nodes = [];
    const bonds = [];
    
    // Initialize hexagonal lattice
    const latticeSpacing = 40;
    const rows = Math.ceil(height / (latticeSpacing * Math.sin(Math.PI / 3))) + 2;
    const cols = Math.ceil(width / latticeSpacing) + 2;

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = col * latticeSpacing + (row % 2) * (latticeSpacing / 2) - latticeSpacing;
        const y = row * latticeSpacing * Math.sin(Math.PI / 3) - latticeSpacing;
        
        nodes.push({
          x,
          y,
          baseX: x,
          baseY: y,
          vibrationPhase: Math.random() * Math.PI * 2,
          energy: Math.random(),
          neighbors: [],
          bonds: [],
          crystallized: false,
          crystallizationTime: 0
        });
      }
    }

    // Find neighbors and create bonds
    nodes.forEach((node, i) => {
      nodes.forEach((other, j) => {
        if (i !== j) {
          const dx = node.baseX - other.baseX;
          const dy = node.baseY - other.baseY;
          const dist = Math.sqrt(dx * dx + dy * dy);
          
          if (dist < latticeSpacing * 1.2 && dist > latticeSpacing * 0.8) {
            node.neighbors.push(j);
            
            if (i < j) { // Avoid duplicate bonds
              bonds.push({
                node1: i,
                node2: j,
                strength: 0,
                maxStrength: 1,
                vibration: Math.random() * Math.PI * 2,
                active: false
              });
            }
          }
        }
      });
    });

    let animationId = null;

    // Crystal nucleation and growth
    const updateCrystallization = () => {
      // Start nucleation from center
      const centerNode = nodes.reduce((closest, node, i) => {
        const dist = Math.sqrt(Math.pow(node.baseX - centerX, 2) + Math.pow(node.baseY - centerY, 2));
        return dist < closest.dist ? { node, index: i, dist } : closest;
      }, { dist: Infinity });

      if (!centerNode.node.crystallized && time > 50) {
        centerNode.node.crystallized = true;
        centerNode.node.crystallizationTime = 0;
      }

      // Propagate crystallization
      nodes.forEach((node, i) => {
        if (node.crystallized) {
          node.crystallizationTime += 0.02;
          
          // Crystallize neighbors
          node.neighbors.forEach(neighborIndex => {
            const neighbor = nodes[neighborIndex];
            if (!neighbor.crystallized && node.crystallizationTime > 0.5 && Math.random() > 0.98) {
              neighbor.crystallized = true;
              neighbor.crystallizationTime = 0;
            }
          });
        }
      });

      // Update bond strengths
      bonds.forEach(bond => {
        const node1 = nodes[bond.node1];
        const node2 = nodes[bond.node2];
        
        if (node1.crystallized && node2.crystallized) {
          bond.active = true;
          bond.strength = Math.min(bond.maxStrength, bond.strength + 0.01);
        } else if (node1.crystallized || node2.crystallized) {
          bond.active = true;
          bond.strength = Math.min(bond.maxStrength * 0.3, bond.strength + 0.005);
        }
      });
    };

    const drawNode = (node) => {
      // Thermal vibration
      const vibrationAmplitude = node.crystallized ? 1 : 3;
      const vibrationX = Math.sin(time * 0.1 + node.vibrationPhase) * vibrationAmplitude;
      const vibrationY = Math.cos(time * 0.1 + node.vibrationPhase * 1.3) * vibrationAmplitude;
      
      const x = node.baseX + vibrationX;
      const y = node.baseY + vibrationY;
      
      // Update position for bond drawing
      node.x = x;
      node.y = y;

      if (x < -20 || x > width + 20 || y < -20 || y > height + 20) return;

      if (node.crystallized) {
        // Crystallized node
        const crystallization = Math.min(1, node.crystallizationTime * 2);
        const size = 3 + crystallization * 2;
        const alpha = 0.3 + crystallization * 0.5;
        
        // Node core
        ctx.fillStyle = `rgba(60, 60, 60, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();

        // Crystalline glow
        const glowSize = size + 3;
        const glowGradient = ctx.createRadialGradient(x, y, 0, x, y, glowSize);
        glowGradient.addColorStop(0, `rgba(80, 80, 80, ${alpha * 0.3})`);
        glowGradient.addColorStop(1, 'rgba(80, 80, 80, 0)');
        ctx.fillStyle = glowGradient;
        ctx.beginPath();
        ctx.arc(x, y, glowSize, 0, Math.PI * 2);
        ctx.fill();
        
        // Crystal facets
        if (crystallization > 0.5) {
          ctx.strokeStyle = `rgba(90, 90, 90, ${(crystallization - 0.5) * 0.4})`;
          ctx.lineWidth = 1;
          const facetSize = size * 1.5;
          
          for (let i = 0; i < 6; i++) {
            const angle = (i / 6) * Math.PI * 2;
            const x1 = x + Math.cos(angle) * facetSize;
            const y1 = y + Math.sin(angle) * facetSize;
            const x2 = x + Math.cos(angle + Math.PI / 3) * facetSize;
            const y2 = y + Math.sin(angle + Math.PI / 3) * facetSize;
            
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x1, y1);
            ctx.lineTo(x2, y2);
            ctx.closePath();
            ctx.stroke();
          }
        }
      } else {
        // Amorphous node
        const size = 2 + node.energy;
        ctx.fillStyle = `rgba(100, 100, 100, 0.2)`;
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawBond = (bond) => {
      if (!bond.active || bond.strength <= 0) return;
      
      const node1 = nodes[bond.node1];
      const node2 = nodes[bond.node2];
      
      // Skip bonds outside viewport
      if (Math.max(node1.x, node2.x) < -20 || Math.min(node1.x, node2.x) > width + 20 ||
          Math.max(node1.y, node2.y) < -20 || Math.min(node1.y, node2.y) > height + 20) {
        return;
      }
      
      const alpha = bond.strength * 0.6;
      const vibration = Math.sin(time * 0.2 + bond.vibration) * 0.5;
      
      // Bond line
      ctx.strokeStyle = `rgba(70, 70, 70, ${alpha})`;
      ctx.lineWidth = 1 + bond.strength;
      ctx.beginPath();
      ctx.moveTo(node1.x, node1.y);
      
      // Add slight curvature for visual interest
      const midX = (node1.x + node2.x) / 2 + vibration;
      const midY = (node1.y + node2.y) / 2 + vibration;
      ctx.quadraticCurveTo(midX, midY, node2.x, node2.y);
      ctx.stroke();
      
      // Energy transfer visualization
      if (bond.strength > 0.8) {
        const t = (Math.sin(time * 0.3 + bond.vibration) + 1) / 2;
        const energyX = node1.x + (node2.x - node1.x) * t;
        const energyY = node1.y + (node2.y - node1.y) * t;
        
        ctx.fillStyle = `rgba(90, 90, 90, ${alpha * 0.5})`;
        ctx.beginPath();
        ctx.arc(energyX, energyY, 2, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const drawDefects = () => {
      // Draw crystal defects and dislocations
      nodes.forEach((node, i) => {
        if (node.crystallized && node.crystallizationTime > 1) {
          // Check for defects (nodes with wrong number of crystallized neighbors)
          const crystallizedNeighbors = node.neighbors.filter(n => nodes[n].crystallized).length;
          
          if (crystallizedNeighbors !== 6 && crystallizedNeighbors > 0) {
            // Defect visualization
            ctx.strokeStyle = 'rgba(120, 80, 80, 0.4)';
            ctx.lineWidth = 2;
            ctx.beginPath();
            ctx.arc(node.x, node.y, 8, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      });
    };

    const animate = () => {
      // Background gradient
      const bgGradient = ctx.createLinearGradient(0, 0, width, height);
      bgGradient.addColorStop(0, '#F2F0E8');
      bgGradient.addColorStop(1, '#E8E6DE');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      time += 0.125;
      
      updateCrystallization();
      
      // Draw bonds first (behind nodes)
      bonds.forEach(drawBond);
      
      // Draw crystal defects
      drawDefects();
      
      // Draw nodes
      nodes.forEach(drawNode);
      
      // Draw crystallization wavefront
      let maxCrystallizationRadius = 0;
      nodes.forEach(node => {
        if (node.crystallized) {
          const dist = Math.sqrt(Math.pow(node.baseX - centerX, 2) + Math.pow(node.baseY - centerY, 2));
          maxCrystallizationRadius = Math.max(maxCrystallizationRadius, dist);
        }
      });
      
      if (maxCrystallizationRadius > 0) {
        ctx.strokeStyle = 'rgba(80, 80, 80, 0.1)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(centerX, centerY, maxCrystallizationRadius + 10, 0, Math.PI * 2);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(animate);
    };

    animationId = requestAnimationFrame(animate);

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId);
      }
    };
  }, [width, height]);

  return (
    <div style={{ 
      width: `${width}px`, 
      height: `${height}px`, 
      backgroundColor: '#F0EEE6' 
    }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default CrystallineLattice;

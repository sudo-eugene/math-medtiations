// Themes: network growth, preferential attachment, knowledge emergence
// Visualisation: Graph nodes grow via preferential attachment creating scale-free networks
// Unique mechanism: Barabási-Albert network growth model with dynamic node connections

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const KnowledgeTree: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const rafRef = useRef<number|undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    // Background
    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    // PRNG for deterministic behavior
    let seed = 78432;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    interface Node {
      id: number;
      x: number;
      y: number;
      degree: number; // Number of connections
      age: number;
      size: number;
      vx: number;
      vy: number;
      color: {r: number, g: number, b: number};
    }

    interface Edge {
      from: number;
      to: number;
      weight: number;
      age: number;
    }

    const nodes: Node[] = [];
    const edges: Edge[] = [];
    let nextNodeId = 0;

    // Initialize with small complete graph
    const initializeNetwork = () => {
      nodes.length = 0;
      edges.length = 0;
      nextNodeId = 0;

      // Create initial nodes
      for (let i = 0; i < 3; i++) {
        const angle = (i / 3) * Math.PI * 2;
        const radius = 50;
        nodes.push({
          id: nextNodeId++,
          x: width / 2 + Math.cos(angle) * radius,
          y: height / 2 + Math.sin(angle) * radius,
          degree: 2,
          age: 0,
          size: 8,
          vx: 0,
          vy: 0,
          color: {r: 70, g: 70, b: 70}
        });
      }

      // Connect initial nodes (complete graph)
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          edges.push({
            from: nodes[i].id,
            to: nodes[j].id,
            weight: 1,
            age: 0
          });
        }
      }
    };

    // Barabási-Albert preferential attachment
    const addNewNode = () => {
      if (nodes.length >= 150) return;

      // Choose position near existing nodes
      const existingNode = nodes[Math.floor(random() * nodes.length)];
      const angle = random() * Math.PI * 2;
      const distance = 80 + random() * 60;
      
      const newNode: Node = {
        id: nextNodeId++,
        x: existingNode.x + Math.cos(angle) * distance,
        y: existingNode.y + Math.sin(angle) * distance,
        degree: 0,
        age: 0,
        size: 5,
        vx: (random() - 0.5) * 0.5,
        vy: (random() - 0.5) * 0.5,
        color: {r: 80, g: 80, b: 80}
      };

      // Keep within bounds
      newNode.x = Math.max(30, Math.min(width - 30, newNode.x));
      newNode.y = Math.max(30, Math.min(height - 30, newNode.y));

      nodes.push(newNode);

      // Preferential attachment - connect to existing nodes
      const m = Math.min(3, nodes.length - 1); // Number of connections to make
      const totalDegree = nodes.slice(0, -1).reduce((sum, node) => sum + Math.max(1, node.degree), 0);
      
      const connectedNodes = new Set<number>();
      
      for (let i = 0; i < m; i++) {
        let targetNode = null;
        let attempts = 0;
        
        while (!targetNode && attempts < 20) {
          // Select node with probability proportional to degree
          let cumulativeProb = 0;
          const targetProb = random();
          
          for (let j = 0; j < nodes.length - 1; j++) {
            const node = nodes[j];
            if (connectedNodes.has(node.id)) continue;
            
            cumulativeProb += Math.max(1, node.degree) / totalDegree;
            if (targetProb <= cumulativeProb) {
              targetNode = node;
              break;
            }
          }
          attempts++;
        }
        
        if (targetNode) {
          edges.push({
            from: newNode.id,
            to: targetNode.id,
            weight: 1,
            age: 0
          });
          
          newNode.degree++;
          targetNode.degree++;
          connectedNodes.add(targetNode.id);
        }
      }
    };

    // Force-directed layout for better visualization
    const applyForces = () => {
      const repulsionStrength = 2000;
      const attractionStrength = 0.01;
      const damping = 0.9;

      // Calculate forces
      nodes.forEach(node => {
        let fx = 0, fy = 0;

        // Repulsion between all nodes
        nodes.forEach(other => {
          if (node.id === other.id) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 1;
          const force = repulsionStrength / (dist * dist);
          fx += (dx / dist) * force;
          fy += (dy / dist) * force;
        });

        // Attraction along edges
        edges.forEach(edge => {
          let other = null;
          if (edge.from === node.id) {
            other = nodes.find(n => n.id === edge.to);
          } else if (edge.to === node.id) {
            other = nodes.find(n => n.id === edge.from);
          }

          if (other) {
            const dx = other.x - node.x;
            const dy = other.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy) + 1;
            const force = attractionStrength * dist;
            fx += (dx / dist) * force;
            fy += (dy / dist) * force;
          }
        });

        node.vx = (node.vx + fx * 0.001) * damping;
        node.vy = (node.vy + fy * 0.001) * damping;
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraints
        const margin = 20;
        if (node.x < margin) { node.x = margin; node.vx = 0; }
        if (node.x > width - margin) { node.x = width - margin; node.vx = 0; }
        if (node.y < margin) { node.y = margin; node.vy = 0; }
        if (node.y > height - margin) { node.y = height - margin; node.vy = 0; }
      });
    };

    initializeNetwork();

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Update ages
      nodes.forEach(node => {
        node.age += 0.02;
        node.size = 5 + Math.min(15, Math.sqrt(node.degree) * 2);
      });
      
      edges.forEach(edge => edge.age += 0.02);

      // Add new node periodically
      if (Math.floor(time * 2) % 10 === 0 && random() < 0.1) {
        addNewNode();
      }

      // Apply force-directed layout
      if (Math.floor(time * 20) % 2 === 0) {
        applyForces();
      }

      // Draw edges
      edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);
        
        if (fromNode && toNode) {
          const alpha = Math.max(0.1, 1 - edge.age * 0.02);
          const weight = edge.weight;
          
          ctx.strokeStyle = `rgba(70,70,70,${alpha * 0.4})`;
          ctx.lineWidth = 0.5 + weight * 0.5;
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const pulse = Math.sin(time + node.id * 0.1) * 0.1 + 0.9;
        const alpha = Math.max(0.3, 1 - node.age * 0.01);
        
        // Node importance based on degree (scale-free property)
        const importance = Math.min(1, node.degree / 10);
        
        // Outer ring
        ctx.strokeStyle = `rgba(${node.color.r},${node.color.g},${node.color.b},${alpha * 0.6})`;
        ctx.lineWidth = 1 + importance * 1.5;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * pulse, 0, Math.PI * 2);
        ctx.stroke();
        
        // Inner fill
        ctx.fillStyle = `rgba(${node.color.r + 10},${node.color.g + 10},${node.color.b + 10},${alpha * 0.3})`;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * 0.6, 0, Math.PI * 2);
        ctx.fill();
        
        // Hub indicator for high-degree nodes
        if (node.degree > 8) {
          ctx.strokeStyle = `rgba(50,50,50,${alpha * 0.8})`;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(node.x, node.y, node.size * 1.3, 0, Math.PI * 2);
          ctx.stroke();
        }
      });

      // Draw degree distribution visualization (small histogram)
      const degreeHist: {[key: number]: number} = {};
      nodes.forEach(node => {
        const degreeBin = Math.floor(node.degree / 2) * 2;
        degreeHist[degreeBin] = (degreeHist[degreeBin] || 0) + 1;
      });

      ctx.fillStyle = 'rgba(60,60,60,0.3)';
      ctx.font = '8px serif';
      const histX = width - 100;
      const histY = 20;
      
      Object.entries(degreeHist).slice(0, 8).forEach(([degree, count], i) => {
        const barHeight = count * 2;
        ctx.fillRect(histX + i * 10, histY, 8, barHeight);
      });

      rafRef.current = requestAnimationFrame(render);
    };

    rafRef.current = requestAnimationFrame(render);

    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      ctx.clearRect(0, 0, width, height);
    };
  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6', overflow: 'hidden' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

// Differs from others by: Implements Barabási-Albert preferential attachment for scale-free network growth - no other visual models complex network formation dynamics

const metadata = {
  themes: "network growth, preferential attachment, knowledge emergence",
  visualisation: "Graph nodes grow via preferential attachment creating scale-free networks",
  promptSuggestion: "1. Adjust attachment probability parameters\n2. Vary network growth rate\n3. Control force-directed layout strength"
};
(KnowledgeTree as any).metadata = metadata;

export default KnowledgeTree;

// Themes: flowing order, natural unfolding, graceful progression, interconnected becoming
// Visualisation: Particles arrange themselves in flowing layers revealing natural progression
// Unique mechanism: Kahn's topological sorting algorithm transformed into meditation on natural order

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const TopologicalSort: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 54321;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    interface GraphNode {
      id: number;
      x: number;
      y: number;
      targetX: number;
      targetY: number;
      vx: number;
      vy: number;
      indegree: number;
      originalIndegree: number;
      level: number;
      processed: boolean;
      size: number;
      age: number;
    }

    interface Edge {
      from: number;
      to: number;
      weight: number;
      active: boolean;
    }

    const nodes: GraphNode[] = [];
    const edges: Edge[] = [];
    const sortedOrder: number[] = [];
    let sortingStep = 0;
    let nextNodeId = 0;

    // Generate random DAG (Directed Acyclic Graph)
    const generateDAG = () => {
      nodes.length = 0;
      edges.length = 0;
      sortedOrder.length = 0;
      sortingStep = 0;
      nextNodeId = 0;

      const numNodes = 12;
      const layers = 4;
      const nodesPerLayer = Math.ceil(numNodes / layers);

      // Create nodes in layers to ensure acyclicity
      for (let layer = 0; layer < layers; layer++) {
        for (let i = 0; i < nodesPerLayer && nodes.length < numNodes; i++) {
          const x = random() * width;
          const y = random() * height;
          
          nodes.push({
            id: nextNodeId++,
            x: x,
            y: y,
            targetX: x,
            targetY: y,
            vx: 0,
            vy: 0,
            indegree: 0,
            originalIndegree: 0,
            level: -1,
            processed: false,
            size: 15 + random() * 10,
            age: 0
          });
        }
      }

      // Add edges from earlier layers to later layers
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          if (random() < 0.3) {
            edges.push({
              from: nodes[i].id,
              to: nodes[j].id,
              weight: 1,
              active: true
            });
            
            const targetNode = nodes.find(n => n.id === nodes[j].id);
            if (targetNode) {
              targetNode.indegree++;
              targetNode.originalIndegree++;
            }
          }
        }
      }
    };

    // Kahn's algorithm step
    const topologicalSortStep = () => {
      // Find nodes with indegree 0
      const zeroIndegreeNodes = nodes.filter(node => 
        !node.processed && node.indegree === 0
      );

      if (zeroIndegreeNodes.length === 0) return false;

      // Process one node with indegree 0
      const currentNode = zeroIndegreeNodes[0];
      currentNode.processed = true;
      currentNode.level = sortingStep;
      sortedOrder.push(currentNode.id);

      // Set target position based on topological level
      const levelWidth = width / 5;
      const levelHeight = height / Math.max(1, zeroIndegreeNodes.length);
      currentNode.targetX = 50 + sortingStep * levelWidth;
      currentNode.targetY = 50 + sortedOrder.filter(id => {
        const node = nodes.find(n => n.id === id);
        return node && node.level === sortingStep;
      }).length * levelHeight;

      // Remove edges from this node and decrease indegree of targets
      edges.forEach(edge => {
        if (edge.from === currentNode.id) {
          edge.active = false;
          const targetNode = nodes.find(n => n.id === edge.to);
          if (targetNode) {
            targetNode.indegree = Math.max(0, targetNode.indegree - 1);
          }
        }
      });

      sortingStep++;
      return true;
    };

    // Apply forces for smooth animation
    const applyForces = () => {
      nodes.forEach(node => {
        // Spring force to target position
        const dx = node.targetX - node.x;
        const dy = node.targetY - node.y;
        node.vx += dx * 0.02;
        node.vy += dy * 0.02;

        // Repulsion from other nodes
        nodes.forEach(other => {
          if (node.id === other.id) return;
          const dx = node.x - other.x;
          const dy = node.y - other.y;
          const dist = Math.sqrt(dx * dx + dy * dy) + 1;
          if (dist < 80) {
            const force = 300 / (dist * dist);
            node.vx += (dx / dist) * force * 0.01;
            node.vy += (dy / dist) * force * 0.01;
          }
        });

        // Damping
        node.vx *= 0.95;
        node.vy *= 0.95;

        // Update position
        node.x += node.vx;
        node.y += node.vy;

        // Boundary constraints
        node.x = Math.max(20, Math.min(width - 20, node.x));
        node.y = Math.max(20, Math.min(height - 20, node.y));
      });
    };

    generateDAG();

    const render = (t: number) => {
      // Gentle fade for flowing movement
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Update node ages
      nodes.forEach(node => node.age += 0.02);

      // Perform topological sort step periodically
      if (Math.floor(time * 2) % 15 === 0 && nodes.some(n => !n.processed)) {
        topologicalSortStep();
      }

      // Reset if all nodes processed
      if (nodes.every(n => n.processed)) {
        if (Math.floor(time * 0.1) % 30 === 0) {
          generateDAG();
        }
      }

      applyForces();

      // Draw subtle flowing layers
      for (let level = 0; level <= sortingStep; level++) {
        const levelX = 50 + level * (width / 5);
        const wave = Math.sin(time * 0.5 + level) * 0.05 + 0.95;
        ctx.strokeStyle = `rgba(90,90,90,${0.08 * wave})`;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([8, 8]);
        ctx.beginPath();
        ctx.moveTo(levelX, 0);
        ctx.lineTo(levelX, height);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Draw flowing connections
      edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);

        if (fromNode && toNode) {
          const pulse = Math.sin(time * 1.5 + edge.from * 0.3) * 0.05 + 0.95;
          const alpha = edge.active ? 0.2 * pulse : 0.08;
          const lineWidth = edge.active ? 1.5 : 0.8;
          
          ctx.strokeStyle = `rgba(90,90,90,${alpha})`;
          ctx.lineWidth = lineWidth;
          
          // Draw gently curved line
          ctx.beginPath();
          const midX = (fromNode.x + toNode.x) / 2;
          const midY = (fromNode.y + toNode.y) / 2;
          const offsetY = Math.sin(time + edge.from) * 5;
          
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.quadraticCurveTo(midX, midY + offsetY, toNode.x, toNode.y);
          ctx.stroke();
        }
      });

      // Draw ethereal particles
      nodes.forEach(node => {
        const breathe = Math.sin(node.age + time * 1.5) * 0.12 + 1;
        const size = node.size * breathe;
        
        // Determine glow based on state
        let baseTone, glowIntensity;
        if (node.processed) {
          // Processed - lighter, calmer
          baseTone = 100 + node.level * 5;
          glowIntensity = 0.25;
        } else if (node.indegree === 0) {
          // Ready - gentle highlight
          baseTone = 105;
          glowIntensity = 0.3 + Math.sin(time * 2) * 0.1;
        } else {
          // Waiting - softer
          baseTone = 85;
          glowIntensity = 0.15;
        }

        // Outer glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, size * 1.8
        );
        gradient.addColorStop(0, `rgba(${baseTone}, ${baseTone}, ${baseTone}, ${glowIntensity})`);
        gradient.addColorStop(1, `rgba(${baseTone}, ${baseTone}, ${baseTone}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 1.8, 0, Math.PI * 2);
        ctx.fill();
        
        // Core particle
        const coreGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, size
        );
        coreGradient.addColorStop(0, `rgba(${baseTone - 10}, ${baseTone - 10}, ${baseTone - 10}, 0.6)`);
        coreGradient.addColorStop(1, `rgba(${baseTone - 10}, ${baseTone - 10}, ${baseTone - 10}, 0.2)`);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size, 0, Math.PI * 2);
        ctx.fill();
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

// Differs from others by: Implements Kahn's topological sorting algorithm with live dependency resolution visualization - no other visual performs graph algorithm computation

const metadata = {
  themes: "flowing order, natural unfolding, graceful progression, interconnected becoming",
  visualisation: "Particles arrange themselves in flowing layers revealing natural progression",
  promptSuggestion: "1. Adjust particle count and connections\n2. Vary flow speed and rhythm\n3. Control layer visualization"
};
(TopologicalSort as any).metadata = metadata;

export default TopologicalSort;

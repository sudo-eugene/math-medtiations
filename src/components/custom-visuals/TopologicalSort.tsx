// Themes: dependency resolution, hierarchical order, directed flow
// Visualisation: Directed graph nodes arrange in dependency layers showing topological ordering
// Unique mechanism: Kahn's topological sorting algorithm with force layout and live dependency resolution

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
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.06)';
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

      // Draw dependency levels
      for (let level = 0; level <= sortingStep; level++) {
        const levelX = 50 + level * (width / 5);
        ctx.strokeStyle = 'rgba(80,80,80,0.2)';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(levelX, 0);
        ctx.lineTo(levelX, height);
        ctx.stroke();
        ctx.setLineDash([]);

        // Level label
        ctx.font = '10px serif';
        ctx.fillStyle = 'rgba(60,60,60,0.5)';
        ctx.fillText(`L${level}`, levelX + 5, 15);
      }

      // Draw edges
      edges.forEach(edge => {
        const fromNode = nodes.find(n => n.id === edge.from);
        const toNode = nodes.find(n => n.id === edge.to);

        if (fromNode && toNode) {
          const alpha = edge.active ? 0.6 : 0.2;
          const width = edge.active ? 2 : 1;
          
          ctx.strokeStyle = `rgba(70,70,70,${alpha})`;
          ctx.lineWidth = width;
          
          // Draw arrow
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();

          // Arrowhead
          const angle = Math.atan2(toNode.y - fromNode.y, toNode.x - fromNode.x);
          const headLength = 8;
          
          ctx.beginPath();
          ctx.moveTo(toNode.x, toNode.y);
          ctx.lineTo(
            toNode.x - headLength * Math.cos(angle - Math.PI / 6),
            toNode.y - headLength * Math.sin(angle - Math.PI / 6)
          );
          ctx.moveTo(toNode.x, toNode.y);
          ctx.lineTo(
            toNode.x - headLength * Math.cos(angle + Math.PI / 6),
            toNode.y - headLength * Math.sin(angle + Math.PI / 6)
          );
          ctx.stroke();
        }
      });

      // Draw nodes
      nodes.forEach(node => {
        const pulse = Math.sin(node.age) * 0.1 + 0.9;
        let nodeColor, strokeColor;

        if (node.processed) {
          // Processed nodes - colored by level
          const hue = node.level * 60;
          nodeColor = `rgba(${80 + hue % 40},${80 + hue % 40},${80 + hue % 40},0.8)`;
          strokeColor = `rgba(${50 + hue % 40},${50 + hue % 40},${50 + hue % 40},0.8)`;
        } else if (node.indegree === 0) {
          // Ready to process - highlighted
          nodeColor = 'rgba(100,120,100,0.8)';
          strokeColor = 'rgba(60,80,60,0.8)';
        } else {
          // Waiting for dependencies
          nodeColor = 'rgba(100,80,80,0.8)';
          strokeColor = 'rgba(70,50,50,0.8)';
        }

        // Node circle
        ctx.fillStyle = nodeColor;
        ctx.strokeStyle = strokeColor;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Indegree indicator
        if (!node.processed && node.indegree > 0) {
          ctx.font = '8px serif';
          ctx.fillStyle = 'rgba(40,40,40,0.8)';
          ctx.textAlign = 'center';
          ctx.fillText(node.indegree.toString(), node.x, node.y + 3);
        }

        // Level indicator for processed nodes
        if (node.processed) {
          ctx.font = '10px serif';
          ctx.fillStyle = 'rgba(30,30,30,0.8)';
          ctx.textAlign = 'center';
          ctx.fillText(node.level.toString(), node.x, node.y + 4);
        }
      });

      // Display sorting progress
      ctx.font = '12px serif';
      ctx.fillStyle = 'rgba(60,60,60,0.8)';
      ctx.textAlign = 'left';
      ctx.fillText(`Sorted: ${sortedOrder.length}/${nodes.length}`, 10, height - 40);
      ctx.fillText(`Current Level: ${sortingStep}`, 10, height - 20);

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
  themes: "dependency resolution, hierarchical order, directed flow",
  visualisation: "Directed graph nodes arrange in dependency layers showing topological ordering",
  promptSuggestion: "1. Adjust graph complexity and edge density\n2. Vary sorting speed and animation\n3. Control dependency visualization"
};
(TopologicalSort as any).metadata = metadata;

export default TopologicalSort;

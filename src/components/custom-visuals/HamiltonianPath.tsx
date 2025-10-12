// Themes: graceful journey, complete presence, flowing connection, sacred visiting
// Visualisation: Gentle path flows through all points in perfect harmony and connection
// Unique mechanism: Hamiltonian path finding transformed into meditation on completeness

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const HamiltonianPath: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 13579;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    interface GraphNode {
      id: number;
      x: number;
      y: number;
      visited: boolean;
      inPath: boolean;
      pathIndex: number;
      size: number;
    }

    interface Edge {
      from: number;
      to: number;
      traversed: boolean;
      inHamiltonianPath: boolean;
    }

    const nodes: GraphNode[] = [];
    const edges: Edge[] = [];
    const hamiltonianPath: number[] = [];
    let currentNode = 0;
    let searchStack: Array<{path: number[], visited: Set<number>}> = [];
    let searching = false;
    let pathFound = false;

    // Generate random connected graph
    const generateGraph = () => {
      nodes.length = 0;
      edges.length = 0;
      hamiltonianPath.length = 0;
      searchStack.length = 0;
      searching = false;
      pathFound = false;

      const numNodes = 8;
      
      // Create nodes in a roughly circular layout for better visualization
      for (let i = 0; i < numNodes; i++) {
        const angle = (i / numNodes) * Math.PI * 2;
        const radius = Math.min(width, height) * 0.3;
        const centerX = width / 2;
        const centerY = height / 2;
        
        nodes.push({
          id: i,
          x: centerX + Math.cos(angle) * radius + (random() - 0.5) * 60,
          y: centerY + Math.sin(angle) * radius + (random() - 0.5) * 60,
          visited: false,
          inPath: false,
          pathIndex: -1,
          size: 12 + random() * 8
        });
      }

      // Add edges to ensure connectivity
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Add edge based on distance and random chance
          if (distance < 150 || random() < 0.3) {
            edges.push({
              from: i,
              to: j,
              traversed: false,
              inHamiltonianPath: false
            });
          }
        }
      }

      // Ensure minimum connectivity
      for (let i = 0; i < nodes.length; i++) {
        const nextIndex = (i + 1) % nodes.length;
        const edgeExists = edges.some(e => 
          (e.from === i && e.to === nextIndex) || 
          (e.from === nextIndex && e.to === i)
        );
        
        if (!edgeExists) {
          edges.push({
            from: i,
            to: nextIndex,
            traversed: false,
            inHamiltonianPath: false
          });
        }
      }
    };

    // Find Hamiltonian path using backtracking
    const findHamiltonianPath = (startNode: number) => {
      hamiltonianPath.length = 0;
      nodes.forEach(node => {
        node.visited = false;
        node.inPath = false;
        node.pathIndex = -1;
      });
      edges.forEach(edge => {
        edge.inHamiltonianPath = false;
      });

      searchStack = [{
        path: [startNode],
        visited: new Set([startNode])
      }];
      searching = true;
      pathFound = false;
    };

    // Single step of Hamiltonian path search
    const hamiltonianSearchStep = (): boolean => {
      if (searchStack.length === 0) {
        searching = false;
        return false;
      }

      const current = searchStack.pop()!;
      const currentPath = current.path;
      const visited = current.visited;
      const lastNode = currentPath[currentPath.length - 1];

      // Check if we found a Hamiltonian path
      if (currentPath.length === nodes.length) {
        hamiltonianPath.push(...currentPath);
        
        // Mark path in nodes and edges
        currentPath.forEach((nodeId, index) => {
          nodes[nodeId].inPath = true;
          nodes[nodeId].pathIndex = index;
          
          if (index > 0) {
            const prevNodeId = currentPath[index - 1];
            const edge = edges.find(e => 
              (e.from === prevNodeId && e.to === nodeId) ||
              (e.from === nodeId && e.to === prevNodeId)
            );
            if (edge) {
              edge.inHamiltonianPath = true;
            }
          }
        });
        
        pathFound = true;
        searching = false;
        return true;
      }

      // Find neighbors of current node
      const neighbors = edges
        .filter(e => e.from === lastNode || e.to === lastNode)
        .map(e => e.from === lastNode ? e.to : e.from)
        .filter(nodeId => !visited.has(nodeId));

      // Add neighbors to search stack (in reverse order for depth-first)
      neighbors.reverse().forEach(neighbor => {
        const newPath = [...currentPath, neighbor];
        const newVisited = new Set(visited);
        newVisited.add(neighbor);
        
        searchStack.push({
          path: newPath,
          visited: newVisited
        });
      });

      return true;
    };

    generateGraph();
    findHamiltonianPath(0);

    const render = (t: number) => {
      // Gentle fade for flowing trails
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Continue search if not found
      if (searching && Math.floor(time * 10) % 3 === 0) {
        for (let i = 0; i < 5; i++) {
          if (!hamiltonianSearchStep()) break;
        }
      }

      // Reset and search again periodically
      if (!searching && Math.floor(time * 0.2) % 25 === 0) {
        generateGraph();
        findHamiltonianPath(Math.floor(random() * nodes.length));
      }

      // Draw subtle potential connections
      edges.forEach(edge => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        
        const pulse = Math.sin(time * 1.5 + edge.from * 0.2) * 0.05 + 0.95;
        
        if (edge.inHamiltonianPath) {
          // Path connections - slightly more visible
          ctx.strokeStyle = `rgba(100, 100, 100, ${0.2 * pulse})`;
          ctx.lineWidth = 1.8;
        } else {
          // Potential connections - very subtle
          ctx.strokeStyle = `rgba(90, 90, 90, ${0.06})`;
          ctx.lineWidth = 0.5;
        }
        
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      });

      // Draw flowing path with ethereal animation
      if (pathFound) {
        const pathGlow = Math.sin(time * 2) * 0.1 + 0.9;
        
        for (let i = 1; i < hamiltonianPath.length; i++) {
          const fromNode = nodes[hamiltonianPath[i - 1]];
          const toNode = nodes[hamiltonianPath[i]];
          
          const progress = i / hamiltonianPath.length;
          const tone = 95 + progress * 20;
          const flowPulse = Math.sin(time * 2 - i * 0.3) * 0.08 + 0.92;
          
          ctx.strokeStyle = `rgba(${tone}, ${tone}, ${tone}, ${0.25 * flowPulse})`;
          ctx.lineWidth = 2.5;
          
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        }
      }

      // Draw ethereal particles
      nodes.forEach(node => {
        const breathe = Math.sin(time * 1.3 + node.id * 0.5) * 0.15 + 1;
        const size = node.size * breathe;
        
        let baseTone, glowIntensity;
        if (node.inPath) {
          const pathProgress = node.pathIndex / Math.max(1, hamiltonianPath.length - 1);
          baseTone = 90 + pathProgress * 25;
          glowIntensity = 0.3 + Math.sin(time * 2 + pathProgress * Math.PI * 2) * 0.1;
        } else {
          baseTone = 80;
          glowIntensity = 0.12;
        }
        
        // Outer ethereal glow
        const gradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, size * 2
        );
        gradient.addColorStop(0, `rgba(${baseTone}, ${baseTone}, ${baseTone}, ${glowIntensity})`);
        gradient.addColorStop(1, `rgba(${baseTone}, ${baseTone}, ${baseTone}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(node.x, node.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Soft core
        const coreGradient = ctx.createRadialGradient(
          node.x, node.y, 0,
          node.x, node.y, size
        );
        coreGradient.addColorStop(0, `rgba(${baseTone - 10}, ${baseTone - 10}, ${baseTone - 10}, 0.7)`);
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

// Differs from others by: Implements Hamiltonian path search using backtracking algorithm with complete graph traversal visualization - no other visual solves NP-complete path problems

const metadata = {
  themes: "graceful journey, complete presence, flowing connection, sacred visiting",
  visualisation: "Gentle path flows through all points in perfect harmony and connection",
  promptSuggestion: "1. Adjust particle arrangement\n2. Vary path flow rhythm\n3. Control connection visualization"
};
(HamiltonianPath as any).metadata = metadata;

export default HamiltonianPath;

// Themes: complete traversal, graph walking meditation, optimal journeys
// Visualisation: Graph traversal creates meditative walking patterns visiting every node exactly once
// Unique mechanism: Hamiltonian path finding on random graphs with backtracking visualization

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
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.06)';
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

      // Draw edges
      edges.forEach(edge => {
        const fromNode = nodes[edge.from];
        const toNode = nodes[edge.to];
        
        let strokeStyle, lineWidth;
        if (edge.inHamiltonianPath) {
          strokeStyle = 'rgba(80,120,80,0.8)';
          lineWidth = 3;
        } else {
          strokeStyle = 'rgba(70,70,70,0.3)';
          lineWidth = 1;
        }
        
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = lineWidth;
        ctx.beginPath();
        ctx.moveTo(fromNode.x, fromNode.y);
        ctx.lineTo(toNode.x, toNode.y);
        ctx.stroke();
      });

      // Draw Hamiltonian path sequence
      if (pathFound) {
        ctx.strokeStyle = 'rgba(60,100,60,0.6)';
        ctx.lineWidth = 4;
        ctx.setLineDash([8, 4]);
        
        for (let i = 1; i < hamiltonianPath.length; i++) {
          const fromNode = nodes[hamiltonianPath[i - 1]];
          const toNode = nodes[hamiltonianPath[i]];
          
          ctx.beginPath();
          ctx.moveTo(fromNode.x, fromNode.y);
          ctx.lineTo(toNode.x, toNode.y);
          ctx.stroke();
        }
        ctx.setLineDash([]);
      }

      // Draw nodes
      nodes.forEach(node => {
        const pulse = Math.sin(time * 2 + node.id * 0.5) * 0.1 + 0.9;
        let fillStyle, strokeStyle;
        
        if (node.inPath) {
          const pathProgress = node.pathIndex / Math.max(1, hamiltonianPath.length - 1);
          const intensity = 80 + pathProgress * 40;
          fillStyle = `rgba(${intensity},${intensity + 20},${intensity},0.8)`;
          strokeStyle = `rgba(${intensity - 20},${intensity},${intensity - 20},0.8)`;
        } else {
          fillStyle = 'rgba(80,80,80,0.7)';
          strokeStyle = 'rgba(50,50,50,0.8)';
        }
        
        // Node circle
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(node.x, node.y, node.size * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Path index for nodes in Hamiltonian path
        if (node.inPath) {
          ctx.font = '10px serif';
          ctx.fillStyle = 'rgba(30,30,30,0.9)';
          ctx.textAlign = 'center';
          ctx.fillText(node.pathIndex.toString(), node.x, node.y + 4);
        }
        
        // Node ID
        ctx.font = '8px serif';
        ctx.fillStyle = 'rgba(40,40,40,0.7)';
        ctx.textAlign = 'center';
        ctx.fillText(node.id.toString(), node.x, node.y - node.size - 5);
      });

      // Draw search progress
      if (searching) {
        ctx.font = '10px serif';
        ctx.fillStyle = 'rgba(80,60,60,0.8)';
        ctx.fillText('Searching for Hamiltonian path...', 10, 25);
        ctx.fillText(`Search stack: ${searchStack.length}`, 10, 40);
      }

      // Display results
      ctx.font = '12px serif';
      ctx.fillStyle = 'rgba(60,60,60,0.8)';
      
      if (pathFound) {
        ctx.fillStyle = 'rgba(60,100,60,0.8)';
        ctx.fillText(`Hamiltonian path found!`, 10, height - 40);
        ctx.fillText(`Path: ${hamiltonianPath.join(' → ')}`, 10, height - 20);
      } else if (!searching) {
        ctx.fillStyle = 'rgba(100,60,60,0.8)';
        ctx.fillText('No Hamiltonian path exists', 10, height - 20);
      }

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
  themes: "complete traversal, graph walking meditation, optimal journeys",
  visualisation: "Graph traversal creates meditative walking patterns visiting every node exactly once",
  promptSuggestion: "1. Adjust graph connectivity and complexity\n2. Vary search algorithm visualization speed\n3. Control path highlighting and animation"
};
(HamiltonianPath as any).metadata = metadata;

export default HamiltonianPath;

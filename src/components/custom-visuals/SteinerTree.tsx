// Themes: optimal connections, minimal networks, geometric optimization
// Visualisation: Optimal connection points minimize total distances creating efficient network trees
// Unique mechanism: Steiner tree approximation algorithm with geometric network optimization

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const SteinerTree: React.FC<VisualProps> = ({ width, height }) => {
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
    let seed = 24681;
    const random = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    interface Point {
      x: number;
      y: number;
      id: number;
      isTerminal: boolean;
      isSteiner: boolean;
      connections: number[];
      age: number;
    }

    interface Edge {
      from: number;
      to: number;
      length: number;
      inSteinerTree: boolean;
      weight: number;
    }

    const points: Point[] = [];
    const edges: Edge[] = [];
    let totalLength = 0;
    let nextPointId = 0;

    // Generate random terminal points
    const generateTerminals = () => {
      points.length = 0;
      edges.length = 0;
      nextPointId = 0;

      const numTerminals = 6;
      for (let i = 0; i < numTerminals; i++) {
        points.push({
          x: 80 + random() * (width - 160),
          y: 80 + random() * (height - 160),
          id: nextPointId++,
          isTerminal: true,
          isSteiner: false,
          connections: [],
          age: 0
        });
      }
    };

    // Calculate distance between two points
    const distance = (p1: Point, p2: Point): number => {
      const dx = p1.x - p2.x;
      const dy = p1.y - p2.y;
      return Math.sqrt(dx * dx + dy * dy);
    };

    // Find Fermat point (Steiner point) for three points
    const findFermatPoint = (p1: Point, p2: Point, p3: Point): Point => {
      // For simplicity, use geometric median approximation
      // In reality, Fermat point is where angles between points are 120°
      
      // Check if any angle is >= 120°, then Fermat point is that vertex
      const angles = [
        Math.acos(((p2.x - p1.x) * (p3.x - p1.x) + (p2.y - p1.y) * (p3.y - p1.y)) / 
                  (distance(p1, p2) * distance(p1, p3))),
        Math.acos(((p1.x - p2.x) * (p3.x - p2.x) + (p1.y - p2.y) * (p3.y - p2.y)) / 
                  (distance(p2, p1) * distance(p2, p3))),
        Math.acos(((p1.x - p3.x) * (p2.x - p3.x) + (p1.y - p3.y) * (p2.y - p3.y)) / 
                  (distance(p3, p1) * distance(p3, p2)))
      ];

      const maxAngleIndex = angles.indexOf(Math.max(...angles));
      if (angles[maxAngleIndex] >= Math.PI * 2 / 3) {
        return [p1, p2, p3][maxAngleIndex];
      }

      // Approximate Fermat point using centroid with angle adjustment
      const cx = (p1.x + p2.x + p3.x) / 3;
      const cy = (p1.y + p2.y + p3.y) / 3;
      
      return {
        x: cx,
        y: cy,
        id: nextPointId++,
        isTerminal: false,
        isSteiner: true,
        connections: [p1.id, p2.id, p3.id],
        age: 0
      };
    };

    // Minimum spanning tree (Kruskal's algorithm)
    const minimumSpanningTree = () => {
      edges.length = 0;
      
      // Create all possible edges
      const allEdges: Edge[] = [];
      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          allEdges.push({
            from: points[i].id,
            to: points[j].id,
            length: distance(points[i], points[j]),
            inSteinerTree: false,
            weight: 1
          });
        }
      }

      // Sort by length
      allEdges.sort((a, b) => a.length - b.length);

      // Union-find for cycle detection
      const parent = new Map<number, number>();
      const rank = new Map<number, number>();
      
      points.forEach(p => {
        parent.set(p.id, p.id);
        rank.set(p.id, 0);
      });

      const find = (x: number): number => {
        if (parent.get(x) !== x) {
          parent.set(x, find(parent.get(x)!));
        }
        return parent.get(x)!;
      };

      const union = (x: number, y: number): boolean => {
        const rootX = find(x);
        const rootY = find(y);
        
        if (rootX === rootY) return false;
        
        const rankX = rank.get(rootX)!;
        const rankY = rank.get(rootY)!;
        
        if (rankX < rankY) {
          parent.set(rootX, rootY);
        } else if (rankX > rankY) {
          parent.set(rootY, rootX);
        } else {
          parent.set(rootY, rootX);
          rank.set(rootX, rankX + 1);
        }
        return true;
      };

      // Build MST
      for (const edge of allEdges) {
        if (edges.length === points.length - 1) break;
        
        if (union(edge.from, edge.to)) {
          edge.inSteinerTree = true;
          edges.push(edge);
        }
      }

      // Calculate total length
      totalLength = edges.reduce((sum, edge) => sum + edge.length, 0);
    };

    // Approximate Steiner tree using 2-approximation
    const approximateSteinerTree = () => {
      // Start with MST of terminals
      const terminals = points.filter(p => p.isTerminal);
      if (terminals.length < 3) {
        minimumSpanningTree();
        return;
      }

      // For small sets, try adding Steiner points
      if (terminals.length <= 4) {
        // Try adding Fermat points for triplets
        const originalPoints = [...points];
        const steinerCandidates: Point[] = [];

        for (let i = 0; i < terminals.length; i++) {
          for (let j = i + 1; j < terminals.length; j++) {
            for (let k = j + 1; k < terminals.length; k++) {
              const fermatPoint = findFermatPoint(terminals[i], terminals[j], terminals[k]);
              if (fermatPoint.isSteiner) {
                steinerCandidates.push(fermatPoint);
              }
            }
          }
        }

        // Test each Steiner candidate
        let bestLength = Infinity;
        let bestConfiguration: Point[] = [...originalPoints];

        steinerCandidates.forEach(candidate => {
          points.length = 0;
          points.push(...originalPoints, candidate);
          minimumSpanningTree();
          
          if (totalLength < bestLength) {
            bestLength = totalLength;
            bestConfiguration = [...points];
          }
        });

        // Use best configuration
        points.length = 0;
        points.push(...bestConfiguration);
      }

      minimumSpanningTree();
    };

    generateTerminals();
    approximateSteinerTree();

    const render = (t: number) => {
      // Trails with translucent clear
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Update point ages
      points.forEach(point => point.age += 0.02);

      // Regenerate periodically
      if (Math.floor(time * 0.1) % 40 === 0 && Math.floor(time * 10) % 10 === 0) {
        generateTerminals();
        approximateSteinerTree();
      }

      // Draw edges
      edges.forEach(edge => {
        const fromPoint = points.find(p => p.id === edge.from);
        const toPoint = points.find(p => p.id === edge.to);
        
        if (fromPoint && toPoint) {
          const alpha = edge.inSteinerTree ? 0.7 : 0.2;
          const lineWidth = edge.inSteinerTree ? 2.5 : 1;
          
          // Color based on edge optimality
          const efficiency = 1 - (edge.length / (width + height));
          const intensity = 60 + efficiency * 40;
          
          ctx.strokeStyle = `rgba(${intensity},${intensity + 10},${intensity},${alpha})`;
          ctx.lineWidth = lineWidth;
          
          ctx.beginPath();
          ctx.moveTo(fromPoint.x, fromPoint.y);
          ctx.lineTo(toPoint.x, toPoint.y);
          ctx.stroke();
          
          // Draw length annotation for Steiner edges
          if (edge.inSteinerTree && (fromPoint.isSteiner || toPoint.isSteiner)) {
            const midX = (fromPoint.x + toPoint.x) / 2;
            const midY = (fromPoint.y + toPoint.y) / 2;
            
            ctx.font = '8px serif';
            ctx.fillStyle = 'rgba(60,60,60,0.5)';
            ctx.textAlign = 'center';
            ctx.fillText(Math.round(edge.length).toString(), midX, midY - 5);
          }
        }
      });

      // Draw connection optimization visualization
      points.filter(p => p.isSteiner).forEach(steinerPoint => {
        // Draw optimization field around Steiner points
        const gradient = ctx.createRadialGradient(
          steinerPoint.x, steinerPoint.y, 0,
          steinerPoint.x, steinerPoint.y, 40
        );
        gradient.addColorStop(0, 'rgba(100,120,100,0.2)');
        gradient.addColorStop(1, 'rgba(100,120,100,0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(steinerPoint.x, steinerPoint.y, 40, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw points
      points.forEach(point => {
        const pulse = Math.sin(point.age + time * 2) * 0.1 + 0.9;
        let size, fillStyle, strokeStyle;
        
        if (point.isTerminal) {
          size = 8;
          fillStyle = 'rgba(80,80,80,0.8)';
          strokeStyle = 'rgba(50,50,50,0.8)';
        } else if (point.isSteiner) {
          size = 6;
          fillStyle = 'rgba(100,120,100,0.8)';
          strokeStyle = 'rgba(60,80,60,0.8)';
        } else {
          size = 5;
          fillStyle = 'rgba(70,70,70,0.6)';
          strokeStyle = 'rgba(40,40,40,0.6)';
        }
        
        // Point circle
        ctx.fillStyle = fillStyle;
        ctx.strokeStyle = strokeStyle;
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * pulse, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();
        
        // Point type indicator
        if (point.isSteiner) {
          // Steiner point - draw small triangle
          ctx.fillStyle = 'rgba(40,60,40,0.8)';
          ctx.beginPath();
          ctx.moveTo(point.x, point.y - 3);
          ctx.lineTo(point.x - 2.5, point.y + 2);
          ctx.lineTo(point.x + 2.5, point.y + 2);
          ctx.closePath();
          ctx.fill();
        } else {
          // Terminal point - draw small square
          ctx.fillStyle = 'rgba(40,40,40,0.8)';
          ctx.fillRect(point.x - 2, point.y - 2, 4, 4);
        }
      });

      // Draw network statistics
      const terminalCount = points.filter(p => p.isTerminal).length;
      const steinerCount = points.filter(p => p.isSteiner).length;
      
      ctx.font = '11px serif';
      ctx.fillStyle = 'rgba(60,60,60,0.8)';
      ctx.fillText(`Terminals: ${terminalCount}`, 10, 25);
      ctx.fillText(`Steiner Points: ${steinerCount}`, 10, 40);
      ctx.fillText(`Total Length: ${totalLength.toFixed(1)}`, 10, 55);
      
      // Efficiency indicator
      const maxPossibleLength = terminalCount * Math.sqrt(width * width + height * height);
      const efficiency = 1 - (totalLength / maxPossibleLength);
      ctx.fillText(`Efficiency: ${(efficiency * 100).toFixed(1)}%`, 10, 70);

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

// Differs from others by: Implements Steiner tree approximation algorithm with geometric network optimization and Fermat point computation - no other visual solves network optimization problems

const metadata = {
  themes: "optimal connections, minimal networks, geometric optimization",
  visualisation: "Optimal connection points minimize total distances creating efficient network trees",
  promptSuggestion: "1. Adjust terminal point distribution\n2. Vary Steiner point optimization\n3. Control network efficiency visualization"
};
(SteinerTree as any).metadata = metadata;

export default SteinerTree;

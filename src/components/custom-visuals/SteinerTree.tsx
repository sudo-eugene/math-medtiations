// Themes: natural efficiency, graceful connections, effortless unity, flowing networks
// Visualisation: Points find their natural connections forming harmonious efficient networks
// Unique mechanism: Steiner tree approximation transformed into meditation on efficiency

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
      // Gentle fade for flowing networks
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0, 0, width, height);

      const time = t * 0.001;

      // Update point ages
      points.forEach(point => point.age += 0.02);

      // Regenerate periodically
      if (Math.floor(time * 0.1) % 40 === 0 && Math.floor(time * 10) % 10 === 0) {
        generateTerminals();
        approximateSteinerTree();
      }

      // Draw flowing connections
      edges.forEach(edge => {
        const fromPoint = points.find(p => p.id === edge.from);
        const toPoint = points.find(p => p.id === edge.to);
        
        if (fromPoint && toPoint) {
          const pulse = Math.sin(time * 1.5 + edge.from * 0.2) * 0.05 + 0.95;
          
          if (edge.inSteinerTree) {
            // Active connections - gentle and visible
            const efficiency = 1 - (edge.length / (width + height));
            const baseTone = 90 + efficiency * 20;
            const alpha = 0.25 * pulse;
            
            ctx.strokeStyle = `rgba(${baseTone}, ${baseTone}, ${baseTone}, ${alpha})`;
            ctx.lineWidth = 2;
          } else {
            // Potential connections - very subtle
            ctx.strokeStyle = `rgba(85, 85, 85, 0.05)`;
            ctx.lineWidth = 0.5;
          }
          
          ctx.beginPath();
          ctx.moveTo(fromPoint.x, fromPoint.y);
          ctx.lineTo(toPoint.x, toPoint.y);
          ctx.stroke();
        }
      });

      // Draw ethereal optimization fields around harmony points
      points.filter(p => p.isSteiner).forEach(steinerPoint => {
        const breathe = Math.sin(steinerPoint.age + time * 1.2) * 0.15 + 1;
        const fieldSize = 40 * breathe;
        
        const gradient = ctx.createRadialGradient(
          steinerPoint.x, steinerPoint.y, 0,
          steinerPoint.x, steinerPoint.y, fieldSize
        );
        gradient.addColorStop(0, 'rgba(105, 105, 105, 0.12)');
        gradient.addColorStop(1, 'rgba(105, 105, 105, 0)');
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(steinerPoint.x, steinerPoint.y, fieldSize, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw ethereal particles
      points.forEach(point => {
        const breathe = Math.sin(point.age + time * 1.5) * 0.15 + 1;
        let size, baseTone, glowIntensity;
        
        if (point.isTerminal) {
          // Terminal points - primary nodes
          size = 8 * breathe;
          baseTone = 90;
          glowIntensity = 0.25;
        } else if (point.isSteiner) {
          // Harmony points - efficient connectors
          size = 6 * breathe;
          baseTone = 100;
          glowIntensity = 0.3 + Math.sin(time * 2) * 0.1;
        } else {
          size = 5 * breathe;
          baseTone = 85;
          glowIntensity = 0.15;
        }
        
        // Outer glow
        const gradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size * 2
        );
        gradient.addColorStop(0, `rgba(${baseTone}, ${baseTone}, ${baseTone}, ${glowIntensity})`);
        gradient.addColorStop(1, `rgba(${baseTone}, ${baseTone}, ${baseTone}, 0)`);
        
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size * 2, 0, Math.PI * 2);
        ctx.fill();
        
        // Soft core
        const coreGradient = ctx.createRadialGradient(
          point.x, point.y, 0,
          point.x, point.y, size
        );
        coreGradient.addColorStop(0, `rgba(${baseTone - 10}, ${baseTone - 10}, ${baseTone - 10}, 0.7)`);
        coreGradient.addColorStop(1, `rgba(${baseTone - 10}, ${baseTone - 10}, ${baseTone - 10}, 0.2)`);
        
        ctx.fillStyle = coreGradient;
        ctx.beginPath();
        ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
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

// Differs from others by: Implements Steiner tree approximation algorithm with geometric network optimization and Fermat point computation - no other visual solves network optimization problems

const metadata = {
  themes: "natural efficiency, graceful connections, effortless unity, flowing networks",
  visualisation: "Points find their natural connections forming harmonious efficient networks",
  promptSuggestion: "1. Adjust point distribution\n2. Vary harmony patterns\n3. Control network flow visualization"
};
(SteinerTree as any).metadata = metadata;

export default SteinerTree;

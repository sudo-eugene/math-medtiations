import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: dimensional transcendence, topological impossibilities, space-time folding
// visualization: Klein bottle surface transforming through 4D space projections

const KleinBottleTransform: React.FC<VisualProps> = ({ width, height }) => {
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

    // Klein bottle parameterization points
    const surfacePoints = [];
    const numU = 40;
    const numV = 20;

    // Generate Klein bottle surface
    for (let i = 0; i < numU; i++) {
      for (let j = 0; j < numV; j++) {
        const u = (i / numU) * Math.PI * 2;
        const v = (j / numV) * Math.PI * 2;
        
        surfacePoints.push({
          u,
          v,
          originalU: u,
          originalV: v,
          alpha: 0.5 + Math.random() * 0.3
        });
      }
    }

    let animationId = null;

    // Klein bottle surface equation with 4D rotation
    const kleinBottle = (u, v, t) => {
      const cos_u = Math.cos(u);
      const sin_u = Math.sin(u);
      const cos_v = Math.cos(v);
      const sin_v = Math.sin(v);
      
      // 4D Klein bottle coordinates
      let x, y, z, w;
      
      if (u < Math.PI) {
        // First half
        x = 3 * cos_u * (1 + sin_u) + (2 * (1 - cos_u / 2)) * cos_u * cos_v;
        y = 16 * sin_u + (2 * (1 - cos_u / 2)) * sin_u * cos_v;
        z = (2 * (1 - cos_u / 2)) * sin_v;
        w = Math.sin(u * 2) * cos_v;
      } else {
        // Second half (self-intersection)
        x = 3 * cos_u * (1 + sin_u) + (2 * (1 - cos_u / 2)) * cos_v;
        y = 16 * sin_u;
        z = (2 * (1 - cos_u / 2)) * sin_v;
        w = Math.cos(u * 2) * sin_v;
      }
      
      // Apply 4D rotation for animation
      const angle1 = t * 0.02;
      const angle2 = t * 0.015;
      
      // Rotate in XW plane
      const xw_x = x * Math.cos(angle1) - w * Math.sin(angle1);
      const xw_w = x * Math.sin(angle1) + w * Math.cos(angle1);
      
      // Rotate in YZ plane  
      const yz_y = y * Math.cos(angle2) - z * Math.sin(angle2);
      const yz_z = y * Math.sin(angle2) + z * Math.cos(angle2);
      
      return {
        x: xw_x,
        y: yz_y,
        z: yz_z,
        w: xw_w
      };
    };

    // Project 4D to 3D using stereographic projection
    const project4Dto3D = (x4d, y4d, z4d, w4d) => {
      const w_offset = 4; // Avoid division by zero
      return {
        x: x4d / (w_offset - w4d),
        y: y4d / (w_offset - w4d), 
        z: z4d / (w_offset - w4d)
      };
    };

    // Project 3D to 2D screen coordinates
    const project3Dto2D = (x3d, y3d, z3d) => {
      const distance = 15;
      const scale = 8;
      
      const perspective = distance / (distance + z3d);
      return {
        x: centerX + x3d * scale * perspective,
        y: centerY + y3d * scale * perspective,
        depth: z3d
      };
    };

    const drawWireframe = () => {
      // Draw wireframe connections
      ctx.strokeStyle = 'rgba(70, 70, 70, 0.3)';
      ctx.lineWidth = 1;
      
      for (let i = 0; i < numU - 1; i++) {
        for (let j = 0; j < numV - 1; j++) {
          const idx1 = i * numV + j;
          const idx2 = (i + 1) * numV + j;
          const idx3 = i * numV + (j + 1);
          const idx4 = (i + 1) * numV + (j + 1);
          
          const p1 = surfacePoints[idx1];
          const p2 = surfacePoints[idx2];
          const p3 = surfacePoints[idx3];
          const p4 = surfacePoints[idx4];
          
          if (p1 && p2 && p3 && p4) {
            // Calculate 4D positions
            const pos1_4d = kleinBottle(p1.u, p1.v, time);
            const pos2_4d = kleinBottle(p2.u, p2.v, time);
            const pos3_4d = kleinBottle(p3.u, p3.v, time);
            const pos4_4d = kleinBottle(p4.u, p4.v, time);
            
            // Project to 3D then 2D
            const pos1_3d = project4Dto3D(pos1_4d.x, pos1_4d.y, pos1_4d.z, pos1_4d.w);
            const pos2_3d = project4Dto3D(pos2_4d.x, pos2_4d.y, pos2_4d.z, pos2_4d.w);
            const pos3_3d = project4Dto3D(pos3_4d.x, pos3_4d.y, pos3_4d.z, pos3_4d.w);
            const pos4_3d = project4Dto3D(pos4_4d.x, pos4_4d.y, pos4_4d.z, pos4_4d.w);
            
            const screen1 = project3Dto2D(pos1_3d.x, pos1_3d.y, pos1_3d.z);
            const screen2 = project3Dto2D(pos2_3d.x, pos2_3d.y, pos2_3d.z);
            const screen3 = project3Dto2D(pos3_3d.x, pos3_3d.y, pos3_3d.z);
            const screen4 = project3Dto2D(pos4_3d.x, pos4_3d.y, pos4_3d.z);
            
            // Draw quad edges
            ctx.beginPath();
            ctx.moveTo(screen1.x, screen1.y);
            ctx.lineTo(screen2.x, screen2.y);
            ctx.lineTo(screen4.x, screen4.y);
            ctx.lineTo(screen3.x, screen3.y);
            ctx.closePath();
            ctx.stroke();
          }
        }
      }
    };

    const drawSurfacePoints = () => {
      // Sort points by depth for proper rendering
      const projectedPoints = [];
      
      surfacePoints.forEach((point, i) => {
        const pos4d = kleinBottle(point.u, point.v, time);
        const pos3d = project4Dto3D(pos4d.x, pos4d.y, pos4d.z, pos4d.w);
        const screen = project3Dto2D(pos3d.x, pos3d.y, pos3d.z);
        
        projectedPoints.push({
          ...screen,
          alpha: point.alpha,
          w4d: pos4d.w,
          index: i
        });
      });
      
      // Sort by depth (farthest first)
      projectedPoints.sort((a, b) => a.depth - b.depth);
      
      // Draw points
      projectedPoints.forEach(point => {
        if (point.x > -50 && point.x < width + 50 && 
            point.y > -50 && point.y < height + 50) {
          
          // Color based on 4D w-coordinate
          const wColor = (Math.sin(point.w4d * 0.5 + time * 0.1) + 1) / 2;
          const hue = wColor * 60; // Blue to cyan range
          
          const size = Math.max(0, 2 + (1 - Math.abs(point.depth) / 10) * 2);
          const alpha = point.alpha * (1 - Math.abs(point.depth) / 15);
          
          ctx.fillStyle = `hsla(${180 + hue}, 40%, 40%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Dimensional shimmer effect
          if (Math.abs(point.w4d) > 2) {
            ctx.fillStyle = `hsla(${180 + hue}, 60%, 60%, ${alpha * 0.5})`;
            ctx.beginPath();
            ctx.arc(point.x, point.y, size * 1.5, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });
    };

    const drawDimensionalRifts = () => {
      // Show dimensional transitions where Klein bottle intersects itself
      ctx.strokeStyle = 'rgba(100, 60, 120, 0.4)';
      ctx.lineWidth = 2;
      
      for (let i = 0; i < 8; i++) {
        const u = Math.PI + Math.sin(time * 0.03 + i) * 0.5;
        const v = (i / 8) * Math.PI * 2;
        
        const pos4d = kleinBottle(u, v, time);
        const pos3d = project4Dto3D(pos4d.x, pos4d.y, pos4d.z, pos4d.w);
        const screen = project3Dto2D(pos3d.x, pos3d.y, pos3d.z);
        
        const riftSize = 10 + Math.sin(time * 0.1 + i) * 5;
        
        ctx.beginPath();
        ctx.arc(screen.x, screen.y, riftSize, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const drawTopologicalAnnotations = () => {
      // Draw mathematical curves showing topology
      ctx.strokeStyle = 'rgba(80, 80, 80, 0.2)';
      ctx.lineWidth = 1;
      
      // Draw parameter space grid overlay
      for (let u = 0; u < Math.PI * 2; u += Math.PI / 6) {
        ctx.beginPath();
        for (let v = 0; v < Math.PI * 2; v += 0.1) {
          const pos4d = kleinBottle(u, v, time);
          const pos3d = project4Dto3D(pos4d.x, pos4d.y, pos4d.z, pos4d.w);
          const screen = project3Dto2D(pos3d.x, pos3d.y, pos3d.z);
          
          if (v === 0) ctx.moveTo(screen.x, screen.y);
          else ctx.lineTo(screen.x, screen.y);
        }
        ctx.stroke();
      }
    };

    const animate = () => {
      // Background with dimensional gradient
      const bgGradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, Math.max(width, height) / 2);
      bgGradient.addColorStop(0, '#F2F0E8');
      bgGradient.addColorStop(0.7, '#E8E6DE');
      bgGradient.addColorStop(1, '#DDD8CE');
      ctx.fillStyle = bgGradient;
      ctx.fillRect(0, 0, width, height);

      time += 0.25;
      
      // Draw topological structure
      drawTopologicalAnnotations();
      
      // Draw wireframe structure
      drawWireframe();
      
      // Draw surface points
      drawSurfacePoints();
      
      // Draw dimensional intersections
      drawDimensionalRifts();
      
      // Title annotation
      ctx.fillStyle = 'rgba(60, 60, 60, 0.3)';
      ctx.font = '12px serif';
      ctx.textAlign = 'center';
      ctx.fillText('Klein Bottle ⊂ ℝ⁴ → ℝ³', centerX, height - 20);

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

export default KleinBottleTransform;

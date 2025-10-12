import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: dimensional transcendence, topological impossibilities, space-time folding
// visualization: Klein bottle surface transforming through 4D space projections

const KleinBottleTransform: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

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

    type SurfacePoint = {
      u: number;
      v: number;
      originalU: number;
      originalV: number;
      alpha: number;
    };

    type Vec3 = { x: number; y: number; z: number };

    // Klein bottle parameterization points
    const surfacePoints: SurfacePoint[] = [];
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

    const clamp = (value: number, min: number, max: number) => Math.max(min, Math.min(max, value));

    const normalizeVec = (vec: Vec3): Vec3 => {
      const length = Math.hypot(vec.x, vec.y, vec.z);
      if (length === 0) return { x: 0, y: 0, z: 0 };
      return { x: vec.x / length, y: vec.y / length, z: vec.z / length };
    };

    const cross = (a: Vec3, b: Vec3): Vec3 => ({
      x: a.y * b.z - a.z * b.y,
      y: a.z * b.x - a.x * b.z,
      z: a.x * b.y - a.y * b.x,
    });

    const lightDirection = normalizeVec({ x: 0.35, y: -0.45, z: 0.82 });

    let animationId: number | null = null;

    // Klein bottle surface equation with 4D rotation
    const kleinBottle = (u: number, v: number, t: number) => {
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
    const project4Dto3D = (x4d: number, y4d: number, z4d: number, w4d: number) => {
      const w_offset = 4; // Avoid division by zero
      return {
        x: x4d / (w_offset - w4d),
        y: y4d / (w_offset - w4d), 
        z: z4d / (w_offset - w4d)
      };
    };

    // Project 3D to 2D screen coordinates
    const project3Dto2D = (x3d: number, y3d: number, z3d: number) => {
      const distance = 15;
      const scale = 8;
      
      const perspective = distance / (distance + z3d);
      return {
        x: centerX + x3d * scale * perspective,
        y: centerY + y3d * scale * perspective,
        depth: z3d
      };
    };

    const computeShading = (u: number, v: number, base3d: Vec3) => {
      const delta = 0.04;
      const offsetU = kleinBottle(u + delta, v, time);
      const offsetV = kleinBottle(u, v + delta, time);

      const offsetU3d = project4Dto3D(offsetU.x, offsetU.y, offsetU.z, offsetU.w);
      const offsetV3d = project4Dto3D(offsetV.x, offsetV.y, offsetV.z, offsetV.w);

      const tangentU: Vec3 = {
        x: offsetU3d.x - base3d.x,
        y: offsetU3d.y - base3d.y,
        z: offsetU3d.z - base3d.z,
      };

      const tangentV: Vec3 = {
        x: offsetV3d.x - base3d.x,
        y: offsetV3d.y - base3d.y,
        z: offsetV3d.z - base3d.z,
      };

      const normal = cross(tangentU, tangentV);
      const normalLength = Math.hypot(normal.x, normal.y, normal.z);
      if (normalLength === 0) {
        return { shading: 0.35, rim: 0.1 };
      }

      const normalizedNormal = {
        x: normal.x / normalLength,
        y: normal.y / normalLength,
        z: normal.z / normalLength,
      };

      const diffuse = clamp(
        normalizedNormal.x * lightDirection.x +
          normalizedNormal.y * lightDirection.y +
          normalizedNormal.z * lightDirection.z,
        -1,
        1
      );

      const intensity = Math.max(0, diffuse);
      const shading = 0.25 + intensity * 0.65;
      const rim = Math.pow(clamp(1 - intensity, 0, 1), 2);

      return { shading, rim };
    };

    const drawBackground = () => {
      const radialGradient = ctx.createRadialGradient(
        centerX,
        centerY,
        Math.max(width, height) * 0.08,
        centerX,
        centerY,
        Math.max(width, height) * 0.8
      );

      radialGradient.addColorStop(0, '#F5F2EA');
      radialGradient.addColorStop(0.55, '#E4E8EC');
      radialGradient.addColorStop(1, '#D4DEE6');

      ctx.fillStyle = radialGradient;
      ctx.fillRect(0, 0, width, height);

      const linearGradient = ctx.createLinearGradient(0, 0, width, height);
      linearGradient.addColorStop(0, 'rgba(180, 196, 214, 0.18)');
      linearGradient.addColorStop(0.6, 'rgba(220, 228, 234, 0.08)');
      linearGradient.addColorStop(1, 'rgba(170, 192, 210, 0.16)');

      ctx.fillStyle = linearGradient;
      ctx.fillRect(0, 0, width, height);
    };

    const drawNebulaVeil = () => {
      ctx.save();
      ctx.globalCompositeOperation = 'lighter';

      for (let i = 0; i < 3; i++) {
        const angle = time * 0.0025 + i;
        const offsetX = centerX + Math.cos(angle) * width * 0.12;
        const offsetY = centerY + Math.sin(angle * 1.3) * height * 0.1;
        const gradient = ctx.createRadialGradient(offsetX, offsetY, 0, offsetX, offsetY, Math.max(width, height) * 0.7);

        gradient.addColorStop(0, `rgba(210, 224, 238, ${0.12 - i * 0.03})`);
        gradient.addColorStop(0.6, 'rgba(196, 216, 229, 0.05)');
        gradient.addColorStop(1, 'rgba(180, 206, 220, 0)');

        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, width, height);
      }

      ctx.restore();
    };

    const drawWireframe = () => {
      ctx.save();
      ctx.lineWidth = 0.8;
      ctx.lineJoin = 'round';

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
            
            const avgDepth = (screen1.depth + screen2.depth + screen3.depth + screen4.depth) / 4;
            const opacity = clamp(0.22 - avgDepth * 0.02, 0.05, 0.22);
            ctx.strokeStyle = `rgba(118, 142, 176, ${opacity})`;

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

      ctx.restore();
    };

    const drawSurfacePoints = () => {
      // Sort points by depth for proper rendering
      const projectedPoints: Array<{
        x: number;
        y: number;
        depth: number;
        alpha: number;
        w4d: number;
        shading: number;
        rim: number;
      }> = [];
      
      surfacePoints.forEach((point, i) => {
        const pos4d = kleinBottle(point.u, point.v, time);
        const pos3d = project4Dto3D(pos4d.x, pos4d.y, pos4d.z, pos4d.w);
        const { shading, rim } = computeShading(point.u, point.v, pos3d);
        const screen = project3Dto2D(pos3d.x, pos3d.y, pos3d.z);
        
        projectedPoints.push({
          ...screen,
          alpha: point.alpha,
          w4d: pos4d.w,
          shading,
          rim,
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
          const baseHue = 200 + wColor * 45;
          const saturation = clamp(52 + wColor * 20 + point.rim * 25, 0, 100);
          const lightness = clamp(32 + point.shading * 35 + point.rim * 10, 0, 88);
          
          const size = Math.max(1.2, 1.8 + point.shading * 1.6 - point.depth * 0.08);
          const alpha = clamp(point.alpha * (0.65 + point.shading * 0.3), 0.08, 0.85);
          
          ctx.fillStyle = `hsla(${baseHue}, ${saturation}%, ${lightness}%, ${alpha})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size, 0, Math.PI * 2);
          ctx.fill();
          
          // Dimensional shimmer effect
          ctx.save();
          ctx.globalCompositeOperation = 'lighter';
          ctx.fillStyle = `hsla(${baseHue + 10}, ${clamp(saturation + 12, 0, 100)}%, ${clamp(lightness + 12, 0, 96)}%, ${alpha * 0.35 * (0.6 + point.rim)})`;
          ctx.beginPath();
          ctx.arc(point.x, point.y, size * (1.3 + point.rim * 0.45), 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }
      });
    };

    const drawDimensionalRifts = () => {
      // Show dimensional transitions where Klein bottle intersects itself
      ctx.save();
      ctx.lineWidth = 1.4;
      ctx.globalCompositeOperation = 'screen';

      for (let i = 0; i < 8; i++) {
        const u = Math.PI + Math.sin(time * 0.03 + i) * 0.5;
        const v = (i / 8) * Math.PI * 2;
        
        const pos4d = kleinBottle(u, v, time);
        const pos3d = project4Dto3D(pos4d.x, pos4d.y, pos4d.z, pos4d.w);
        const screen = project3Dto2D(pos3d.x, pos3d.y, pos3d.z);
        
        const riftSize = 10 + Math.sin(time * 0.1 + i) * 5;
        const riftOpacity = clamp(0.18 + Math.sin(time * 0.05 + i) * 0.08, 0.06, 0.32);
        ctx.strokeStyle = `rgba(170, 120, 210, ${riftOpacity})`;
        ctx.shadowColor = `rgba(180, 150, 230, ${riftOpacity * 0.6})`;
        ctx.shadowBlur = 8;

        ctx.beginPath();
        ctx.arc(screen.x, screen.y, riftSize, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawTopologicalAnnotations = () => {
      // Draw mathematical curves showing topology
      ctx.save();
      ctx.strokeStyle = 'rgba(120, 150, 176, 0.1)';
      ctx.lineWidth = 0.6;

      // Draw parameter space grid overlay with lighter density
      const uStep = Math.PI / 4;
      const vStep = 0.16;

      for (let u = 0; u < Math.PI * 2; u += uStep) {
        ctx.beginPath();
        for (let v = 0; v <= Math.PI * 2 + vStep; v += vStep) {
          const pos4d = kleinBottle(u, v, time);
          const pos3d = project4Dto3D(pos4d.x, pos4d.y, pos4d.z, pos4d.w);
          const screen = project3Dto2D(pos3d.x, pos3d.y, pos3d.z);
          
          if (v === 0) ctx.moveTo(screen.x, screen.y);
          else ctx.lineTo(screen.x, screen.y);
        }
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawAtmosphericBloom = () => {
      ctx.save();
      ctx.globalCompositeOperation = 'screen';

      const bloom = ctx.createRadialGradient(
        centerX,
        centerY,
        Math.max(width, height) * 0.12,
        centerX,
        centerY,
        Math.max(width, height) * 0.65
      );
      bloom.addColorStop(0, 'rgba(232, 244, 252, 0.22)');
      bloom.addColorStop(0.55, 'rgba(192, 212, 234, 0.12)');
      bloom.addColorStop(1, 'rgba(168, 194, 220, 0)');

      ctx.fillStyle = bloom;
      ctx.fillRect(0, 0, width, height);

      ctx.restore();
    };

    const animate = () => {
      drawBackground();
      drawNebulaVeil();

      time += 0.25;
      
      // Draw topological structure
      drawTopologicalAnnotations();
      
      // Draw wireframe structure
      drawWireframe();
      
      // Draw surface points
      drawSurfacePoints();
      
      // Draw dimensional intersections
      drawDimensionalRifts();

      drawAtmosphericBloom();

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

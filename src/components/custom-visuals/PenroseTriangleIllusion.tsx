import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Penrose triangle rendered with ASCII, rotating and occasionally breaking edges
const PenroseTriangleIllusion: React.FC<VisualProps> = ({ width: containerWidth, height: containerHeight }) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const fontSize = 10;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const charWidth = fontSize * 0.6;
    const charHeight = fontSize * 1.2;

    let width = Math.floor(containerWidth / charWidth);
    let height = Math.floor(containerHeight / charHeight);

    let grid: string[][] = [];
    let time = 0;
    let animationFrameId: number;

    const chars = [' ', '.', ':', '-', '=', '+', '*', '#', '@'];

    function initGrid() {
      grid = [];
      for (let y = 0; y < height; y++) {
        const row = new Array(width).fill(' ');
        grid.push(row);
      }
    }

    function render() {
      let html = '';
      for (let y = 0; y < height; y++) {
        html += grid[y].join('') + '<br>';
      }
      canvas.innerHTML = html;
    }

    function rotate(x: number, y: number, angle: number) {
      const c = Math.cos(angle);
      const s = Math.sin(angle);
      return [x * c - y * s, x * s + y * c];
    }

    function draw() {
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          grid[y][x] = ' ';
        }
      }

      const aspect = width / height;
      const angle = time * 0.02;

      const breakPeriod = 240;
      const breakDuration = 60;
      const breakProgress = time % breakPeriod;
      const breakEdge = Math.floor(time / breakPeriod) % 3;

      // Triangle vertices in base orientation
      const r = 0.6;
      const verts: [number, number][] = [];
      for (let i = 0; i < 3; i++) {
        const a = (-Math.PI / 2) + i * (2 * Math.PI / 3);
        verts.push([Math.cos(a) * r, Math.sin(a) * r]);
      }

      for (let gy = 0; gy < height; gy++) {
        for (let gx = 0; gx < width; gx++) {
          const nx = (gx / (width - 1)) * 2 - 1;
          const ny = (gy / (height - 1)) * 2 - 1;
          let [px, py] = rotate(nx / aspect, ny, -angle);

          let best = 0;
          let char = ' ';

          for (let i = 0; i < 3; i++) {
            const a = verts[i];
            const b = verts[(i + 1) % 3];
            const dx = b[0] - a[0];
            const dy = b[1] - a[1];
            const len2 = dx * dx + dy * dy;
            const t = ((px - a[0]) * dx + (py - a[1]) * dy) / len2;
            if (t < 0 || t > 1) continue;
            // break segment
            if (i === breakEdge && breakProgress < breakDuration && t > 0.4 && t < 0.6) continue;
            const closestX = a[0] + dx * t;
            const closestY = a[1] + dy * t;
            const dist = Math.hypot(px - closestX, py - closestY);
            const thickness = 0.08;
            if (dist < thickness) {
              let brightness = 1 - dist / thickness;
              // orientation shading
              const shade = [1, 0.8, 0.6][i];
              brightness *= shade;
              if (brightness > best) {
                best = brightness;
                const idx = Math.floor(brightness * (chars.length - 1));
                char = chars[idx];
              }
            }
          }

          grid[gy][gx] = char;
        }
      }
    }

    function animate() {
      draw();
      render();
      time++;
      animationFrameId = requestAnimationFrame(animate);
    }

    initGrid();
    animationFrameId = requestAnimationFrame(animate);

    return () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
      }
      if (canvas) canvas.innerHTML = '';
    };
  }, [containerWidth, containerHeight]);

  return (
    <div
      style={{
        margin: 0,
        background: '#F0EEE6',
        overflow: 'hidden',
        fontFamily: 'monospace',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
      }}
    >
      <div
        ref={canvasRef}
        style={{
          fontSize: `${fontSize}px`,
          lineHeight: '0.85',
          letterSpacing: '0.05em',
          color: 'rgba(0,0,0,0.85)',
          userSelect: 'none',
        }}
      />
    </div>
  );
};

export default PenroseTriangleIllusion;

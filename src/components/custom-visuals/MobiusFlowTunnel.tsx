import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: continuous transformation, unity of opposites
// visualization: ASCII Möbius tunnel with rotating half-twist and light-to-dark character gradient

const MobiusFlowTunnel: React.FC<VisualProps> = ({ width: containerWidth, height: containerHeight }) => {
  const divRef = useRef<HTMLDivElement>(null);
  const fontSize = 10;

  useEffect(() => {
    const el = divRef.current;
    if (!el) return;

    const charWidth = fontSize * 0.6;
    const charHeight = fontSize * 1.2;
    const cols = Math.floor(containerWidth / charWidth);
    const rows = Math.floor(containerHeight / charHeight);

    const gradient = ' .:-=+*#%@';

    let time = 0;
    let animationFrameId: number;

    function render() {
      const grid: string[][] = Array.from({ length: rows }, () => Array(cols).fill(' '));

      const R = 20; // major radius
      const stripWidth = 8; // width of strip
      const segments = 120; // segments around loop
      const layers = 14; // concentric ellipses

      time += 0.02;
      const rot = time; // rotation around vertical axis
      const cosR = Math.cos(rot);
      const sinR = Math.sin(rot);

      for (let i = 0; i < segments; i++) {
        const u = (i / segments) * Math.PI * 2;
        const gradIndex = Math.floor((i / segments) * (gradient.length - 1));

        for (let j = 0; j < layers; j++) {
          const v = -stripWidth / 2 + (j / (layers - 1)) * stripWidth;

          // Möbius strip parametric equations
          let x = (R + v * Math.cos(u / 2)) * Math.cos(u);
          let y = (R + v * Math.cos(u / 2)) * Math.sin(u);
          let z = v * Math.sin(u / 2);

          // rotation
          const xr = x * cosR + z * sinR;
          const zr = -x * sinR + z * cosR;
          const yr = y;

          // perspective projection
          const scale = 1 / (1 - zr / 60);
          const sx = Math.floor(cols / 2 + xr * scale);
          const sy = Math.floor(rows / 2 + yr * scale);

          if (sx < 0 || sx >= cols || sy < 0 || sy >= rows) continue;

          // compute orientation via normal
          const dux = -(R + v * Math.cos(u / 2)) * Math.sin(u) - 0.5 * v * Math.sin(u / 2) * Math.cos(u);
          const duy = (R + v * Math.cos(u / 2)) * Math.cos(u) - 0.5 * v * Math.sin(u / 2) * Math.sin(u);
          const duz = 0.5 * v * Math.cos(u / 2);

          const dvx = Math.cos(u / 2) * Math.cos(u);
          const dvy = Math.cos(u / 2) * Math.sin(u);
          const dvz = Math.sin(u / 2);

          const duxr = dux * cosR + duz * sinR;
          const duyr = duy;
          const duzr = -dux * sinR + duz * cosR;

          const dvxr = dvx * cosR + dvz * sinR;
          const dvyr = dvy;
          const dvzr = -dvx * sinR + dvz * cosR;

          const nx = duyr * dvzr - duzr * dvyr;
          const ny = duzr * dvxr - duxr * dvzr;
          const nz = duxr * dvyr - duyr * dvxr;

          const front = nz > 0;
          const char = front
            ? gradient[gradIndex]
            : gradient[gradient.length - 1 - gradIndex];

          grid[sy][sx] = char;
        }
      }

      let html = '';
      for (let r = 0; r < rows; r++) {
        html += grid[r].join('') + '<br>';
      }
      el.innerHTML = html;

      animationFrameId = requestAnimationFrame(render);
    }

    render();

    return () => {
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
      el.innerHTML = '';
    };
  }, [containerWidth, containerHeight]);

  return (
    <div
      style={{
        width: `${containerWidth}px`,
        height: `${containerHeight}px`,
        background: '#F0EEE6',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'monospace',
        fontSize: `${fontSize}px`,
        lineHeight: '0.9',
        overflow: 'hidden',
        color: '#333',
      }}
    >
      <div ref={divRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default MobiusFlowTunnel;


// Themes: fluid calligraphy, invisible currents, poetic flow
// Visualisation: Pencil-soft ribbons drift through a handcrafted vector field, breathing like fluid ink
// Unique mechanism: Procedural curl-noise flow guided by drifting vortices with layered particle trails
// Differs from others by: Generative flow field blending curl noise with moving vortices for meditative fluid calligraphy

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const FluidDynamics: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const rafRef = useRef<number|undefined>();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    canvas.width = width;
    canvas.height = height;

    ctx.fillStyle = '#F0EEE6';
    ctx.fillRect(0, 0, width, height);

    let seed = 1357901;
    const rnd = () => {
      seed = (seed * 16807) % 2147483647;
      return (seed - 1) / 2147483646;
    };

    const particleCount = Math.floor((width * height) / 9000);
    const particles = Array.from({ length: particleCount }, () => {
      const x = rnd() * width;
      const y = rnd() * height;
      return {
        x,
        y,
        px: x,
        py: y,
        vx: 0,
        vy: 0,
        life: rnd() * 180,
        speedMod: 0.6 + rnd() * 0.6,
        shade: 0.32 + rnd() * 0.25
      };
    });

    type Vortex = { baseX: number; baseY: number; radius: number; strength: number; phase: number };
    const vortices: Vortex[] = Array.from({ length: 4 }, (_, i) => ({
      baseX: width * (0.2 + 0.18 * i),
      baseY: height * (0.25 + 0.18 * i),
      radius: Math.min(width, height) * (0.18 + 0.04 * rnd()),
      strength: 0.45 + 0.25 * rnd(),
      phase: rnd() * Math.PI * 2
    }));

    const wrap = (p: { x: number; y: number; px: number; py: number }) => {
      let wrapped = false;
      if (p.x < -10) { p.x = width + (p.x % width); wrapped = true; }
      if (p.x > width + 10) { p.x = p.x % width; wrapped = true; }
      if (p.y < -10) { p.y = height + (p.y % height); wrapped = true; }
      if (p.y > height + 10) { p.y = p.y % height; wrapped = true; }
      if (wrapped) {
        p.px = p.x;
        p.py = p.y;
      }
    };

    const flowField = (x: number, y: number, t: number) => {
      const nx = x / width - 0.5;
      const ny = y / height - 0.5;
      const time = t * 0.12;

      let angle = Math.sin((nx * 3.1 + ny * 2.7) + time * 0.7);
      angle += Math.cos((ny * 4.2 - nx * 3.4) - time * 0.5) * 0.7;
      angle += Math.sin((nx + ny) * 5.0 + time * 0.9) * 0.35;

      let vx = Math.cos(angle) * 18;
      let vy = Math.sin(angle) * 18;

      vortices.forEach((vortex, idx) => {
        const drift = 0.08;
        const vxOffset = Math.sin(time * 0.4 + vortex.phase + idx) * vortex.radius * 0.12;
        const vyOffset = Math.cos(time * 0.32 + vortex.phase * 1.3) * vortex.radius * 0.12;
        const cx = vortex.baseX + vxOffset;
        const cy = vortex.baseY + vyOffset;
        const dx = x - cx;
        const dy = y - cy;
        const distSq = dx * dx + dy * dy + 0.0001;
        const influence = Math.exp(-distSq / (vortex.radius * vortex.radius)) * vortex.strength;
        vx += (-dy * influence * drift);
        vy += (dx * influence * drift);
        const breathing = Math.sin(time * 0.6 + vortex.phase) * 0.4;
        vx += dx * influence * 0.02 * breathing;
        vy += dy * influence * 0.02 * breathing;
      });

      return { vx, vy };
    };

    const contourField = (x: number, y: number, t: number) => {
      const nx = x / width;
      const ny = y / height;
      return Math.sin(nx * 3.5 + t * 0.1) + Math.cos(ny * 4.1 - t * 0.08);
    };

    const drawContours = (t: number) => {
      const layers = 6;
      ctx.strokeStyle = 'rgba(25,25,28,0.08)';
      ctx.lineWidth = 0.8;
      for (let l = 0; l < layers; l++) {
        const iso = -1 + (l / (layers - 1)) * 2;
        ctx.beginPath();
        let started = false;
        const step = Math.max(18, Math.min(width, height) / 60);
        for (let y = step * 0.5; y < height; y += step) {
          for (let x = step * 0.5; x < width; x += step) {
            const value = contourField(x, y, t);
            if (Math.abs(value - iso) < 0.08) {
              if (!started) {
                ctx.moveTo(x, y);
                started = true;
              } else {
                ctx.lineTo(x, y);
              }
            }
          }
        }
        ctx.stroke();
      }
    };

    const render = (timeMs: number) => {
      const t = timeMs * 0.001;
      ctx.fillStyle = 'rgba(240,238,230,0.018)';
      ctx.fillRect(0, 0, width, height);

      drawContours(t);

      ctx.lineWidth = 0.9;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      particles.forEach((p, idx) => {
        const flow = flowField(p.x, p.y, t + idx * 0.02);
        const speed = p.speedMod * (0.45 + 0.2 * Math.sin(t * 0.7 + idx * 0.13));
        const viscosity = 0.18;
        const targetVx = flow.vx * speed * 0.012;
        const targetVy = flow.vy * speed * 0.012;
        p.vx = p.vx * (1 - viscosity) + targetVx * viscosity;
        p.vy = p.vy * (1 - viscosity) + targetVy * viscosity;

        const nx = p.x + p.vx;
        const ny = p.y + p.vy;

        ctx.strokeStyle = `rgba(25,25,28,${0.32 + p.shade * Math.abs(Math.sin(t * 0.6 + idx))})`;
        ctx.beginPath();
        ctx.moveTo(p.px, p.py);
        ctx.lineTo(nx, ny);
        ctx.stroke();

        p.px = p.x;
        p.py = p.y;
        p.x = nx;
        p.y = ny;
        p.life -= 1;

        wrap(p);

        if (p.life <= 0) {
          const rx = rnd() * width;
          const ry = rnd() * height;
          p.x = rx;
          p.y = ry;
          p.px = rx;
          p.py = ry;
          p.vx = 0;
          p.vy = 0;
          p.life = 180 + rnd() * 120;
          p.speedMod = 0.6 + rnd() * 0.6;
          p.shade = 0.3 + rnd() * 0.3;
        }
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

const metadata = {
  themes: "fluid calligraphy, invisible currents, poetic flow",
  visualisation: "Pencil-soft ribbons drift through a handcrafted vector field, breathing like fluid ink",
  promptSuggestion: "1. Layer multiple vortices\n2. Modulate flow with slow breathing\n3. Let trails wrap softly"
};
(FluidDynamics as any).metadata = metadata;

export default FluidDynamics;

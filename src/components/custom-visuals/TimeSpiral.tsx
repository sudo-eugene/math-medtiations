import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

type TimeNode = {
  radius: number;
  angle: number;
  driftSpeed: number;
  size: number;
  intensity: number;
  polarity: number; // -1 past, 1 future
  phase: number;
};

type SpiralBand = {
  radius: number;
  width: number;
  rotation: number;
  speed: number;
  polarity: number;
};

const smoothStep = (t: number) => t * t * (3 - 2 * t);

const createRng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const TimeSpiral: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.min(width, height) * 0.48;
    const rng = createRng(Math.floor(width * 13 + height * 29));

    const nodes: TimeNode[] = [];
    const bands: SpiralBand[] = [];

    const nodeCount = 90;
    for (let i = 0; i < nodeCount; i++) {
      const polarity = i % 2 === 0 ? -1 : 1;
      nodes.push({
        radius: (0.12 + rng() * 0.88) * maxRadius,
        angle: rng() * Math.PI * 2,
        driftSpeed: (rng() - 0.5) * 0.45 * polarity,
        size: 2 + rng() * 4,
        intensity: 0.35 + rng() * 0.45,
        polarity,
        phase: rng() * Math.PI * 2,
      });
    }

    for (let i = 0; i < 6; i++) {
      const polarity = i < 3 ? -1 : 1;
      bands.push({
        radius: (0.2 + i * 0.1) * maxRadius,
        width: 18 + rng() * 12,
        rotation: rng() * Math.PI * 2,
        speed: (polarity === -1 ? -1 : 1) * (0.1 + rng() * 0.2),
        polarity,
      });
    }

    let lastTime = performance.now();
    let accum = 0;

    const drawBackground = () => {
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, maxRadius * 1.2);
      gradient.addColorStop(0, 'rgba(25, 25, 25, 0.22)');
      gradient.addColorStop(1, 'rgba(25, 25, 25, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, maxRadius * 1.2, 0, Math.PI * 2);
      ctx.fill();
    };

    const drawBands = (elapsed: number) => {
      bands.forEach(band => {
        band.rotation += band.speed * elapsed;
        ctx.strokeStyle = `rgba(30, 30, 30, ${0.12 + (band.polarity === -1 ? 0.05 : 0)})`;
        ctx.lineWidth = 1.2;
        ctx.setLineDash([6, 14]);
        ctx.beginPath();
        const turns = band.polarity === -1 ? 2.5 : 2;
        for (let a = 0; a <= Math.PI * turns; a += Math.PI / 90) {
          const radius = band.radius + a * (band.polarity * 4);
          const x = centerX + Math.cos(a + band.rotation) * radius;
          const y = centerY + Math.sin(a + band.rotation) * radius;
          if (a === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        const fade = band.polarity === -1 ? 0.18 : 0.1;
        const sweepGradient = ctx.createRadialGradient(centerX, centerY, band.radius * 0.6, centerX, centerY, band.radius + band.width);
        sweepGradient.addColorStop(0, 'rgba(30,30,30,0)');
        sweepGradient.addColorStop(1, `rgba(30,30,30,${fade})`);
        ctx.fillStyle = sweepGradient;
        ctx.beginPath();
        ctx.arc(centerX, centerY, band.radius + band.width, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const updateNodes = (elapsed: number) => {
      nodes.forEach(node => {
        node.angle += node.driftSpeed * elapsed;
        node.phase += elapsed * 1.4;
        const spiralDrift = node.polarity * elapsed * 22;
        node.radius = (node.radius + spiralDrift + maxRadius) % maxRadius;
      });
    };

    const drawNodes = () => {
      nodes.forEach(node => {
        const ease = smoothStep((Math.sin(node.phase) + 1) / 2);
        const alpha = node.intensity * (0.3 + ease * 0.7);
        const radius = node.radius * (0.85 + ease * 0.15);
        const x = centerX + Math.cos(node.angle) * radius;
        const y = centerY + Math.sin(node.angle) * radius;

        const glow = ctx.createRadialGradient(x, y, 0, x, y, node.size * 4.5);
        glow.addColorStop(0, `rgba(20, 20, 20, ${alpha * 0.9})`);
        glow.addColorStop(1, 'rgba(20, 20, 20, 0)');
        ctx.fillStyle = glow;
        ctx.beginPath();
        ctx.arc(x, y, node.size * 4.5, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = `rgba(20, 20, 20, ${alpha})`;
        ctx.beginPath();
        ctx.arc(x, y, node.size * 0.8, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const drawNow = (elapsed: number) => {
      accum += elapsed;
      const pulse = smoothStep((Math.sin(accum * 0.8) + 1) / 2);
      const radius = 10 + pulse * 8;

      const halo = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, radius * 3);
      halo.addColorStop(0, `rgba(25, 25, 25, ${0.35 + pulse * 0.2})`);
      halo.addColorStop(1, 'rgba(25, 25, 25, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius * 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = 'rgba(20, 20, 20, 0.55)';
      ctx.lineWidth = 1.4;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.stroke();

      ctx.fillStyle = 'rgba(20, 20, 20, 0.75)';
      ctx.beginPath();
      ctx.arc(centerX, centerY, 3.5 + pulse * 1.5, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = (timestamp: number) => {
      const delta = (timestamp - lastTime) / 1000;
      lastTime = timestamp;

      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      drawBackground();
      drawBands(delta);
      updateNodes(delta);
      drawNodes();
      drawNow(delta);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [width, height]);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F0EEE6',
        overflow: 'hidden',
        borderRadius: '8px',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default TimeSpiral;

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

type WeaveThread = {
  offset: number;
  speed: number;
  amplitude: number;
  phase: number;
  weight: number;
};

type LoomLayer = {
  threads: WeaveThread[];
  orientation: 'horizontal' | 'vertical';
  density: number;
  drift: number;
};

const createRng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const EtherealLoom: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationRef = useRef<number | null>(null);
  const isWhiteSnapshot = (() => {
    if (typeof window === 'undefined') {
      return false;
    }
    const params = new URLSearchParams(window.location.search);
    return window.location.pathname.includes('/snapshot') && params.get('bg') === 'white';
  })();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const rng = createRng(Math.floor(width * 19 + height * 37));
    const layers: LoomLayer[] = [];

    const layerCount = 3;
    for (let i = 0; i < layerCount; i++) {
      const orientation = i % 2 === 0 ? 'horizontal' : 'vertical';
      const threadCount = 12 + Math.floor(rng() * 6);
      const threads: WeaveThread[] = [];
      for (let t = 0; t < threadCount; t++) {
        threads.push({
          offset: rng(),
          speed: (rng() - 0.5) * 0.18,
          amplitude: 8 + rng() * 20,
          phase: rng() * Math.PI * 2,
          weight: 0.8 + rng() * 0.7,
        });
      }
      layers.push({
        threads,
        orientation,
        density: 10 + rng() * 12,
        drift: (rng() - 0.5) * 0.25,
      });
    }

    let last = performance.now();

    const drawBackground = () => {
      if (isWhiteSnapshot) {
        return;
      }
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(25, 25, 25, 0.08)');
      gradient.addColorStop(1, 'rgba(25, 25, 25, 0)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const drawLayer = (layer: LoomLayer, delta: number, layerIndex: number) => {
      const baseAlpha = 0.16 + layerIndex * 0.05;
      const thickness = 1.2 - layerIndex * 0.2;
      ctx.lineWidth = thickness;
      ctx.strokeStyle = `rgba(25, 25, 25, ${baseAlpha})`;

      const spacing = layer.density;
      const count = layer.orientation === 'horizontal' ? Math.ceil(height / spacing) + 2 : Math.ceil(width / spacing) + 2;

      layer.threads.forEach(thread => {
        thread.phase += thread.speed * delta * 2;
      });

      for (let i = -1; i < count; i++) {
        const base = i * spacing;
        ctx.beginPath();
        for (let j = -1; j <= (layer.orientation === 'horizontal' ? width : height) + spacing; j += spacing / 4) {
          const influence = layer.threads.reduce((acc, thread) => {
            const wave = Math.sin(thread.phase + j * 0.02) * thread.amplitude * thread.weight;
            return acc + wave;
          }, 0);
          const offset = influence / layer.threads.length + Math.sin((j + base) * 0.015) * 6;
          if (layer.orientation === 'horizontal') {
            const y = base + layer.drift * j + offset;
            const x = j;
            if (j === -1 * spacing) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          } else {
            const x = base + layer.drift * j + offset;
            const y = j;
            if (j === -1 * spacing) ctx.moveTo(x, y);
            else ctx.lineTo(x, y);
          }
        }
        ctx.stroke();
      }
    };

    const drawNodes = (delta: number) => {
      const nodeSpacing = 60;
      for (let x = nodeSpacing / 2; x < width; x += nodeSpacing) {
        for (let y = nodeSpacing / 2; y < height; y += nodeSpacing) {
          const phase = Math.sin((x + y) * 0.01 + last * 0.0005);
          const size = 2 + phase * 2;
          ctx.fillStyle = `rgba(25, 25, 25, ${0.2 + phase * 0.1})`;
          ctx.beginPath();
          ctx.arc(x, y, size, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    };

    const animate = (timestamp: number) => {
      const delta = Math.min(0.05, (timestamp - last) / 1000);
      last = timestamp;

      ctx.fillStyle = isWhiteSnapshot ? '#ffffff' : '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      drawBackground();
      layers.forEach((layer, index) => drawLayer(layer, delta, index));
      drawNodes(delta);

      animationRef.current = requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationRef.current !== null) {
        cancelAnimationFrame(animationRef.current);
        animationRef.current = null;
      }
    };
  }, [width, height, isWhiteSnapshot]);

  return (
    <div
      style={{
        width: `${width}px`,
        height: `${height}px`,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: isWhiteSnapshot ? '#ffffff' : '#F0EEE6',
        overflow: 'hidden',
        borderRadius: '8px',
      }}
    >
      <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />
    </div>
  );
};

export default EtherealLoom;

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

type ResonantShard = {
  x: number;
  y: number;
  radius: number;
  rotation: number;
  rotationSpeed: number;
  pulsePhase: number;
  pulseSpeed: number;
  facets: number;
  shimmer: number;
};

type RingWave = {
  originX: number;
  originY: number;
  radius: number;
  maxRadius: number;
  speed: number;
  life: number;
  phase: number;
};

const createRng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const smoothStep = (t: number) => t * t * (3 - 2 * t);

const CrystalSong: React.FC<VisualProps> = ({ width, height }) => {
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
    const fieldRadius = Math.min(width, height) * 0.45;
    const rng = createRng(Math.floor(width * 111 + height * 53));

    const shards: ResonantShard[] = [];
    const waves: RingWave[] = [];

    const shardCount = 6;
    for (let i = 0; i < shardCount; i++) {
      const angle = (i / shardCount) * Math.PI * 2;
      const distance = fieldRadius * (0.35 + rng() * 0.2);
      shards.push({
        x: centerX + Math.cos(angle) * distance,
        y: centerY + Math.sin(angle) * distance,
        radius: 24 + rng() * 16,
        rotation: rng() * Math.PI * 2,
        rotationSpeed: (rng() - 0.5) * 0.28,
        pulsePhase: rng() * Math.PI * 2,
        pulseSpeed: 0.4 + rng() * 0.3,
        facets: 6 + Math.floor(rng() * 6),
        shimmer: 0.4 + rng() * 0.4,
      });
    }

    const emitWave = (shard: ResonantShard) => {
      waves.push({
        originX: shard.x,
        originY: shard.y,
        radius: shard.radius * 0.2,
        maxRadius: fieldRadius * 1.1,
        speed: 20 + Math.abs(shard.rotationSpeed) * 220,
        life: 1,
        phase: shard.pulsePhase,
      });
    };

    let lastTime = performance.now();

    const update = (delta: number) => {
      shards.forEach(shard => {
        shard.rotation += shard.rotationSpeed * delta;
        shard.pulsePhase += shard.pulseSpeed * delta;
        const resonance = smoothStep((Math.sin(shard.pulsePhase) + 1) / 2);
        if (resonance > 0.94 && rng() > 0.6) {
          emitWave(shard);
        }
      });

      waves.forEach(wave => {
        wave.radius += wave.speed * delta;
        wave.life = Math.max(0, 1 - wave.radius / wave.maxRadius);
        wave.phase += 1.4 * delta;
      });

      for (let i = waves.length - 1; i >= 0; i--) {
        if (waves[i].life <= 0) waves.splice(i, 1);
      }
    };

    const drawBackground = () => {
      ctx.save();
      const gradient = ctx.createRadialGradient(centerX, centerY, 0, centerX, centerY, fieldRadius * 1.1);
      gradient.addColorStop(0, 'rgba(30, 30, 30, 0.2)');
      gradient.addColorStop(1, 'rgba(30, 30, 30, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(centerX, centerY, fieldRadius * 1.1, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    };

    const drawWave = (wave: RingWave) => {
      const alpha = 0.26 * wave.life;
      ctx.strokeStyle = `rgba(25, 25, 25, ${alpha})`;
      ctx.lineWidth = 1;
      ctx.setLineDash([6, 14]);
      ctx.beginPath();
      ctx.arc(wave.originX, wave.originY, wave.radius, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = `rgba(25, 25, 25, ${alpha * 0.6})`;
      ctx.lineWidth = 0.6;
      const subRings = 3;
      for (let i = 1; i <= subRings; i++) {
        const subRadius = wave.radius * (i / subRings);
        ctx.beginPath();
        ctx.arc(wave.originX, wave.originY, subRadius, 0, Math.PI * 2);
        ctx.stroke();
      }
    };

    const drawShard = (shard: ResonantShard) => {
      const resonance = smoothStep((Math.sin(shard.pulsePhase) + 1) / 2);
      const radius = shard.radius * (0.75 + resonance * 0.35);
      const alpha = shard.shimmer * (0.35 + resonance * 0.6);

      ctx.save();
      ctx.translate(shard.x, shard.y);
      ctx.rotate(shard.rotation);

      const halo = ctx.createRadialGradient(0, 0, 0, 0, 0, radius * 2.4);
      halo.addColorStop(0, `rgba(30, 30, 30, ${alpha * 0.8})`);
      halo.addColorStop(1, 'rgba(30, 30, 30, 0)');
      ctx.fillStyle = halo;
      ctx.beginPath();
      ctx.arc(0, 0, radius * 2.4, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      for (let i = 0; i <= shard.facets; i++) {
        const angle = (i / shard.facets) * Math.PI * 2;
        const variation = 0.85 + Math.sin(shard.pulsePhase + angle * 3) * 0.08;
        const x = Math.cos(angle) * radius * variation;
        const y = Math.sin(angle) * radius * variation;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();

      ctx.strokeStyle = `rgba(30, 30, 30, ${alpha})`;
      ctx.lineWidth = 1.2;
      ctx.stroke();

      ctx.fillStyle = `rgba(30, 30, 30, ${alpha * 0.45})`;
      ctx.fill();

      const spokes = 6;
      ctx.strokeStyle = `rgba(25, 25, 25, ${alpha * 0.6})`;
      ctx.lineWidth = 0.7;
      for (let i = 0; i < spokes; i++) {
        const angle = (i / spokes) * Math.PI * 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(x, y);
        ctx.stroke();
      }

      ctx.restore();
    };

    const drawInterference = () => {
      const cellSize = 36;
      for (let x = cellSize / 2; x < width; x += cellSize) {
        for (let y = cellSize / 2; y < height; y += cellSize) {
          let intensity = 0;
          shards.forEach(shard => {
            const dx = x - shard.x;
            const dy = y - shard.y;
            const distance = Math.sqrt(dx * dx + dy * dy);
            intensity += shard.shimmer * Math.max(0, 1 - distance / (fieldRadius * 0.8));
          });
          const alpha = Math.min(0.25, intensity * 0.18);
          if (alpha > 0.04) {
            ctx.strokeStyle = `rgba(30, 30, 30, ${alpha})`;
            ctx.lineWidth = 0.4;
            ctx.beginPath();
            ctx.arc(x, y, 4 + intensity * 4, 0, Math.PI * 2);
            ctx.stroke();
          }
        }
      }
    };

    const animate = (timestamp: number) => {
      const delta = Math.min(0.05, (timestamp - lastTime) / 1000);
      lastTime = timestamp;

      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      drawBackground();
      drawInterference();
      update(delta);
      waves.forEach(drawWave);
      shards.forEach(drawShard);

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

export default CrystalSong;

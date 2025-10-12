import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

type VoidShapeType = 'circle' | 'polygon';

type FlowerPetal = {
  angleOffset: number;
  length: number;
  width: number;
  curl: number;
};

type FlowerNode = {
  x: number;
  y: number;
  voidRadius: number;
  petals: FlowerPetal[];
  bloomPhase: number;
  bloomSpeed: number;
  swayPhase: number;
  swaySpeed: number;
  stemHeight: number;
  stemPhase: number;
};

type VoidBubble = {
  x: number;
  y: number;
  radius: number;
  pulsePhase: number;
  pulseSpeed: number;
  rotation: number;
  rotationSpeed: number;
  shape: VoidShapeType;
  sides: number;
};

type SeededRng = () => number;

const smoothStep = (t: number) => t * t * (3 - 2 * t);

const createSeededRng = (seed: number): SeededRng => {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

const VoidGarden: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createSeededRng(Math.floor(width * 73 + height * 41));
    const fieldRadius = Math.min(width, height) * 0.45;

    const flowers: FlowerNode[] = [];
    const voids: VoidBubble[] = [];

    const init = () => {
      flowers.length = 0;
      voids.length = 0;

      const voidCount = 8 + Math.floor(rng() * 5);
      for (let i = 0; i < voidCount; i++) {
        const radius = 14 + rng() * 24;
        const angle = rng() * Math.PI * 2;
        const distance = (0.25 + rng() * 0.6) * fieldRadius;
        const shape = rng() > 0.4 ? 'circle' : 'polygon';
        voids.push({
          x: width / 2 + Math.cos(angle) * distance,
          y: height / 2 + Math.sin(angle) * distance,
          radius,
          pulsePhase: rng() * Math.PI * 2,
          pulseSpeed: 0.35 + rng() * 0.35,
          rotation: rng() * Math.PI * 2,
          rotationSpeed: (rng() - 0.5) * 0.25,
          shape,
          sides: 4 + Math.floor(rng() * 4),
        });
      }

      const flowerCount = 6 + Math.floor(rng() * 4);
      for (let i = 0; i < flowerCount; i++) {
        const radius = 12 + rng() * 18;
        const angle = rng() * Math.PI * 2;
        const distance = (0.15 + rng() * 0.7) * fieldRadius;
        const x = width / 2 + Math.cos(angle) * distance;
        const y = height / 2 + Math.sin(angle) * distance;

        const petals: FlowerPetal[] = [];
        const petalCount = 6 + Math.floor(rng() * 5);
        for (let p = 0; p < petalCount; p++) {
          petals.push({
            angleOffset: (p / petalCount) * Math.PI * 2,
            length: radius * (1.2 + rng() * 0.8),
            width: radius * (0.4 + rng() * 0.3),
            curl: (rng() - 0.5) * 0.8,
          });
        }

        flowers.push({
          x,
          y,
          voidRadius: radius,
          petals,
          bloomPhase: rng() * 0.4,
          bloomSpeed: 0.25 + rng() * 0.2,
          swayPhase: rng() * Math.PI * 2,
          swaySpeed: 0.5 + rng() * 0.4,
          stemHeight: 20 + rng() * 40,
          stemPhase: rng() * Math.PI * 2,
        });
      }
    };

    const drawBackground = () => {
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        fieldRadius * 1.15
      );
      gradient.addColorStop(0, 'rgba(25, 25, 25, 0.18)');
      gradient.addColorStop(1, 'rgba(25, 25, 25, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, fieldRadius * 1.15, 0, Math.PI * 2);
      ctx.fill();
    };

    const updateVoid = (voidBubble: VoidBubble, delta: number) => {
      voidBubble.pulsePhase += voidBubble.pulseSpeed * delta;
      voidBubble.rotation += voidBubble.rotationSpeed * delta;
    };

    const drawVoid = (voidBubble: VoidBubble) => {
      const { x, y, radius, pulsePhase, shape, sides } = voidBubble;
      const pulse = 0.85 + 0.15 * Math.sin(pulsePhase);
      const effectiveRadius = radius * pulse;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(voidBubble.rotation);

      ctx.strokeStyle = 'rgba(35, 35, 35, 0.35)';
      ctx.lineWidth = 0.6;
      ctx.setLineDash([3, 7]);
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(0, effectiveRadius * 1.15);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = 'rgba(30, 30, 30, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      if (shape === 'circle') {
        ctx.arc(0, 0, effectiveRadius, 0, Math.PI * 2);
      } else {
        for (let i = 0; i <= sides; i++) {
          const angle = (i / sides) * Math.PI * 2;
          const vx = Math.cos(angle) * effectiveRadius;
          const vy = Math.sin(angle) * effectiveRadius;
          if (i === 0) ctx.moveTo(vx, vy);
          else ctx.lineTo(vx, vy);
        }
      }
      ctx.stroke();

      ctx.fillStyle = 'rgba(25, 25, 25, 0.12)';
      ctx.beginPath();
      ctx.arc(0, 0, Math.max(1.5, effectiveRadius * 0.16), 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    };

    const updateFlower = (flower: FlowerNode, delta: number) => {
      flower.bloomPhase += flower.bloomSpeed * delta;
      if (flower.bloomPhase > 1) {
        flower.bloomPhase = 1;
        flower.bloomSpeed *= -1;
      }
      if (flower.bloomPhase < 0.2) {
        flower.bloomPhase = 0.2;
        flower.bloomSpeed *= -1;
      }
      flower.swayPhase += flower.swaySpeed * delta;
      flower.stemPhase += 0.75 * delta;
    };

    const drawFlower = (flower: FlowerNode) => {
      const { x, y, voidRadius, petals, bloomPhase, swayPhase, stemHeight, stemPhase } = flower;
      const smoothBloom = smoothStep(bloomPhase);
      const sway = Math.sin(swayPhase) * 5;

      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(Math.sin(stemPhase) * 0.08);

      ctx.strokeStyle = 'rgba(35, 35, 35, 0.45)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(sway * 0.2, 0);
      ctx.quadraticCurveTo(sway * 0.6, stemHeight * 0.5, sway, stemHeight);
      ctx.stroke();

      ctx.translate(sway, 0);

      ctx.strokeStyle = 'rgba(20, 20, 20, 0.48)';
      ctx.lineWidth = 1.4;
      ctx.setLineDash([3, 6]);
      ctx.beginPath();
      ctx.arc(0, 0, voidRadius * (0.75 + smoothBloom * 0.25), 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);

      petals.forEach(petal => {
        const angle = petal.angleOffset + sway * 0.01;
        const length = petal.length * (0.6 + smoothBloom * 0.5);
        const width = petal.width * (0.6 + smoothBloom * 0.35);
        const curl = petal.curl;

        const tipX = Math.cos(angle) * length;
        const tipY = Math.sin(angle) * length;
        const baseX = Math.cos(angle) * voidRadius * (0.8 + smoothBloom * 0.2);
        const baseY = Math.sin(angle) * voidRadius * (0.8 + smoothBloom * 0.2);

        const controlLeftX = baseX + Math.cos(angle - 0.6 + curl) * width;
        const controlLeftY = baseY + Math.sin(angle - 0.6 + curl) * width;
        const controlRightX = baseX + Math.cos(angle + 0.6 - curl) * width;
        const controlRightY = baseY + Math.sin(angle + 0.6 - curl) * width;

        ctx.strokeStyle = 'rgba(25, 25, 25, 0.45)';
        ctx.lineWidth = 0.9;
        ctx.beginPath();
        ctx.moveTo(baseX, baseY);
        ctx.bezierCurveTo(controlLeftX, controlLeftY, tipX, tipY, controlRightX, controlRightY);
        ctx.stroke();

        const textures = 3;
        ctx.strokeStyle = 'rgba(25, 25, 25, 0.3)';
        ctx.lineWidth = 0.4;
        for (let i = 1; i <= textures; i++) {
          const t = i / (textures + 1);
          ctx.beginPath();
          ctx.moveTo(baseX, baseY);
          const midX = controlLeftX + (tipX - controlLeftX) * t;
          const midY = controlLeftY + (tipY - controlLeftY) * t;
          ctx.lineTo(midX, midY);
          ctx.stroke();
        }
      });

      ctx.restore();
    };

    let lastTimestamp = performance.now();

    const animate = (timestamp: number) => {
      const delta = Math.min(0.05, (timestamp - lastTimestamp) / 1000);
      lastTimestamp = timestamp;

      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      drawBackground();

      voids.forEach(voidBubble => {
        updateVoid(voidBubble, delta);
        drawVoid(voidBubble);
      });

      flowers.forEach(flower => {
        updateFlower(flower, delta);
        drawFlower(flower);
      });

      animationRef.current = requestAnimationFrame(animate);
    };

    init();
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

export default VoidGarden;

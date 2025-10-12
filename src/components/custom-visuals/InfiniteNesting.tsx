import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

type ShapeType = 'square' | 'triangle' | 'hexagon' | 'circle';

interface NestNode {
  depth: number;
  size: number;
  shape: ShapeType;
  rotationSpeed: number;
  orbitRadius: number;
  orbitOffset: number;
  wobblePhase: number;
  pulsePhase: number;
  children: NestNode[];
}

interface RootNode {
  node: NestNode;
  anchorRadius: number;
  anchorAngle: number;
  anchorRotationSpeed: number;
  anchorPhase: number;
}

const SHAPES: ShapeType[] = ['square', 'triangle', 'hexagon', 'circle'];

const smoothStep = (t: number) => t * t * (3 - 2 * t);

function createRng(seed: number) {
  return function rng() {
    seed |= 0;
    seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function createNode(
  depth: number,
  maxDepth: number,
  size: number,
  parentSize: number,
  rng: () => number
): NestNode {
  const shape = SHAPES[(depth + Math.floor(rng() * SHAPES.length)) % SHAPES.length];
  const rotationSpeed = (rng() - 0.5) * (0.45 / (depth + 1));
  const orbitRadius = depth === 0 ? 0 : parentSize * (0.68 + rng() * 0.25);
  const node: NestNode = {
    depth,
    size,
    shape,
    rotationSpeed,
    orbitRadius,
    orbitOffset: rng() * Math.PI * 2,
    wobblePhase: rng() * Math.PI * 2,
    pulsePhase: rng() * Math.PI * 2,
    children: [],
  };

  if (depth < maxDepth) {
    const childCount = depth === 0 ? 4 : 3;
    const childSize = size * (0.6 + rng() * 0.1);
    for (let i = 0; i < childCount; i++) {
      node.children.push(createNode(depth + 1, maxDepth, childSize, size, rng));
    }
  }

  return node;
}

function traceShapePath(ctx: CanvasRenderingContext2D, shape: ShapeType, size: number) {
  const half = size / 2;
  ctx.beginPath();
  switch (shape) {
    case 'square': {
      ctx.moveTo(-half, -half);
      ctx.lineTo(half, -half);
      ctx.lineTo(half, half);
      ctx.lineTo(-half, half);
      ctx.closePath();
      break;
    }
    case 'triangle': {
      const h = half * Math.sqrt(3);
      ctx.moveTo(0, -h);
      ctx.lineTo(-half, h);
      ctx.lineTo(half, h);
      ctx.closePath();
      break;
    }
    case 'hexagon': {
      for (let i = 0; i <= 6; i++) {
        const angle = (i / 6) * Math.PI * 2;
        const x = Math.cos(angle) * half;
        const y = Math.sin(angle) * half;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.closePath();
      break;
    }
    case 'circle':
    default: {
      ctx.arc(0, 0, half, 0, Math.PI * 2);
      ctx.closePath();
      break;
    }
  }
}

const InfiniteNesting: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(Math.floor(width * 31 + height * 97));
    const maxDepth = 4;
    const fieldRadius = Math.min(width, height) * 0.45;
    const baseSize = Math.min(width, height) * 0.28;

    const rootNodes: RootNode[] = [];

    const primaryNode = createNode(0, maxDepth, baseSize, baseSize, rng);
    rootNodes.push({
      node: primaryNode,
      anchorRadius: 0,
      anchorAngle: 0,
      anchorRotationSpeed: 0,
      anchorPhase: 0,
    });

    const orbitingRoots = 2;
    for (let i = 0; i < orbitingRoots; i++) {
      const size = baseSize * (0.85 + rng() * 0.2);
      rootNodes.push({
        node: createNode(0, maxDepth, size, size, rng),
        anchorRadius: fieldRadius * (0.35 + rng() * 0.2),
        anchorAngle: (i / orbitingRoots) * Math.PI * 2 + rng() * 0.3,
        anchorRotationSpeed: (rng() - 0.5) * 0.18,
        anchorPhase: rng() * Math.PI * 2,
      });
    }

    let time = 0;
    let lastTimestamp = performance.now();

    const renderNode = (node: NestNode, depthWeight: number) => {
      ctx.save();

      const rotation = node.orbitOffset + time * node.rotationSpeed;
      ctx.rotate(rotation);

      const orbitPulse = node.depth === 0 ? 0 : node.orbitRadius * (0.9 + 0.1 * Math.sin(time * 0.9 + node.wobblePhase));
      if (node.depth !== 0) {
        ctx.strokeStyle = `rgba(25, 25, 25, ${0.14 + depthWeight * 0.1})`;
        ctx.lineWidth = 0.35;
        ctx.setLineDash([1.5, 3.5]);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(orbitPulse, 0);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      ctx.translate(orbitPulse, 0);
      ctx.rotate(Math.sin(time * 0.6 + node.wobblePhase) * 0.35);

      const pulse = 0.7 + 0.3 * smoothStep((Math.sin(time * 0.8 + node.pulsePhase) + 1) / 2);
      const size = node.size * pulse;

      const fillAlpha = 0.05 + depthWeight * 0.12;
      const strokeAlpha = 0.22 + depthWeight * 0.5;
      const strokeWidth = Math.max(0.35, size * 0.015);

      traceShapePath(ctx, node.shape, size);
      ctx.save();
      ctx.fillStyle = `rgba(25, 25, 25, ${fillAlpha})`;
      ctx.fill();
      ctx.restore();

      traceShapePath(ctx, node.shape, size);
      ctx.strokeStyle = `rgba(20, 20, 20, ${strokeAlpha})`;
      ctx.lineWidth = strokeWidth;
      ctx.stroke();

      node.children.forEach(child => renderNode(child, depthWeight * 0.82));

      ctx.restore();
    };

    const drawBackground = () => {
      const gradient = ctx.createRadialGradient(
        width / 2,
        height / 2,
        0,
        width / 2,
        height / 2,
        fieldRadius * 1.3
      );
      gradient.addColorStop(0, 'rgba(30, 30, 30, 0.18)');
      gradient.addColorStop(1, 'rgba(30, 30, 30, 0)');
      ctx.fillStyle = gradient;
      ctx.beginPath();
      ctx.arc(width / 2, height / 2, fieldRadius * 1.3, 0, Math.PI * 2);
      ctx.fill();
    };

    const animate = (timestamp: number) => {
      const delta = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      time += delta;

      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      drawBackground();

      ctx.save();
      ctx.translate(width / 2, height / 2);

      rootNodes.forEach(root => {
        ctx.save();
        if (root.anchorRadius > 0) {
          const anchorPulse = root.anchorRadius * (0.85 + 0.15 * Math.sin(time * 0.7 + root.anchorPhase));
          ctx.rotate(root.anchorAngle + time * root.anchorRotationSpeed);
          ctx.translate(anchorPulse, 0);
        }
        renderNode(root.node, 1);
        ctx.restore();
      });

      ctx.restore();

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

export default InfiniteNesting;

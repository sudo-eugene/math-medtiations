import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

type StrokePoint = { x: number; y: number; pressure: number };

type ScriptStroke = {
  points: StrokePoint[];
  progress: number;
  targetProgress: number;
  phase: number;
  fade: number;
  speed: number;
  dissolve: number;
};

const createRng = (seed: number) => () => {
  seed |= 0;
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t ^= t + Math.imul(t ^ (t >>> 7), 61 | t);
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

const FlowingScript: React.FC<VisualProps> = ({ width, height }) => {
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

    const rng = createRng(Math.floor(width * 51 + height * 73));
    const strokes: ScriptStroke[] = [];

    const strokeCount = 4 + Math.floor(rng() * 3);
    for (let i = 0; i < strokeCount; i++) {
      const points: StrokePoint[] = [];
      const centerX = width * (0.15 + rng() * 0.7);
      const centerY = height * (0.25 + rng() * 0.5);
      const length = 70 + rng() * 120;
      const segments = 120;
      const angle = (rng() - 0.5) * 0.7;
      let currentX = centerX;
      let currentY = centerY;

      for (let s = 0; s < segments; s++) {
        const t = s / (segments - 1);
        const pressure = 0.8 + Math.sin(t * Math.PI) * 0.4 + (rng() - 0.5) * 0.1;
        currentX += Math.cos(angle + Math.sin(t * Math.PI * 1.5) * 0.6) * (length / segments);
        currentY += Math.sin(angle + Math.cos(t * Math.PI * 1.2) * 0.4) * (length / segments);
        currentX += (rng() - 0.5) * 1.5;
        currentY += (rng() - 0.5) * 1.5;
        points.push({ x: currentX, y: currentY, pressure: Math.max(0.2, pressure) });
      }

      strokes.push({
        points,
        progress: 0,
        targetProgress: 1,
        phase: rng() * Math.PI * 2,
        fade: 0,
        speed: 0.35 + rng() * 0.2,
        dissolve: 0,
      });
    }

    let last = performance.now();

    const drawBackground = () => {
      if (isWhiteSnapshot) {
        return;
      }
      const gradient = ctx.createLinearGradient(0, 0, width, height);
      gradient.addColorStop(0, 'rgba(25, 25, 25, 0.12)');
      gradient.addColorStop(1, 'rgba(25, 25, 25, 0.02)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const update = (delta: number) => {
      strokes.forEach(stroke => {
        stroke.phase += delta;
        stroke.progress += (stroke.targetProgress - stroke.progress) * stroke.speed * delta * 2;
        if (stroke.progress > 0.98) {
          stroke.targetProgress = 0;
          stroke.speed = 0.15 + rng() * 0.1;
        }
        if (stroke.progress < 0.2 && stroke.targetProgress === 0) {
          stroke.targetProgress = 1;
          stroke.speed = 0.35 + rng() * 0.2;
        }
        if (stroke.progress > 0.6) {
          stroke.fade += delta * 0.3;
          stroke.dissolve = Math.min(1, stroke.dissolve + delta * 0.4);
        } else {
          stroke.fade = Math.max(0, stroke.fade - delta * 0.2);
          stroke.dissolve = Math.max(0, stroke.dissolve - delta * 0.3);
        }
      });
    };

    const drawStroke = (stroke: ScriptStroke) => {
      const visiblePoints = Math.max(2, Math.floor(stroke.points.length * stroke.progress));
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      ctx.strokeStyle = `rgba(20, 20, 20, ${0.55 - stroke.dissolve * 0.3})`;

      ctx.beginPath();
      const offset = Math.sin(stroke.phase) * 1.2;
      for (let i = 0; i < visiblePoints; i++) {
        const point = stroke.points[i];
        const pressure = point.pressure * (1 - stroke.dissolve * 0.6);
        const jitter = (Math.sin(stroke.phase + i * 0.15) * 0.6) * (1 - stroke.dissolve);
        const x = point.x + offset + jitter;
        const y = point.y + offset * 0.6 + jitter * 0.5;
        const widthFactor = 1.4 + pressure * 1.1;
        ctx.lineWidth = widthFactor;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      if (stroke.dissolve > 0.05) {
        ctx.fillStyle = `rgba(20, 20, 20, ${0.25 * stroke.dissolve})`;
        for (let i = 0; i < visiblePoints; i += 8) {
          const point = stroke.points[i];
          const scatter = stroke.dissolve * 12;
          const scatterX = point.x + (rng() - 0.5) * scatter;
          const scatterY = point.y + (rng() - 0.5) * scatter;
          ctx.beginPath();
          ctx.arc(scatterX, scatterY, 0.6, 0, Math.PI * 2);
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
      update(delta);
      strokes.forEach(drawStroke);

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

export default FlowingScript;

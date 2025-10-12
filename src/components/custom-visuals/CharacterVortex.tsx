import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: impermanence, dissolution, quiet center
// visualization: characters spiral inward, words returning to silence
interface CharacterVortexProps extends VisualProps {
  text?: string;
}

const CharacterVortex: React.FC<CharacterVortexProps> = ({ width, height, text = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const rafRef = useRef<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    const dpr = (window.devicePixelRatio || 1);
    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    const centerX = width / 2;
    const centerY = height / 2;
    const baseText = (text && text.trim().length) ? text : '·•○●|∞◦○';
    const chars = baseText.split('').filter(Boolean);
    let charIndex = 0;

    interface Particle {
      char: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      rotation: number;
      age: number;
    }

    const particles: Particle[] = [];
    const maxRadius = Math.min(width, height) * 0.55;

    const spawn = (p: Particle) => {
      const char = chars[charIndex % chars.length] || '';
      charIndex++;

      const angle = Math.random() * Math.PI * 2;
      const startRadius = maxRadius * (0.8 + Math.random() * 0.4);
      const nx = Math.cos(angle);
      const ny = Math.sin(angle);

      p.x = centerX + nx * startRadius + (Math.random() - 0.5) * 14;
      p.y = centerY + ny * startRadius + (Math.random() - 0.5) * 14;

      const inwardSpeed = -(1.6 + Math.random() * 0.6);
      const tangentialSpeed = (0.5 + Math.random()) * (Math.random() > 0.5 ? 1 : -1);
      p.vx = nx * inwardSpeed - ny * tangentialSpeed;
      p.vy = ny * inwardSpeed + nx * tangentialSpeed;
      p.alpha = 0.1;
      p.rotation = 0.012 + Math.random() * 0.02;
      p.char = char;
      p.age = 0;
    };

    for (let i = 0; i < Math.max(chars.length * 2, 60); i++) {
      const p: Particle = { char: '', x: 0, y: 0, vx: 0, vy: 0, alpha: 1, rotation: 0.02, age: 0 };
      spawn(p);
      particles.push(p);
    }

    ctx.font = '20px "IBM Plex Mono", "Fira Code", monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        const dx = centerX - p.x;
        const dy = centerY - p.y;
        const dist = Math.hypot(dx, dy) || 1;

        const attraction = Math.min(0.05, 0.0009 * dist * dist);
        p.vx += (dx / dist) * attraction;
        p.vy += (dy / dist) * attraction;

        const cos = Math.cos(p.rotation);
        const sin = Math.sin(p.rotation);
        const vx = p.vx * cos - p.vy * sin;
        const vy = p.vx * sin + p.vy * cos;
        p.vx = vx * 0.984;
        p.vy = vy * 0.984;

        p.x += p.vx;
        p.y += p.vy;
        p.age += 1;

        if (p.alpha < 0.9) {
          p.alpha += 0.02;
        }
        if (dist < maxRadius * 0.45) {
          p.alpha *= 0.985;
        }
        if (dist < maxRadius * 0.2) {
          p.alpha *= 0.96;
        }

        ctx.fillStyle = `rgba(45,45,45,${Math.min(1, Math.max(0.15, p.alpha))})`;
        ctx.fillText(p.char, p.x, p.y);

        if (
          dist < 14 ||
          p.alpha < 0.05 ||
          p.x < -20 || p.x > width + 20 ||
          p.y < -20 || p.y > height + 20 ||
          p.age > 1200
        ) {
          spawn(p);
        }
      });

      rafRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      if (rafRef.current !== null) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, [width, height, text]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6' }}
    />
  );
};

export default CharacterVortex;

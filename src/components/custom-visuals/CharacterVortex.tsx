import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// themes: impermanence, dissolution, quiet center
// visualization: characters spiral inward, words returning to silence
interface CharacterVortexProps extends VisualProps {
  text?: string;
}

const CharacterVortex: React.FC<CharacterVortexProps> = ({ width, height, text = '' }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

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
    const baseText = (text && text.trim().length) ? text : '·•○●·•○●|';
    const chars = baseText.split('').filter(c => c.trim().length);
    let charIndex = 0;

    interface Particle {
      char: string;
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      rotation: number;
    }

    const particles: Particle[] = [];

    function spawn(p: Particle) {
      // words returning to silence
      const char = chars[charIndex % chars.length] || '';
      charIndex++;

      const side = Math.floor(Math.random() * 4);
      if (side === 0) { p.x = Math.random() * width; p.y = 0; }
      else if (side === 1) { p.x = width; p.y = Math.random() * height; }
      else if (side === 2) { p.x = Math.random() * width; p.y = height; }
      else { p.x = 0; p.y = Math.random() * height; }

      const angle = Math.atan2(centerY - p.y, centerX - p.x);
      const speed = 2 + Math.random();
      p.vx = Math.cos(angle) * speed;
      p.vy = Math.sin(angle) * speed;
      p.alpha = 1;
      p.rotation = 0.1 + Math.random() * 0.05;
      p.char = char;
    }

    for (let i = 0; i < Math.max(chars.length, 20); i++) {
      const p: Particle = { char: '', x: 0, y: 0, vx: 0, vy: 0, alpha: 1, rotation: 0.1 };
      spawn(p);
      particles.push(p);
    }

    let raf: number;

    function animate() {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      particles.forEach(p => {
        const angleToCenter = Math.atan2(centerY - p.y, centerX - p.x);
        p.vx += Math.cos(angleToCenter) * 0.05;
        p.vy += Math.sin(angleToCenter) * 0.05;

        const cos = Math.cos(p.rotation);
        const sin = Math.sin(p.rotation);
        const vx = p.vx * cos - p.vy * sin;
        const vy = p.vx * sin + p.vy * cos;
        p.vx = vx;
        p.vy = vy;

        p.x += p.vx;
        p.y += p.vy;
        p.alpha *= 0.985;

        ctx.fillStyle = `rgba(50,50,50,${Math.max(0.25, p.alpha)})`;
        ctx.font = '18px monospace';
        ctx.fillText(p.char, p.x, p.y);

        const dist = Math.hypot(centerX - p.x, centerY - p.y);
        if (p.alpha < 0.02 || dist < 10) {
          spawn(p);
        }
      });

      raf = requestAnimationFrame(animate);
    }

    animate();

    return () => cancelAnimationFrame(raf);
  }, [width, height, text]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: `${width}px`, height: `${height}px`, background: '#F0EEE6' }}
    />
  );
};

export default CharacterVortex;


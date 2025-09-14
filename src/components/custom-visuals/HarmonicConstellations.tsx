// order emerging from harmonic relationships
import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const HarmonicConstellations: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const starCount = 40;
    const stars: { x: number; y: number; vx: number; vy: number }[] = [];

    for (let i = 0; i < starCount; i++) {
      stars.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.2,
        vy: (Math.random() - 0.5) * 0.2,
      });
    }

    const fractions = [
      1 / 2,
      2 / 3,
      3 / 4,
      3 / 5,
      4 / 5,
      1,
      4 / 3,
      3 / 2,
      5 / 3,
      2,
    ];
    const tolerance = 0.03;

    let animationFrameId: number;

    const animate = () => {
      ctx.fillStyle = '#000';
      ctx.fillRect(0, 0, width, height);

      for (const star of stars) {
        star.x += star.vx;
        star.y += star.vy;
        if (star.x < 0) star.x += width;
        if (star.x >= width) star.x -= width;
        if (star.y < 0) star.y += height;
        if (star.y >= height) star.y -= height;
      }

      const pairs: { i: number; j: number; d: number }[] = [];
      for (let i = 0; i < starCount; i++) {
        for (let j = i + 1; j < starCount; j++) {
          const dx = stars[i].x - stars[j].x;
          const dy = stars[i].y - stars[j].y;
          const d = Math.sqrt(dx * dx + dy * dy);
          pairs.push({ i, j, d });
        }
      }

      const linesToDraw = new Set<string>();
      for (let p1 = 0; p1 < pairs.length; p1++) {
        for (let p2 = p1 + 1; p2 < pairs.length; p2++) {
          const ratio = pairs[p1].d / pairs[p2].d;
          for (const f of fractions) {
            if (Math.abs(ratio - f) < tolerance || Math.abs(ratio - 1 / f) < tolerance) {
              linesToDraw.add(`${pairs[p1].i}-${pairs[p1].j}`);
              linesToDraw.add(`${pairs[p2].i}-${pairs[p2].j}`);
              break;
            }
          }
        }
      }

      ctx.fillStyle = '#fff';
      for (const star of stars) {
        ctx.beginPath();
        ctx.arc(star.x, star.y, 2, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(255,255,255,0.4)';
      ctx.lineWidth = 0.5;
      linesToDraw.forEach((key) => {
        const [i, j] = key.split('-').map(Number);
        ctx.beginPath();
        ctx.moveTo(stars[i].x, stars[i].y);
        ctx.lineTo(stars[j].x, stars[j].y);
        ctx.stroke();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();
    return () => cancelAnimationFrame(animationFrameId);
  }, [width, height]);

  return <canvas ref={canvasRef} width={width} height={height} />;
};

export default HarmonicConstellations;


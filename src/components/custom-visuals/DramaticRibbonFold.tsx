import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Themes: yielding to overcome, softness over hardness, finding strength in adaptability
// Visualization: A ribbon that folds and yields to unseen forces, demonstrating how softness can overcome rigidity

interface Point {
  x: number;
  y: number;
}

interface RibbonSegment {
  p1: Point;
  p2: Point;
  p3: Point;
  p4: Point;
  draw: (ctx: CanvasRenderingContext2D) => void;
}

const DramaticRibbonFold: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = width;
    canvas.height = height;

    let time = 0;
    const ribbonSegments: RibbonSegment[] = [];

    const createRibbon = () => {
      const numSegments = 50;
      const segmentLength = 20;
      const ribbonWidth = 80;

      let currentPoint = { x: width / 2, y: 50 };
      let angle = Math.PI / 2;

      for (let i = 0; i < numSegments; i++) {
        const nextPoint = {
          x: currentPoint.x + Math.cos(angle) * segmentLength,
          y: currentPoint.y + Math.sin(angle) * segmentLength,
        };

        const p1 = { x: currentPoint.x - Math.sin(angle) * ribbonWidth / 2, y: currentPoint.y + Math.cos(angle) * ribbonWidth / 2 };
        const p2 = { x: currentPoint.x + Math.sin(angle) * ribbonWidth / 2, y: currentPoint.y - Math.cos(angle) * ribbonWidth / 2 };
        const p3 = { x: nextPoint.x + Math.sin(angle) * ribbonWidth / 2, y: nextPoint.y - Math.cos(angle) * ribbonWidth / 2 };
        const p4 = { x: nextPoint.x - Math.sin(angle) * ribbonWidth / 2, y: nextPoint.y + Math.cos(angle) * ribbonWidth / 2 };

        ribbonSegments.push({
          p1, p2, p3, p4,
          draw(ctx: CanvasRenderingContext2D) {
            ctx.beginPath();
            ctx.moveTo(this.p1.x, this.p1.y);
            ctx.lineTo(this.p2.x, this.p2.y);
            ctx.lineTo(this.p3.x, this.p3.y);
            ctx.lineTo(this.p4.x, this.p4.y);
            ctx.closePath();

            const gradient = ctx.createLinearGradient(this.p1.x, this.p1.y, this.p3.x, this.p3.y);
            gradient.addColorStop(0, 'rgba(0, 0, 0, 0.2)');
            gradient.addColorStop(1, 'rgba(0, 0, 0, 0.1)');
            ctx.fillStyle = gradient;
            ctx.fill();
          },
        });

        currentPoint = nextPoint;
        angle += (Math.random() - 0.5) * 0.2;
      }
    };

    createRibbon();

    const animate = () => {
      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      ribbonSegments.forEach((segment, index) => {
        const foldFactor = Math.sin(time + index * 0.2) * 20;
        segment.p2.y += foldFactor * 0.1;
        segment.p3.y += foldFactor * 0.1;
        segment.draw(ctx);
      });

      time += 0.02;
      requestAnimationFrame(animate);
    };

    animate();

  }, [width, height]);

  return (
    <div style={{ width: `${width}px`, height: `${height}px`, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default DramaticRibbonFold;

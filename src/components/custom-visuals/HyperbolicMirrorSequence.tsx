import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// visualization: Nested reflective arcs spaced via hyperbolic functions.
// deeper arcs fade and a subtle zoom animates in and out.
const HyperbolicMirrorSequence: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas?.getContext('2d');
    if (!canvas || !ctx) return;

    canvas.width = width;
    canvas.height = height;

    const numArcs = 40;
    const maxRadius = Math.min(width, height) * 0.45;
    let animationFrameId: number;
    let time = 0;

    const render = () => {
      time += 0.01;

      ctx.fillStyle = '#F0EEE6';
      ctx.fillRect(0, 0, width, height);

      const zoom = 1 + 0.02 * Math.sin(time * 0.5);

      for (let i = 0; i < numArcs; i++) {
        const depth = i / (numArcs - 1);
        const radius = (Math.sinh(depth * 2) / Math.sinh(2)) * maxRadius * zoom;
        const alpha = 1 - depth;

        ctx.strokeStyle = `rgba(40, 40, 40, ${alpha})`;
        ctx.lineWidth = 1 + (1 - depth) * 0.5;

        // upper arc
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, Math.PI * 0.1, Math.PI * 0.9);
        ctx.stroke();

        // mirrored lower arc
        ctx.beginPath();
        ctx.arc(width / 2, height / 2, radius, Math.PI * 1.1, Math.PI * 1.9);
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
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
        border: '1px solid rgba(0, 0, 0, 0.1)',
        boxShadow: '0 0 20px rgba(0, 0, 0, 0.05)',
        borderRadius: '8px',
        overflow: 'hidden',
      }}
    >
      <canvas ref={canvasRef} width={width} height={height} />
    </div>
  );
};

export default HyperbolicMirrorSequence;


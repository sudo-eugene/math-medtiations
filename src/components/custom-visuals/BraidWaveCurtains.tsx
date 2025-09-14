import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Braided wave curtains: families of sinusoidal strands
const BraidWaveCurtains: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      ctx.lineWidth = 0.8;
      const strands = 24;
      for (let s=0;s<strands;s++) {
        const offset = (s/strands) * width;
        const a = 0.35 + 0.25*Math.sin(t*0.8 + s);
        ctx.beginPath();
        for (let y=0;y<=height;y++) {
          const x = offset + 60*Math.sin(0.02*y + t*1.6 + s*0.3) + 30*Math.sin(0.006*y + t*0.7 + s);
          const xx = ((x%width)+width)%width; // wrap around
          if (y===0) ctx.moveTo(xx, y); else ctx.lineTo(xx, y);
        }
        ctx.strokeStyle = `rgba(60,60,60,${a})`;
        ctx.stroke();
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => { if (raf) cancelAnimationFrame(raf); };
  }, [width,height]);
  return (
    <div style={{ width, height, background:'#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height}/>
    </div>
  );
};

export default BraidWaveCurtains;


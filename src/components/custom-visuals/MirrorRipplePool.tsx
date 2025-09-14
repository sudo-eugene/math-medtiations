import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Reflective pool: rippled reflection of a procedural ridge line
const MirrorRipplePool: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const ridge = (x:number, tt:number) => 0.35*Math.sin(x*0.008 + tt*0.7) + 0.2*Math.sin(x*0.02 - tt*0.3);

    const render = () => {
      t += 0.02;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);

      // draw ridge line
      ctx.strokeStyle = 'rgba(60,60,60,0.7)'; ctx.lineWidth = 1.2;
      ctx.beginPath();
      const y0 = height*0.38;
      for (let x=0;x<=width;x++) {
        const y = y0 - 60 * ridge(x, t);
        if (x===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.stroke();

      // reflection with ripples below
      const rip = (x:number, y:number) => 6*Math.sin(0.08*y + t*2.0) + 3*Math.sin(0.03*x - t*1.5);
      ctx.strokeStyle = 'rgba(60,60,60,0.35)';
      for (let y=y0; y<height; y+=2) {
        ctx.beginPath();
        for (let x=0;x<=width;x++) {
          const yr = y0 + (y - y0);
          const base = y0 - 60 * ridge(x + 0.7*rip(x, y), t);
          const yy = yr + (base - y0) * 0.9 + rip(x,y);
          if (x===0) ctx.moveTo(x, yy); else ctx.lineTo(x, yy);
        }
        ctx.stroke();
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return ()=>{ if (raf) cancelAnimationFrame(raf); };
  }, [width,height]);

  return (
    <div style={{ width, height, background:'#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height}/>
    </div>
  );
};

export default MirrorRipplePool;


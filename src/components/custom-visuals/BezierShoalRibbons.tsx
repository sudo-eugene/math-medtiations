import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// School of bezier ribbons gliding across the canvas
const BezierShoalRibbons: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const N = 24;
    const fish = Array.from({ length: N }, (_, i) => ({
      x: Math.random()*width,
      y: Math.random()*height,
      vx: 0.6 + Math.random()*0.8,
      vy: (Math.random()-0.5)*0.6,
      phase: Math.random()*Math.PI*2,
      len: 80 + Math.random()*120
    }));

    const step = () => {
      t += 0.01;
      ctx.fillStyle = 'rgba(240,238,230,0.25)'; ctx.fillRect(0,0,width,height);
      ctx.lineWidth = 1.1; ctx.strokeStyle = 'rgba(60,60,60,0.36)';

      for (const f of fish) {
        f.x += f.vx; f.y += f.vy + 0.8*Math.sin(t*3 + f.phase);
        if (f.x > width + 100) { f.x = -100; f.y = Math.random()*height; }
        if (f.y < -50) f.y = height + 50; if (f.y > height + 50) f.y = -50;
        const cx1 = f.x - f.len*0.4; const cy1 = f.y + 20*Math.sin(t*2 + f.phase);
        const cx2 = f.x - f.len*0.8; const cy2 = f.y - 20*Math.sin(t*2 + f.phase*1.1);
        ctx.beginPath();
        ctx.moveTo(f.x, f.y);
        ctx.bezierCurveTo(cx1, cy1, cx2, cy2, f.x - f.len, f.y);
        ctx.stroke();
      }
      raf = requestAnimationFrame(step);
    };

    ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
    raf = requestAnimationFrame(step);
    return ()=>{ if (raf) cancelAnimationFrame(raf); };
  }, [width,height]);

  return (
    <div style={{ width, height, background:'#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height}/>
    </div>
  );
};

export default BezierShoalRibbons;


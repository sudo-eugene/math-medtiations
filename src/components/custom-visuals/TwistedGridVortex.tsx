import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Grid twisted by a central vortex field
const TwistedGridVortex: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      ctx.strokeStyle = 'rgba(60,60,60,0.32)'; ctx.lineWidth = 0.9;
      const cx = width/2, cy = height/2;
      const cols = 30, rows = 30; const pad = 18;
      const gw = width - pad*2, gh = height - pad*2;
      const dx = gw/(cols-1), dy = gh/(rows-1);
      const swirl = 0.9 + 0.6*Math.sin(t*0.7);

      // vertical
      for (let i=0;i<cols;i++) {
        ctx.beginPath();
        for (let j=0;j<rows;j++) {
          const x0 = pad + i*dx, y0 = pad + j*dy;
          const dx0 = x0 - cx, dy0 = y0 - cy; const r = Math.hypot(dx0, dy0)+1e-6;
          const ang = Math.atan2(dy0, dx0) + swirl * 0.6 * Math.exp(-r/180) * Math.sin(t + r*0.02);
          const rr = r + 8*Math.sin(t*1.2 + r*0.03);
          const x = cx + rr*Math.cos(ang), y = cy + rr*Math.sin(ang);
          if (j===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
      }
      // horizontal
      for (let j=0;j<rows;j++) {
        ctx.beginPath();
        for (let i=0;i<cols;i++) {
          const x0 = pad + i*dx, y0 = pad + j*dy;
          const dx0 = x0 - cx, dy0 = y0 - cy; const r = Math.hypot(dx0, dy0)+1e-6;
          const ang = Math.atan2(dy0, dx0) + swirl * 0.6 * Math.exp(-r/180) * Math.cos(t + r*0.02);
          const rr = r + 8*Math.cos(t*1.1 + r*0.028);
          const x = cx + rr*Math.cos(ang), y = cy + rr*Math.sin(ang);
          if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
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

export default TwistedGridVortex;


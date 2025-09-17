import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Grid-based circle packing illusion with radii modulated by field
const BreathingCirclePacking: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const render = () => {
      t += 0.02;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      const cols = 30, rows = 30;
      const dx = width/cols, dy = height/rows; const rmax = Math.min(dx,dy)*0.48;
      for (let j=0;j<rows;j++){
        for (let i=0;i<cols;i++){
          const x = (i+0.5)*dx, y = (j+0.5)*dy;
          const u = (x-width/2)/Math.min(width,height);
          const v = (y-height/2)/Math.min(width,height);
          const field = Math.sin(6*u + t*0.8) + Math.cos(6*v - t*0.9) + Math.sin(10*(u*u+v*v) - t*1.1);
          const rr = rmax * (0.5 + 0.5 * (Math.sin(field)+1)/2);
          ctx.beginPath(); ctx.arc(x,y,Math.max(0.5,rr),0,Math.PI*2);
          ctx.strokeStyle = 'rgba(60,60,60,0.4)'; ctx.lineWidth = 0.8; ctx.stroke();
        }
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

export default BreathingCirclePacking;


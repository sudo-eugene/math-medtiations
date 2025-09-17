import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Flow field streamlines from seeded points with gentle noise
const SeedStreamlines: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const N = 1800; const pts = new Float32Array(N*2);
    for (let i=0;i<N;i++){ pts[2*i]=Math.random()*width; pts[2*i+1]=Math.random()*height; }

    const noise = (x:number,y:number,tt:number)=> {
      return Math.sin(0.004*x + 0.7*Math.sin(tt*0.6)) + Math.cos(0.004*y - 0.6*Math.cos(tt*0.5));
    };

    const step = () => {
      t += 1/60;
      ctx.fillStyle = 'rgba(240,238,230,0.2)'; ctx.fillRect(0,0,width,height);
      ctx.strokeStyle = 'rgba(60,60,60,0.25)'; ctx.lineWidth = 0.7;
      for (let i=0;i<N;i++){
        const ix=2*i; let x=pts[ix], y=pts[ix+1];
        const a = noise(x,y,t);
        const b = noise(y,x,t+1.7);
        const theta = Math.atan2(b,a);
        const nx = x + 1.8*Math.cos(theta);
        const ny = y + 1.8*Math.sin(theta);
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(nx,ny); ctx.stroke();
        x=nx; y=ny;
        if (x<0||x>width||y<0||y>height){ x=Math.random()*width; y=Math.random()*height; }
        pts[ix]=x; pts[ix+1]=y;
      }
      raf = requestAnimationFrame(step);
    };
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);
    raf = requestAnimationFrame(step);
    return ()=>{ if (raf) cancelAnimationFrame(raf); };
  }, [width,height]);

  return (
    <div style={{ width, height, background:'#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height}/>
    </div>
  );
};

export default SeedStreamlines;


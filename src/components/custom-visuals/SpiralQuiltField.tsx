import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Quilt of small rotating spiral tiles with phase gradients
const SpiralQuiltField: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const drawTile = (x:number,y:number,sz:number,phase:number) => {
      ctx.save(); ctx.translate(x+sz/2,y+sz/2); ctx.rotate(phase);
      ctx.strokeStyle = 'rgba(60,60,60,0.35)'; ctx.lineWidth = 0.8;
      ctx.beginPath();
      const steps = 80; const a=0.13;
      for (let i=0;i<steps;i++){
        const p=i/(steps-1); const th=p*4*Math.PI; const r=2*Math.exp(a*th);
        const xx=r*Math.cos(th), yy=r*Math.sin(th);
        if (i===0) ctx.moveTo(xx,yy); else ctx.lineTo(xx,yy);
      }
      ctx.stroke(); ctx.restore();
    };

    const render = () => {
      t += 0.02;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      const cols = 8; const rows = 8; const sz = Math.min(width/cols, height/rows);
      for (let j=0;j<rows;j++) for (let i=0;i<cols;i++) {
        const x = i*sz, y=j*sz; const phase = 0.3*(i+j) + t*0.5;
        drawTile(x,y,sz,phase);
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

export default SpiralQuiltField;


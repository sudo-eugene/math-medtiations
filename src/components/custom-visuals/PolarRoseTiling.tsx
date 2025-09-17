import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Overlapping polar rose tiles arranged radially
const PolarRoseTiling: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const drawRose = (cx:number, cy:number, scale:number, k:number, phase:number, alpha:number) => {
      ctx.beginPath();
      for (let a=0;a<=Math.PI*2+0.001;a+=0.01){
        const r = scale * (0.5 + 0.5*Math.sin(k*a + phase));
        const x = cx + r*Math.cos(a); const y = cy + r*Math.sin(a);
        if (a===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.strokeStyle = `rgba(60,60,60,${alpha})`; ctx.lineWidth = 0.9; ctx.stroke();
    };

    const render = () => {
      t += 0.02;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      const cx = width/2, cy = height/2; const maxR = Math.min(width,height)*0.42;
      const tiles = 8;
      for (let i=0;i<tiles;i++){
        const a = (i/tiles)*Math.PI*2 + t*0.2;
        const x = cx + 0.4*maxR*Math.cos(a); const y = cy + 0.4*maxR*Math.sin(a);
        drawRose(x,y, maxR*0.6, 5+i%3, t*0.8 + i*0.5, 0.28 + 0.04*i);
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

export default PolarRoseTiling;


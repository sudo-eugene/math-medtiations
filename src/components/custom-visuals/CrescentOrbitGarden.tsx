import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Orbits of crescents rotating and phasing
const CrescentOrbitGarden: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const drawCrescent = (x:number,y:number,r:number,phase:number,alpha:number) => {
      ctx.save(); ctx.translate(x,y); ctx.rotate(phase);
      ctx.beginPath(); ctx.arc(0,0,r,0,Math.PI*2);
      ctx.strokeStyle = `rgba(60,60,60,${alpha})`; ctx.lineWidth = 1; ctx.stroke();
      ctx.globalCompositeOperation = 'destination-out';
      ctx.beginPath(); ctx.arc(r*0.25,0,r*0.9,0,Math.PI*2); ctx.fillStyle = 'rgba(0,0,0,0.5)'; ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
      ctx.restore();
    };

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      const cx = width/2, cy = height/2; const baseR = Math.min(width,height)*0.36;
      for (let i=0;i<18;i++){
        const a = (i/18)*Math.PI*2 + t*0.4;
        const r = baseR * (0.4 + 0.6*(i/18));
        const x = cx + r*Math.cos(a); const y = cy + r*Math.sin(a);
        drawCrescent(x,y,8+6*(i/18), t*1.2 + i*0.4, 0.5- i*0.02);
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

export default CrescentOrbitGarden;


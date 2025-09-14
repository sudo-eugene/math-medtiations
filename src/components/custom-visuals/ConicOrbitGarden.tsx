import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Family of conic sections rotating and precessing around the center
const ConicOrbitGarden: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      const cx = width/2, cy = height/2; const maxR = Math.min(width,height)*0.42;
      ctx.strokeStyle = 'rgba(60,60,60,0.35)'; ctx.lineWidth = 1;
      for (let k=0;k<18;k++) {
        const e = 0.05 + 0.9*(k/18)*Math.abs(Math.sin(t*0.4)); // eccentricity
        const a = 20 + (k/18)*maxR; const b = a*Math.sqrt(1-e*e);
        const rot = t*0.4 + k*0.2;
        ctx.beginPath();
        for (let th=0; th<=Math.PI*2+0.001; th+=0.01){
          const x0 = a*Math.cos(th) - e*a; // focus at origin
          const y0 = b*Math.sin(th);
          const x = cx + x0*Math.cos(rot) - y0*Math.sin(rot);
          const y = cy + x0*Math.sin(rot) + y0*Math.cos(rot);
          if (th===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
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

export default ConicOrbitGarden;


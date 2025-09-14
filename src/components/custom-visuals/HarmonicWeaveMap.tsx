import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// String-art weave between two circles using harmonic mapping
const HarmonicWeaveMap: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      const L = Math.min(width,height)*0.32; const cx1 = width*0.32; const cx2 = width*0.68; const cy = height/2;
      const N = 240; const k = 1.2 + 1.0*Math.sin(t*0.6);
      ctx.strokeStyle = 'rgba(60,60,60,0.22)'; ctx.lineWidth = 0.8;
      for (let i=0;i<N;i++){
        const a = (i/N)*Math.PI*2; const j = (i*k)%N; const b = (j/N)*Math.PI*2;
        const x1 = cx1 + L*Math.cos(a), y1 = cy + L*Math.sin(a);
        const x2 = cx2 + L*Math.cos(b), y2 = cy + L*Math.sin(b);
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      }
      // draw circles
      ctx.strokeStyle='rgba(60,60,60,0.45)'; ctx.beginPath(); ctx.arc(cx1,cy,L,0,Math.PI*2); ctx.stroke(); ctx.beginPath(); ctx.arc(cx2,cy,L,0,Math.PI*2); ctx.stroke();
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

export default HarmonicWeaveMap;


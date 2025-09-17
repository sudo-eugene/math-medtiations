import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Concentric rings with chords using time-varying step ratios
const ChordRingMandala: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      const cx = width/2, cy = height/2; const maxR = Math.min(width,height)*0.46;
      for (let ring=0; ring<8; ring++) {
        const R = (0.2 + 0.1*ring + 0.03*Math.sin(t*0.8 + ring)) * maxR;
        const N = 180;
        const step = 2 + 40 * (0.5 + 0.5*Math.sin(t*0.6 + ring));
        ctx.strokeStyle = `rgba(60,60,60,${0.26 + 0.06*ring})`; ctx.lineWidth = 0.7;
        for (let i=0;i<N;i+=2){
          const a = (i/N)*Math.PI*2; const j = (i+step)%N; const b = (j/N)*Math.PI*2;
          const x1 = cx + R*Math.cos(a), y1 = cy + R*Math.sin(a);
          const x2 = cx + R*Math.cos(b), y2 = cy + R*Math.sin(b);
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
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

export default ChordRingMandala;


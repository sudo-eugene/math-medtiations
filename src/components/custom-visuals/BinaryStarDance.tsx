import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Binary stars orbiting with small satellites leaving faint trails
const BinaryStarDance: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const cx = width/2, cy = height/2;
    const sats = Array.from({ length: 240 }, (_, i) => ({
      phase: Math.random()*Math.PI*2,
      dist: 40 + Math.random()*180,
      around: Math.random()<0.5? 0 : 1
    }));

    ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
    const step = () => {
      t += 0.01;
      ctx.fillStyle = 'rgba(240,238,230,0.25)'; ctx.fillRect(0,0,width,height);

      const R = 60;
      const a = t*1.0;
      const s1x = cx - R*Math.cos(a), s1y = cy - 0.6*R*Math.sin(a);
      const s2x = cx + R*Math.cos(a), s2y = cy + 0.6*R*Math.sin(a);

      // satellites
      ctx.strokeStyle = 'rgba(60,60,60,0.25)'; ctx.lineWidth = 0.7;
      for (const s of sats) {
        const hostx = s.around? s2x : s1x; const hosty = s.around? s2y : s1y;
        const ang = s.phase + t* (0.4 + 60/s.dist);
        const x = hostx + s.dist*Math.cos(ang);
        const y = hosty + s.dist*Math.sin(ang);
        ctx.beginPath(); ctx.arc(x,y,0.9,0,Math.PI*2); ctx.stroke();
      }

      // stars
      ctx.fillStyle = 'rgba(60,60,60,0.7)';
      ctx.beginPath(); ctx.arc(s1x,s1y,3,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.arc(s2x,s2y,3,0,Math.PI*2); ctx.fill();

      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return ()=>{ if (raf) cancelAnimationFrame(raf); };
  }, [width,height]);

  return (
    <div style={{ width, height, background:'#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height}/>
    </div>
  );
};

export default BinaryStarDance;


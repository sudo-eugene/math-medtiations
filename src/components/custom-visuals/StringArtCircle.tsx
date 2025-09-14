import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Circle string-art: chords connecting points with time-varying mapping
const StringArtCircle: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;

    let raf: number | null = null; let t = 0;

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);

      const cx = width/2, cy = height/2; const R = Math.min(width,height)*0.44;
      const N = 360;
      const k = 2.0 + 1.2 * Math.sin(t * 0.6);

      ctx.strokeStyle = 'rgba(60,60,60,0.25)'; ctx.lineWidth = 0.8;

      for (let i=0;i<N;i++) {
        const a = (i / N) * Math.PI*2;
        const j = (i * k) % N; // fractional mapping ok for smoothness
        const b = (j / N) * Math.PI*2;
        const x1 = cx + R * Math.cos(a);
        const y1 = cy + R * Math.sin(a);
        const x2 = cx + R * Math.cos(b);
        const y2 = cy + R * Math.sin(b);
        ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
      }

      // outer circle
      ctx.beginPath(); ctx.arc(cx,cy,R,0,Math.PI*2);
      ctx.strokeStyle = 'rgba(60,60,60,0.45)'; ctx.lineWidth = 1.2; ctx.stroke();

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

export default StringArtCircle;


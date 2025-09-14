import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Starfield with gravitational-lens-like arcs around a central mass
const LensedStars: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const cx = width/2, cy = height/2;
    const stars = Array.from({ length: 1400 }, () => ({
      x: (Math.random()-0.5)*width*1.6,
      y: (Math.random()-0.5)*height*1.6,
    }));

    const render = () => {
      t += 0.01;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle = 'rgba(60,60,60,0.75)';
      const lensR = 80 + 10*Math.sin(t*0.7);
      for (const s of stars) {
        const sx = s.x + cx; const sy = s.y + cy;
        let dx = sx - cx, dy = sy - cy; const r2 = dx*dx + dy*dy + 1e-3;
        const factor = 1 + 12000 / r2; // lensing magnification
        const lx = cx + dx * factor; const ly = cy + dy * factor;
        if (lx>=-50 && lx<=width+50 && ly>=-50 && ly<=height+50) {
          ctx.fillRect(lx, ly, 1, 1);
        }
      }
      // lens ring
      ctx.beginPath(); ctx.arc(cx,cy,lensR,0,Math.PI*2);
      ctx.strokeStyle='rgba(60,60,60,0.35)'; ctx.lineWidth=1; ctx.stroke();
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

export default LensedStars;


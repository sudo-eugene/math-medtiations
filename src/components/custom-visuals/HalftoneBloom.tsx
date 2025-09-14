import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Radial halftone bloom using dot sizes on a coarse grid
const HalftoneBloom: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    let raf: number | null = null; let t = 0;

    const render = () => {
      t += 0.02;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      const cols = 64; const rows = 64;
      const dx = width/cols; const dy = height/rows;
      const cx = width/2, cy = height/2, maxR = Math.min(width,height)*0.49;
      ctx.fillStyle = '#333';
      for (let j=0;j<rows;j++) {
        for (let i=0;i<cols;i++) {
          const x = (i+0.5)*dx; const y = (j+0.5)*dy;
          const rr = Math.hypot(x-cx, y-cy);
          const pulse = 0.5 + 0.5*Math.sin(0.02*rr - t*3.2) + 0.3*Math.sin(0.005*rr + t*1.1);
          const size = Math.max(0, (1-rr/maxR) * 4 * pulse);
          if (size>0.2){ ctx.beginPath(); ctx.arc(x,y,size,0,Math.PI*2); ctx.fill(); }
        }
      }
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

export default HalftoneBloom;


import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Morphing regular polygon family between 3..12 sides with radial ripples
const PolygonMorphDance: React.FC<VisualProps> = ({ width, height }) => {
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
      const sides = 3 + 4.5*(1+Math.sin(t*0.5)); // 3..12 fractional
      const baseN = Math.floor(sides);
      const frac = sides - baseN;
      const rings = 16;
      ctx.strokeStyle = 'rgba(60,60,60,0.42)'; ctx.lineWidth = 0.9;
      for (let k=1;k<=rings;k++){
        const r = (k/rings)*maxR;
        ctx.beginPath();
        const N = baseN + 1; // morph to next
        for (let i=0;i<=N;i++){
          const a = (i/N)*Math.PI*2 + 0.2*Math.sin(t + k*0.2);
          // interpolate radius to approximate morph
          const r1 = r*(1 + 0.06*Math.sin(baseN*a));
          const r2 = r*(1 + 0.06*Math.sin((baseN+1)*a));
          const rr = r1*(1-frac) + r2*frac;
          const x = cx + rr*Math.cos(a); const y = cy + rr*Math.sin(a);
          if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
        }
        ctx.stroke();
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

export default PolygonMorphDance;


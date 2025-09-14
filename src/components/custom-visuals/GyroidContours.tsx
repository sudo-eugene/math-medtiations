import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

// Gyroid-like scalar field contours using marching squares
const GyroidContours: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  useEffect(() => {
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;

    let raf: number | null = null; let t = 0;

    const field = (x: number, y: number, tt: number) => {
      const s = 0.02;
      const X = x*s, Y = y*s;
      return Math.sin(X) * Math.cos(Y) + Math.sin(Y) * Math.cos(tt*0.7) + Math.cos(X) * Math.sin(tt*0.5);
    };

    const render = () => {
      t += 0.02;
      ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);
      ctx.strokeStyle = 'rgba(60,60,60,0.35)'; ctx.lineWidth = 1;

      const step = 12; // grid step
      const isoLevels = [-0.9,-0.6,-0.3,0,0.3,0.6,0.9];
      for (const iso of isoLevels) {
        for (let y=0;y<height-step;y+=step){
          for (let x=0;x<width-step;x+=step){
            // sample corners
            const v0 = field(x,y,t)-iso;
            const v1 = field(x+step,y,t)-iso;
            const v2 = field(x+step,y+step,t)-iso;
            const v3 = field(x,y+step,t)-iso;
            const idx = (v0>0?1:0) | (v1>0?2:0) | (v2>0?4:0) | (v3>0?8:0);
            if (idx===0 || idx===15) continue;
            // linear interpolation along edges
            const lerp = (a:number,b:number,va:number,vb:number)=> a + (b-a) * (va/(va-vb));
            const pts: {x:number;y:number}[] = [];
            if ((idx & 1) !== (idx & 2)) {
              const px = lerp(x, x+step, v0, v1); pts.push({x:px, y});
            }
            if ((idx & 2) !== (idx & 4)) {
              const py = lerp(y, y+step, v1, v2); pts.push({x:x+step, y:py});
            }
            if ((idx & 4) !== (idx & 8)) {
              const px = lerp(x, x+step, v3, v2); pts.push({x:px, y:y+step});
            }
            if ((idx & 8) !== (idx & 1)) {
              const py = lerp(y, y+step, v0, v3); pts.push({x, y:py});
            }
            if (pts.length>=2){
              ctx.beginPath(); ctx.moveTo(pts[0].x, pts[0].y);
              for (let k=1;k<pts.length;k++) ctx.lineTo(pts[k].x, pts[k].y);
              ctx.stroke();
            }
          }
        }
      }

      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return ()=>{ if (raf) cancelAnimationFrame(raf); };
  }, [width,height]);

  return (
    <div style={{ width, height, background: '#F0EEE6' }}>
      <canvas ref={canvasRef} width={width} height={height}/>
    </div>
  );
};

export default GyroidContours;


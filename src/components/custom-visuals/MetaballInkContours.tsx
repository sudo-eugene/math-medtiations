// Themes: metaballs, isocontours, living ink
// Visualisation: Breathing ink contours wrapping around moving hidden blobs
// Unique mechanism: Marching-squares iso-lines over inverse-distance-squared metaballs

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const MetaballInkContours: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(() => {
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);

    // Seeded PRNG
    let s = 314159265 >>> 0;
    const rnd = () => (s = (1664525*s + 1013904223)>>>0, s/4294967296);

    // Metaballs: positions and velocities
    const balls = Array.from({length: 5}, () => ({
      x: rnd()*width, y: rnd()*height,
      vx: (rnd()*2-1)*0.4, vy: (rnd()*2-1)*0.4,
      r: 50 + rnd()*70
    }));

    const gs = Math.max(6, Math.floor(Math.min(width,height)/140)); // grid step
    const nx = Math.floor(width/gs);
    const ny = Math.floor(height/gs);
    const field = new Float32Array((nx+1)*(ny+1));

    const idx = (i:number,j:number)=> i + j*(nx+1);
    const threshold = 1.0;

    const valueAt = (x:number,y:number)=>{
      let v = 0;
      for (const b of balls) {
        const dx = x - b.x, dy = y - b.y;
        const d2 = dx*dx + dy*dy + 1;
        v += (b.r*b.r) / d2;
      }
      return v * 0.002; // scaled to ~1
    };

    const render = () => {
      // Trails
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);

      // Update balls
      for (const b of balls) {
        b.x += b.vx; b.y += b.vy;
        if (b.x < 0 || b.x > width) b.vx *= -1;
        if (b.y < 0 || b.y > height) b.vy *= -1;
      }

      // Sample scalar field on grid nodes
      for (let j=0;j<=ny;j++){
        const y = j*gs;
        for (let i=0;i<=nx;i++){
          const x = i*gs;
          field[idx(i,j)] = valueAt(x,y);
        }
      }

      // Marching squares
      ctx.strokeStyle = 'rgba(20,20,20,0.25)';
      ctx.lineWidth = 1;
      for (let j=0;j<ny;j++){
        for (let i=0;i<nx;i++){
          const f0 = field[idx(i,j)];
          const f1 = field[idx(i+1,j)];
          const f2 = field[idx(i+1,j+1)];
          const f3 = field[idx(i,j+1)];
          const b0 = f0 > threshold ? 1:0;
          const b1 = f1 > threshold ? 1:0;
          const b2 = f2 > threshold ? 1:0;
          const b3 = f3 > threshold ? 1:0;
          const c = (b0) | (b1<<1) | (b2<<2) | (b3<<3);
          if (c===0 || c===15) continue;

          const x = i*gs, y = j*gs;
          const fx = (a:number,b:number,fa:number,fb:number)=> a + (threshold-fa)/(fb-fa)*(b-a);

          // Interpolate edges
          const e0x = fx(x, x+gs, f0, f1); // top
          const e1y = fx(y, y+gs, f1, f2); // right
          const e2x = fx(x, x+gs, f3, f2); // bottom
          const e3y = fx(y, y+gs, f0, f3); // left

          ctx.beginPath();
          switch (c) {
            case 1: case 14:
              ctx.moveTo(x, e3y); ctx.lineTo(e0x, y); break;
            case 2: case 13:
              ctx.moveTo(e0x, y); ctx.lineTo(x+gs, e1y); break;
            case 3: case 12:
              ctx.moveTo(x, e3y); ctx.lineTo(x+gs, e1y); break;
            case 4: case 11:
              ctx.moveTo(x+gs, e1y); ctx.lineTo(e2x, y+gs); break;
            case 5:
              ctx.moveTo(x, e3y); ctx.lineTo(e0x, y);
              ctx.moveTo(x+gs, e1y); ctx.lineTo(e2x, y+gs); break;
            case 6: case 9:
              ctx.moveTo(e0x, y); ctx.lineTo(e2x, y+gs); break;
            case 7: case 8:
              ctx.moveTo(x, e3y); ctx.lineTo(e2x, y+gs); break;
            case 10:
              ctx.moveTo(x, e3y); ctx.lineTo(x+gs, e1y);
              ctx.moveTo(e0x, y); ctx.lineTo(e2x, y+gs); break;
          }
          ctx.stroke();
        }
      }

      raf.current = requestAnimationFrame(render);
    };

    raf.current = requestAnimationFrame(render);
    return () => { if (raf.current) cancelAnimationFrame(raf.current); ctx.clearRect(0,0,width,height); };
  }, [width, height]);

  return <div style={{ width: `${width}px`, height:`${height}px`, background:'#F0EEE6', overflow:'hidden' }}>
    <canvas ref={ref} width={width} height={height} style={{width:'100%',height:'100%'}} />
  </div>;
};

const metadata = {
  themes: "metaballs,contours,ink,breathe,calm",
  visualisation: "Isocontours enveloping drifting metaballs like wet ink",
  promptSuggestion: "1. Soften thresholds\n2. Keep motion slow\n3. Prefer thin strokes"
};
(MetaballInkContours as any).metadata = metadata;

export default MetaballInkContours;

// Differs from others by: marching-squares iso-contours over metaballs (only file using this)


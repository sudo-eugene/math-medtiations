// Themes: packing, circles, gentle growth
// Visualisation: A garden of circles grows until they just touch
// Unique mechanism: Incremental circle packing with per-circle growth until collision

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

type C = {x:number,y:number,r:number,growing:boolean};

const CirclePackingBloom: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 11235813 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const circles: C[] = [];
    const maxCircles = 420;

    const placeCircle = ()=>{
      for(let tries=0; tries<50; tries++){
        const x = rnd()*width, y=rnd()*height;
        let ok = true;
        for(const c of circles){
          const d = Math.hypot(x-c.x, y-c.y);
          if (d < c.r + 3) { ok = false; break; }
        }
        if (ok) { circles.push({x,y,r:1+rnd()*2,growing:true}); return; }
      }
    };

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);

      if (circles.length < maxCircles) placeCircle();

      // Grow and collide
      for(const c of circles){
        if (!c.growing) continue;
        c.r += 0.35;
        if (c.x - c.r < 0 || c.x + c.r > width || c.y - c.r < 0 || c.y + c.r > height){
          c.growing = false; continue;
        }
        for(const d of circles){
          if (c===d) continue;
          const dist = Math.hypot(c.x-d.x, c.y-d.y);
          if (dist < c.r + d.r + 0.5){ c.growing = false; break; }
        }
      }

      // Draw
      ctx.strokeStyle='rgba(20,20,20,0.25)';
      for(const c of circles){
        ctx.beginPath();
        ctx.arc(c.x, c.y, c.r, 0, Math.PI*2);
        ctx.stroke();
      }

      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);

    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return <div style={{width:`${width}px`,height:`${height}px`,background:'#F0EEE6',overflow:'hidden'}}>
    <canvas ref={ref} width={width} height={height} style={{width:'100%',height:'100%'}}/>
  </div>;
};

const metadata = {
  themes: "circle-packing,growth,calm",
  visualisation: "Growing circles stop when they kiss neighbors",
  promptSuggestion: "1. Keep growth slow\n2. Thin strokes\n3. Wide margins"
};
(CirclePackingBloom as any).metadata = metadata;

export default CirclePackingBloom;

// Differs from others by: incremental circle packing with per-circle growth to collision


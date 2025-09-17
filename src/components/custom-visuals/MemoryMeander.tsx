// Themes: wander, memory, flowing lines
// Visualisation: Curvature-memory lines drift and braid softly
// Unique mechanism: Random walk with persistent curvature (heading change inertia)

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const MemoryMeander: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 60606061 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const M = 60;
    const walkers = Array.from({length:M}, ()=>({
      x: rnd()*width, y: rnd()*height,
      h: rnd()*Math.PI*2, // heading
      dh: 0 // curvature (heading change)
    }));

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);
      ctx.strokeStyle='rgba(20,20,20,0.2)';
      ctx.lineWidth = 1;

      for(const w of walkers){
        // Update curvature with persistence and small random drive
        w.dh = w.dh*0.98 + (rnd()*0.06 - 0.03);
        w.h += w.dh;
        const vx = Math.cos(w.h), vy = Math.sin(w.h);
        const nx = w.x + vx*1.2, ny = w.y + vy*1.2;

        ctx.beginPath(); ctx.moveTo(w.x,w.y); ctx.lineTo(nx,ny); ctx.stroke();

        w.x = nx; w.y = ny;

        // Reflect from bounds softly
        if (w.x<10||w.x>width-10){ w.h = Math.PI - w.h; }
        if (w.y<10||w.y>height-10){ w.h = -w.h; }
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
  themes: "meander,curvature,memory,trails",
  visualisation: "Lines with curvature memory weave quietly",
  promptSuggestion: "1. Low curvature noise\n2. Thin strokes\n3. Reflective bounds"
};
(MemoryMeander as any).metadata = metadata;

export default MemoryMeander;

// Differs from others by: curvature-memory random walk rule driving the lines


// Themes: quantized directions, pentagonal symmetry, drift
// Visualisation: Walkers step in five quantized directions, forming woven braids
// Unique mechanism: Random walk constrained to 72° multiples with persistence

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const PentagonalStepWalk: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 80808081 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const dirs = Array.from({length:5}, (_,i)=> i*(Math.PI*2/5));
    const W = 70;
    const walkers = Array.from({length:W}, ()=>({
      x: rnd()*width, y: rnd()*height, d: (rnd()*5)|0
    }));

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);
      ctx.strokeStyle='rgba(20,20,20,0.18)';
      ctx.lineWidth = 1;

      for(const w of walkers){
        // Persistent direction with small chance to rotate ±1
        const r = rnd();
        if (r < 0.03) w.d = (w.d + 1) % 5;
        else if (r < 0.06) w.d = (w.d + 4) % 5;

        const step = 1.1 + Math.sin((w.x + w.y)*0.001)*0.2;
        const ang = dirs[w.d];
        const nx = w.x + Math.cos(ang)*step;
        const ny = w.y + Math.sin(ang)*step;

        ctx.beginPath();
        ctx.moveTo(w.x,w.y); ctx.lineTo(nx,ny); ctx.stroke();

        w.x = nx; w.y = ny;

        // Wrap
        if (w.x<0) w.x += width; if (w.x>width) w.x -= width;
        if (w.y<0) w.y += height; if (w.y>height) w.y -= height;
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
  themes: "quantized,walk,braid,pentagonal",
  visualisation: "Five-direction walkers braid gentle patterns",
  promptSuggestion: "1. Low turn probability\n2. Thin lines\n3. Slight step modulation"
};
(PentagonalStepWalk as any).metadata = metadata;

export default PentagonalStepWalk;

// Differs from others by: five-direction quantized random walk with persistence


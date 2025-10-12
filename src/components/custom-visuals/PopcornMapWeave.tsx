// Themes: popcorn map, weave, threads
// Visualisation: Fine woven threads from the Popcorn map
// Unique mechanism: Popcorn map with small step h, plotting threads with low alpha

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const PopcornMapWeave: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 22117733 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    let x = (rnd()*2-1)*1.2, y = (rnd()*2-1)*1.2;
    const h = 0.05;
    const cx = width*0.5, cy = height*0.5; const scale = Math.min(width,height)*0.22;

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.01)'; ctx.fillRect(0,0,width,height);
      // Soft pencil-like dark grey with higher opacity for pencil effect
      ctx.fillStyle='rgba(25,25,28,0.5)';
      for(let i=0;i<22000;i++){
        const xn = x - h*Math.sin(y + Math.tan(3*y));
        const yn = y - h*Math.sin(x + Math.tan(3*x));
        x = xn; y = yn;
        const px = cx + x*scale; const py = cy + y*scale;
        if (px>=0&&px<width&&py>=0&&py<height) ctx.fillRect(px|0, py|0, 1, 1);
      }
      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);
    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return <div style={{width:`${width}px`,height:`${height}px`, background:'#F0EEE6', overflow:'hidden'}}>
    <canvas ref={ref} width={width} height={height} style={{width:'100%',height:'100%'}}/>
  </div>;
};

const metadata = {
  themes: 'popcorn,map,weave,ink',
  visualisation: 'Popcorn map weaving threads of ink',
  promptSuggestion: '1. Keep h small\n2. Many iterations\n3. Low alpha stipple'
};
(PopcornMapWeave as any).metadata = metadata;

export default PopcornMapWeave;

// Differs from others by: Popcorn map’s trig-tangent coupling and small-step iterative weave


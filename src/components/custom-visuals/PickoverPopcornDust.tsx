// Themes: Pickover popcorn, dust, stipple
// Visualisation: Dusty stipple drawn by Pickover’s popcorn function
// Unique mechanism: Pickover popcorn iteration using coupled trig functions

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const PickoverPopcornDust: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s=99887766>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    let x=(rnd()*2-1)*2, y=(rnd()*2-1)*2; const h=0.05; const cx=width*0.5, cy=height*0.5; const scale=Math.min(width,height)*0.22;
    const render=()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';
      for(let i=0;i<24000;i++){
        const xn = x - h*Math.sin(y + Math.tan(3*y));
        const yn = y - h*Math.sin(x + Math.tan(3*x)); x=xn; y=yn; const px=cx+x*scale, py=cy+y*scale;
        if (px>=0&&px<width&&py>=0&&py<height) ctx.fillRect(px|0, py|0, 1, 1);
      }
      raf.current=requestAnimationFrame(render);
    };
    raf.current=requestAnimationFrame(render);
    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return <div style={{width:`${width}px`,height:`${height}px`, background:'#F0EEE6', overflow:'hidden'}}>
    <canvas ref={ref} width={width} height={height} style={{width:'100%',height:'100%'}}/>
  </div>;
};

const metadata = {
  themes: 'pickover,popcorn,dust,ink',
  visualisation: 'Dust drawn by Pickover popcorn iteration',
  promptSuggestion: '1. Low alpha\n2. Many steps\n3. Keep h small'
};
(PickoverPopcornDust as any).metadata = metadata;

export default PickoverPopcornDust;

// Differs from others by: Use of Pickover’s popcorn iteration (close to popcorn but parameterized)


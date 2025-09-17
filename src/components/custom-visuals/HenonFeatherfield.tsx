// Themes: discrete map, feathers, lattice
// Visualisation: Fine featherfields from the Henon map orbit set
// Unique mechanism: Henon map scatter with carefully chosen parameters

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const HenonFeatherfield: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 88446622 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const a = 1.4, b = 0.3;
    let x = (rnd()*2-1)*0.2, y = (rnd()*2-1)*0.2;
    const cx = width*0.5, cy = height*0.5;
    const scale = Math.min(width,height)*0.7;

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';
      for(let i=0;i<16000;i++){
        const xn = 1 - a*x*x + y;
        const yn = b*x;
        x = xn; y = yn;
        const px = cx + x*scale*0.5;
        const py = cy + y*scale*0.9;
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
  themes: 'henon,map,feather,ink',
  visualisation: 'Henon featherfield in grayscale stipple',
  promptSuggestion: '1. Many steps\n2. Tiny alpha\n3. Gentle scaling'
};
(HenonFeatherfield as any).metadata = metadata;

export default HenonFeatherfield;

// Differs from others by: Classic Henon map quadratic transform with distinct feather-like scatter


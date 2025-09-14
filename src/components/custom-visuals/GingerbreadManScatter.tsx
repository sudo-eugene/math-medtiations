// Themes: discrete map, scatter, minimalist
// Visualisation: A scattered ink constellation from the Gingerbreadman map
// Unique mechanism: Gingerbreadman map’s absolute value step plotted densely

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const GingerbreadManScatter: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 44007711 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    let x = (rnd()*2-1)*0.5, y = (rnd()*2-1)*0.5;
    const cx = width*0.5, cy = height*0.5; const scale = Math.min(width,height)*0.32;

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';
      for(let i=0;i<20000;i++){
        const xn = 1 - y + Math.abs(x);
        const yn = x;
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
  themes: 'gingerbreadman,map,scatter,ink',
  visualisation: 'Sparse gingerbreadman constellation accumulation',
  promptSuggestion: '1. Thin dots\n2. High iteration count\n3. Keep motion calm'
};
(GingerbreadManScatter as any).metadata = metadata;

export default GingerbreadManScatter;

// Differs from others by: Gingerbreadman absolute-value map dynamics with characteristic scatter


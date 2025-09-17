// Themes: discrete map, feather, whisper
// Visualisation: Feathered ink arises from a Tinkerbell map orbit
// Unique mechanism: Tinkerbell map iterations plotted with subtle accumulation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const TinkerbellFeather: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 55112266 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    // Standard Tinkerbell parameters
    const a = 0.9, b = -0.6013, c = 2.0, d = 0.5;
    let x = (rnd()*2-1)*0.1, y = (rnd()*2-1)*0.1;
    const cx = width*0.5, cy = height*0.5;
    const scale = Math.min(width,height)*0.45;

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';
      for(let i=0;i<16000;i++){
        const xn = x*x - y*y + a*x + b*y;
        const yn = 2*x*y + c*x + d*y;
        x = xn; y = yn;
        const px = cx + x*scale;
        const py = cy + y*scale;
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
  themes: 'tinkerbell,map,feather,ink',
  visualisation: 'Feathered Tinkerbell orbit in ink',
  promptSuggestion: '1. Keep feather light\n2. Plot many points\n3. Keep scale modest'
};
(TinkerbellFeather as any).metadata = metadata;

export default TinkerbellFeather;

// Differs from others by: Tinkerbell map quadratic iteration producing feather-like distributions


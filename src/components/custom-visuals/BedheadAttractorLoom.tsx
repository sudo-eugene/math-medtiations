// Themes: strange map, loom, interlace
// Visualisation: Interlaced threads from a Bedhead attractor map
// Unique mechanism: Bedhead map using sine-coupled updates in both axes

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const BedheadAttractorLoom: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 33007799 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    // Bedhead-like parameters
    const a = 1.4, b = 1.56, c = 1.4, d = -6.56;
    let x = (rnd()*2-1)*0.2, y = (rnd()*2-1)*0.2;
    const cx = width*0.5, cy = height*0.5; const scale = Math.min(width,height)*0.25;

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';
      for(let i=0;i<22000;i++){
        const xn = Math.sin(y*b) + c*Math.sin(x*b);
        const yn = Math.sin(x*a) + d*Math.sin(y*a);
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
  themes: 'bedhead,map,loom,ink',
  visualisation: 'Bedhead sine-coupled orbit looming into threads',
  promptSuggestion: '1. Keep alpha low\n2. Many steps\n3. Modest scale'
};
(BedheadAttractorLoom as any).metadata = metadata;

export default BedheadAttractorLoom;

// Differs from others by: Bedhead sine-coupled map dynamics distinct from polynomial maps


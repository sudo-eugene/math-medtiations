// Themes: chaotic map, nebula, ink dust
// Visualisation: A drifting nebula from the Ikeda map orbit cloud
// Unique mechanism: Ikeda map iteration with slow parameterized angle producing swirling scatter

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const IkedaMapNebula: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const rafRef = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 9102431 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    let x = 0.1*(rnd()*2-1), y = 0.1*(rnd()*2-1);
    const u = 0.91;
    const cx = width*0.5, cy = height*0.5;
    const scale = Math.min(width,height)*0.38;

    const render = (tms:number)=>{
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';

      const t = tms*0.001;
      for(let i=0;i<16000;i++){
        const r2 = x*x + y*y;
        const T = 0.4 - 6.0/(1.0 + r2);
        const ct = Math.cos(T), st = Math.sin(T);
        const xn = 1 + u*(x*ct - y*st);
        const yn =     u*(x*st + y*ct);
        x = xn; y = yn;
        const px = cx + x*scale;
        const py = cy + y*scale;
        if (px>=0&&px<width&&py>=0&&py<height) ctx.fillRect(px|0, py|0, 1, 1);
      }

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return ()=>{ if(rafRef.current) cancelAnimationFrame(rafRef.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return <div style={{ width:`${width}px`, height:`${height}px`, background:'#F0EEE6', overflow:'hidden' }}>
    <canvas ref={canvasRef} width={width} height={height} style={{width:'100%',height:'100%'}}/>
  </div>;
};

const metadata = {
  themes: 'ikeda,map,chaos,ink',
  visualisation: 'Swirling nebula from Ikeda map scatter',
  promptSuggestion: '1. Keep u near 0.9\n2. Many iterations\n3. Low alpha'
};
(IkedaMapNebula as any).metadata = metadata;

export default IkedaMapNebula;

// Differs from others by: Ikeda map dynamics with angle depending on radius, distinct from other 2D maps


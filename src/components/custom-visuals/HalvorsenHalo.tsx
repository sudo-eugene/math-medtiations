// Themes: Halvorsen attractor, halo, projection
// Visualisation: A halo-like ink ring from the Halvorsen attractor
// Unique mechanism: 3D Halvorsen ODE integrated and projected with gentle rotation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const HalvorsenHalo: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    const a = 1.4;
    let x = 0.1, y = 0.0, z=0.0; const dt=0.01;
    const cx = width*0.5, cy = height*0.5; const scale = Math.min(width,height)*0.18;
    const render = (tms:number)=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';
      const th = tms*0.001*0.2; const cth=Math.cos(th), sth=Math.sin(th);
      for(let i=0;i<4000;i++){
        const dx = -a*x - 4*y - 4*z - y*y;
        const dy = -a*y - 4*z - 4*x - z*z;
        const dz = -a*z - 4*x - 4*y - x*x;
        x += dx*dt; y += dy*dt; z += dz*dt;
        const X = cth*x + sth*z; const Y = y; // Z unused
        const px = cx + X*scale; const py = cy + Y*scale;
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
  themes: 'halvorsen,attractor,halo,ink',
  visualisation: 'Halvorsen halo in stippled ink',
  promptSuggestion: '1. Keep a~1.4\n2. Many samples\n3. Slow rotation'
};
(HalvorsenHalo as any).metadata = metadata;

export default HalvorsenHalo;

// Differs from others by: Halvorsen attractor’s quadratic coupling producing a halo-like projection


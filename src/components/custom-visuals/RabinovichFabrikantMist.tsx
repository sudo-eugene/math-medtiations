// Themes: Rabinovich–Fabrikant, mist, projection
// Visualisation: A delicate mist from Rabinovich–Fabrikant attractor
// Unique mechanism: Integrates the RF system and projects with slow rotation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const RabinovichFabrikantMist: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    const a=0.14, b=0.10;
    let x=0.1, y=0, z=0; const dt=0.01;
    const cx=width*0.5, cy=height*0.5; const scale=Math.min(width,height)*0.22;
    const render=(tms:number)=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';
      const th=tms*0.001*0.2; const cth=Math.cos(th), sth=Math.sin(th);
      for(let i=0;i<4000;i++){
        const dx = y*(z-1 + x*x) + a*x;
        const dy = x*(3*z + 1 - x*x) + a*y;
        const dz = -2*z*(b + x*y);
        x+=dx*dt; y+=dy*dt; z+=dz*dt;
        const X=cth*x + sth*z; const Y=y;
        const px=cx+X*scale; const py=cy+Y*scale;
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
  themes: 'rabinovich-fabrikant,attractor,mist,ink',
  visualisation: 'Rabinovich–Fabrikant misty projection',
  promptSuggestion: '1. dt≈0.01\n2. Slow rotation\n3. Low-alpha dots'
};
(RabinovichFabrikantMist as any).metadata = metadata;

export default RabinovichFabrikantMist;

// Differs from others by: Rabinovich–Fabrikant ODE’s distinctive coupled polynomial dynamics


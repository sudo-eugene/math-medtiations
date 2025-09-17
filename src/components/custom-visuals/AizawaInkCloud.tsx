// Themes: Aizawa attractor, ink cloud, projection
// Visualisation: An ink cloud from the Aizawa attractor, quietly rotating
// Unique mechanism: 3D Aizawa ODE integrated and projected to 2D with rotation

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const AizawaInkCloud: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    // Aizawa parameters
    const a=0.95, b=0.7, c=0.6, d=3.5, e=0.25, f=0.1;
    let x=0.1, y=0, z=0;
    const dt=0.01;
    const cx = width*0.5, cy = height*0.5; const scale = Math.min(width,height)*0.22;
    const render = (tms:number)=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';
      const th = tms*0.001*0.2; const cth=Math.cos(th), sth=Math.sin(th);
      for(let i=0;i<4000;i++){
        const dx = (z - b)*x - d*y;
        const dy = d*x + (z - b)*y;
        const dz = c + a*z - (z*z*z)/3 - (x*x + y*y)*(1+e*z) + f*z*x*x*x;
        x += dx*dt; y += dy*dt; z += dz*dt;
        const X =  cth*x + sth*z; const Z = -sth*x + cth*z; const Y=y;
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
  themes: 'aizawa,attractor,ink,cloud',
  visualisation: 'Aizawa attractor as a rotating ink cloud',
  promptSuggestion: '1. Many points\n2. Slow rotation\n3. Low alpha'
};
(AizawaInkCloud as any).metadata = metadata;

export default AizawaInkCloud;

// Differs from others by: Aizawa ODE dynamics projected with rotation into a stippled cloud


// Themes: Rössler attractor, ribbons, projection
// Visualisation: A rotating projection of the Rössler attractor like ribboned ink
// Unique mechanism: 3D ODE integration with simple rotating orthographic projection on Canvas

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const RosslerRibbonPortrait: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    // PRNG
    let s = 70707071>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    // Rössler params
    const a=0.2, b=0.2, c=5.7;
    let x=0.1, y=0, z=0;
    const dt=0.01;
    const cx = width*0.5, cy = height*0.5; const scale = Math.min(width,height)*0.18;
    const render = (tms:number)=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.strokeStyle='rgba(20,20,20,0.2)'; ctx.lineWidth=1;
      const th = tms*0.001*0.2; const cth=Math.cos(th), sth=Math.sin(th);
      for(let i=0;i<1500;i++){
        // Integrate Rössler
        const dx = -y - z;
        const dy = x + a*y;
        const dz = b + z*(x - c);
        x += dx*dt; y += dy*dt; z += dz*dt;
        // rotate around Y then X
        const X =  cth*x + sth*z;
        const Z = -sth*x + cth*z;
        const Y = y;
        const px = cx + X*scale; const py = cy + Y*scale;
        if (i>0) { ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+0.01,py+0.01); ctx.stroke(); }
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
  themes: 'rossler,attractor,projection,ink',
  visualisation: 'Ribbon-like rotating Rössler projection',
  promptSuggestion: '1. Thin strokes\n2. Slow rotation\n3. Small dt'
};
(RosslerRibbonPortrait as any).metadata = metadata;

export default RosslerRibbonPortrait;

// Differs from others by: Rössler ODE with rotating orthographic projection and ribbon-like accumulation


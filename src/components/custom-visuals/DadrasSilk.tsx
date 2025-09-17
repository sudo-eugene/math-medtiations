// Themes: Dadras attractor, silk, projection
// Visualisation: Silken strands from the Dadras attractor projection
// Unique mechanism: Dadras ODE integrated and orthographically projected with slow rotation

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const DadrasSilk: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    // Dadras parameters
    const a=3, b=2.7, c=1.7, d=2, e=9;
    let x=0.1, y=0, z=0; const dt=0.005;
    const cx=width*0.5, cy=height*0.5; const scale=Math.min(width,height)*0.09;
    const render=(tms:number)=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.strokeStyle='rgba(20,20,20,0.2)'; ctx.lineWidth=1;
      const th=tms*0.001*0.2; const cth=Math.cos(th), sth=Math.sin(th);
      for(let i=0;i<1800;i++){
        const dx = y - a*x + b*y*z;
        const dy = c*y - x*z + z;
        const dz = d*x*y - e*z;
        x+=dx*dt; y+=dy*dt; z+=dz*dt;
        const X=cth*x + sth*z; const Y=y;
        const px=cx+X*scale; const py=cy+Y*scale;
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(px+0.01,py+0.01); ctx.stroke();
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
  themes: 'dadras,attractor,silk,ink',
  visualisation: 'Silken Dadras strands in rotation',
  promptSuggestion: '1. Thin strokes\n2. Small dt\n3. Orthographic projection'
};
(DadrasSilk as any).metadata = metadata;

export default DadrasSilk;

// Differs from others by: Dadras ODE with quintet parameter coupling, rendered as silk-like short strokes


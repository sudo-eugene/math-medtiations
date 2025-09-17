// Themes: Thomas attractor, cyclic symmetry, mist
// Visualisation: A cyclic mist from Thomas’ attractor, softly rotating
// Unique mechanism: Thomas cyclically symmetric ODE projected with gentle rotation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const ThomasCyclicMist: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    const b = 0.19;
    let x=0.1, y=0, z=0; const dt=0.01;
    const cx=width*0.5, cy=height*0.5; const scale=Math.min(width,height)*0.3;
    const render=(tms:number)=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';
      const th=tms*0.001*0.2; const cth=Math.cos(th), sth=Math.sin(th);
      for(let i=0;i<5000;i++){
        const dx = Math.sin(y) - b*x;
        const dy = Math.sin(z) - b*y;
        const dz = Math.sin(x) - b*z;
        x+=dx*dt; y+=dy*dt; z+=dz*dt;
        const X= cth*x + sth*z; const Y=y;
        const px=cx+X*scale; const py=cy+Y*scale;
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
  themes: 'thomas,attractor,cyclic,mist',
  visualisation: 'Thomas attractor as a cyclic mist',
  promptSuggestion: '1. Use b≈0.19\n2. Many samples\n3. Soft rotation'
};
(ThomasCyclicMist as any).metadata = metadata;

export default ThomasCyclicMist;

// Differs from others by: Thomas’ cyclic symmetry ODE with sinusoidal coupling forming a misty projection


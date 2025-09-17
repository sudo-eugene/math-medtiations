// Themes: Ikeda map, smooth threads, grayscale ink
// Visualisation: Smooth threads traced by many Ikeda orbits with subtle trails
// Unique mechanism: Multi-walker Ikeda iterations drawing short line segments (no coarse bins)

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const IkedaContoursField: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s=20240914>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    const u=0.9; const cx=width*0.5, cy=height*0.5; const scale=Math.min(width,height)*0.42;
    const N=7000; const P=new Float32Array(N*4);
    const reset=(i:number)=>{ P[i*4]=(rnd()*2-1)*0.4; P[i*4+1]=(rnd()*2-1)*0.4; P[i*4+2]=P[i*4]; P[i*4+3]=P[i*4+1]; };
    for(let i=0;i<N;i++) reset(i);

    const step=(x:number,y:number)=>{ const r2=x*x+y*y; const T=0.4 - 6.0/(1.0 + r2); const ct=Math.cos(T), st=Math.sin(T); return { x: 1 + u*(x*ct - y*st), y: u*(x*st + y*ct) }; };

    const render=()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.strokeStyle='rgba(20,20,20,0.08)'; ctx.lineWidth=1;
      for(let i=0;i<N;i++){
        const x=P[i*4], y=P[i*4+1]; const p=step(x,y);
        const x1=cx+x*scale, y1=cy+y*scale; const x2=cx+p.x*scale, y2=cy+p.y*scale;
        if (x1>=0&&x1<width&&y1>=0&&y1<height&&x2>=0&&x2<width&&y2>=0&&y2<height){ ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }
        P[i*4+2]=x; P[i*4+3]=y; P[i*4]=p.x; P[i*4+1]=p.y;
        if (Math.abs(p.x)>2 || Math.abs(p.y)>2) reset(i);
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

const metadata={
  themes:'ikeda,contours,field,ink',
  visualisation:'Ikeda density field as contour-like tiles',
  promptSuggestion:'1. Coarse grid\n2. Fade bins\n3. Keep alpha low'
};
(IkedaContoursField as any).metadata=metadata;

export default IkedaContoursField;

// Differs from others by: Coarse-grid histogram of Ikeda orbit densities drawn as cells (not points)

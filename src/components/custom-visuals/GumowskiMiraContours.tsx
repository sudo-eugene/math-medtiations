// Themes: Gumowski–Mira, threads, field
// Visualisation: Fine threads traced by Gumowski–Mira orbits (no tiles)
// Unique mechanism: Many orbits rendered as short line segments with trails

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const GumowskiMiraContours: React.FC<VisualProps> = ({ width, height }) => {
  const ref=useRef<HTMLCanvasElement|null>(null);
  const raf=useRef<number|undefined>();
  useEffect(()=>{
    const canvas=ref.current; if(!canvas) return; const ctx=canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s=13572468>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    const a=0.008, b=0.05, m=-0.98; const f=(x:number)=> m*x + 2*(1-m)*x*x/(1+x*x);
    const N=7000; const P=new Float32Array(N*4);
    const reset=(i:number)=>{ P[i*4]=(rnd()*2-1)*0.6; P[i*4+1]=(rnd()*2-1)*0.6; P[i*4+2]=P[i*4]; P[i*4+3]=P[i*4+1]; };
    for(let i=0;i<N;i++) reset(i);
    const cx=width*0.5, cy=height*0.5; const scale=Math.min(width,height)*0.4;
    ctx.strokeStyle='rgba(20,20,20,0.08)'; ctx.lineWidth=1;
    const step=(x:number,y:number)=>{ const xn=y + a*(1 - b*y*y)*y + f(x); const yn=-x + f(xn); return {x:xn,y:yn}; };
    const render=()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      for(let i=0;i<N;i++){
        const x=P[i*4], y=P[i*4+1]; const p=step(x,y);
        const x1=cx+x*scale, y1=cy+y*scale, x2=cx+p.x*scale, y2=cy+p.y*scale;
        if (x1>=0&&x1<width&&y1>=0&&y1<height&&x2>=0&&x2<width&&y2>=0&&y2<height){ ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke(); }
        P[i*4+2]=x; P[i*4+3]=y; P[i*4]=p.x; P[i*4+1]=p.y;
        if (Math.abs(p.x)>4 || Math.abs(p.y)>4) reset(i);
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
  themes:'gumowski-mira,contours,field,ink',
  visualisation:'Gumowski–Mira density tiles as soft contours',
  promptSuggestion:'1. Fade bins\n2. Coarse tiles\n3. Keep alpha subtle'
};
(GumowskiMiraContours as any).metadata=metadata;

export default GumowskiMiraContours;

// Differs from others by: Gumowski–Mira density accumulated into contour-like tiles instead of points

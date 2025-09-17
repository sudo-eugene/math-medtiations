// Themes: Tinkerbell, feather field, particles
// Visualisation: Smooth particle field from the Tinkerbell map with subtle trails
// Unique mechanism: Many orbits of the Tinkerbell map drawn as segments with respawn

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const TinkerbellBasinField: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s=56565657>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    const a=0.9, b=-0.6013, c=2.0, d=0.5;
    const N=7000; const P=new Float32Array(N*4);
    const reset=(i:number)=>{ P[i*4]= (rnd()*2-1)*0.8; P[i*4+1]=(rnd()*2-1)*0.8; P[i*4+2]=P[i*4]; P[i*4+3]=P[i*4+1]; };
    for(let i=0;i<N;i++) reset(i);
    const xmin=-2, xmax=2, ymin=-2, ymax=2;

    const render=()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.strokeStyle='rgba(20,20,20,0.08)'; ctx.lineWidth=1;
      for(let i=0;i<N;i++){
        const x=P[i*4], y=P[i*4+1];
        const xn = x*x - y*y + a*x + b*y;
        const yn = 2*x*y + c*x + d*y;
        const px=(x - xmin)/(xmax-xmin)*width, py=(y - ymin)/(ymax-ymin)*height;
        const qx=(xn - xmin)/(xmax-xmin)*width, qy=(yn - ymin)/(ymax-ymin)*height;
        if (px>=0&&px<width&&py>=0&&py<height&&qx>=0&&qx<width&&qy>=0&&qy<height){ ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(qx,qy); ctx.stroke(); }
        P[i*4+2]=x; P[i*4+3]=y; P[i*4]=xn; P[i*4+1]=yn;
        if (xn*xn + yn*yn > 1000) reset(i);
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
  themes: 'tinkerbell,basins,field,fractal',
  visualisation: 'Grayscale field of Tinkerbell convergence',
  promptSuggestion: '1. Coarse grid\n2. Fixed iteration budget\n3. Grayscale ramp'
};
(TinkerbellBasinField as any).metadata = metadata;

export default TinkerbellBasinField;

// Differs from others by: Convergence field of a Tinkerbell-like map on a coarse buffer

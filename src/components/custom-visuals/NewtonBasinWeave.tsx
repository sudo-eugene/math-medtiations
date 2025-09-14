// Themes: Newton fractal, basins, weave
// Visualisation: Smooth line segments trace Newton’s method trajectories for z^3-1
// Unique mechanism: Thousands of random seeds iterated with Newton updates, drawing short segments instead of raster

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const NewtonBasinWeave: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s=135791357>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    const xmin=-2, xmax=2, ymin=-2, ymax=2; const N=6000; const tol=1e-6;
    // particles: x,y,px,py
    const P = new Float32Array(N*4);
    const reset=(i:number)=>{ P[i*4] = xmin + rnd()*(xmax-xmin); P[i*4+1] = ymin + rnd()*(ymax-ymin); P[i*4+2]=P[i*4]; P[i*4+3]=P[i*4+1]; };
    for(let i=0;i<N;i++) reset(i);

    ctx.strokeStyle='rgba(20,20,20,0.08)'; ctx.lineWidth=1;
    const render=()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      for(let i=0;i<N;i++){
        let x=P[i*4], y=P[i*4+1];
        // Newton step for f(z)=z^3-1
        const r=Math.hypot(x,y); if (r===0){ reset(i); continue; }
        const th=Math.atan2(y,x); const rn=r*r; const re=rn*Math.cos(2*th), im=rn*Math.sin(2*th);
        const f_re = x*re - y*im - 1, f_im = x*im + y*re; const df_re=3*re, df_im=3*im;
        const denom = df_re*df_re + df_im*df_im; if (!isFinite(denom) || denom===0){ reset(i); continue; }
        const nx = x - (f_re*df_re + f_im*df_im)/denom; const ny = y - (f_im*df_re - f_re*df_im)/denom;

        const px = (x - xmin)/(xmax-xmin)*width; const py=(y - ymin)/(ymax-ymin)*height;
        const qx = (nx - xmin)/(xmax-xmin)*width; const qy=(ny - ymin)/(ymax-ymin)*height;
        if (px>=0&&px<width&&py>=0&&py<height&&qx>=0&&qx<width&&qy>=0&&qy<height){ ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(qx,qy); ctx.stroke(); }
        P[i*4+2]=x; P[i*4+3]=y; P[i*4]=nx; P[i*4+1]=ny;
        if (Math.hypot(nx-x, ny-y) < tol) reset(i);
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
  themes: 'newton,basins,fractal,ink',
  visualisation: 'Newton basins (z^3-1) in grayscale weave',
  promptSuggestion: '1. Offscreen grid\n2. Iteration shading\n3. Neutral tones'
};
(NewtonBasinWeave as any).metadata = metadata;

export default NewtonBasinWeave;

// Differs from others by: Newton method root basins for z^3-1 rendered with iteration-count grayscale

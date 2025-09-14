// Themes: Julia set, orbit trap, whisper
// Visualisation: Particle orbits of a fixed Julia map, drawing only when near the trap
// Unique mechanism: Many particles iterate z^2+c; when within trap radius, mark positions with soft ink

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const JuliaOrbitTrapWhisper: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s=80808081>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    const cr=-0.74543, ci=0.11301; const trapR2=0.03*0.03; const xmin=-1.6,xmax=1.6,ymin=-1.2,ymax=1.2;
    const N=7000; const P=new Float32Array(N*2);
    const reset=(i:number)=>{ const r=0.4+0.5*rnd(); const a=rnd()*Math.PI*2; P[i*2]=Math.cos(a)*r; P[i*2+1]=Math.sin(a)*r; };
    for(let i=0;i<N;i++) reset(i);

    const render=()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.06)';
      for(let i=0;i<N;i++){
        let zr=P[i*2], zi=P[i*2+1];
        const zr2 = zr*zr - zi*zi + cr; const zi2 = 2*zr*zi + ci; zr=zr2; zi=zi2;
        P[i*2]=zr; P[i*2+1]=zi;
        const r2=zr*zr+zi*zi;
        if (r2<trapR2){
          const x=(zr - xmin)/(xmax-xmin)*width; const y=(zi - ymin)/(ymax-ymin)*height;
          if (x>=0&&x<width&&y>=0&&y<height) ctx.fillRect(x|0,y|0,1,1);
        }
        if (r2>9) reset(i);
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
  themes: 'julia,orbit-trap,ink,fractal',
  visualisation: 'Julia orbit-trap whisper on parchment',
  promptSuggestion: '1. Coarse buffer\n2. Small trap radius\n3. Neutral grayscale'
};
(JuliaOrbitTrapWhisper as any).metadata = metadata;

export default JuliaOrbitTrapWhisper;

// Differs from others by: Julia set with orbit-trap criterion, static offscreen render

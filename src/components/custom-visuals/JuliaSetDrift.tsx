// Themes: Julia set, particles, drift
// Visualisation: Thousands of particles iterate under z^2+c(t), drawing smooth trails
// Unique mechanism: Particle orbits in a drifting Julia set, with respawn on escape

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const JuliaSetDrift: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 90919191>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    const N = 6000;
    // Each particle: zr, zi (current), pr, pi (prev for line)
    const parts = new Float32Array(N*4);
    const reset = (i:number)=>{
      // spawn in a ring
      const r = 0.4 + 0.4*rnd(); const a = rnd()*Math.PI*2;
      parts[i*4] = Math.cos(a)*r;
      parts[i*4+1] = Math.sin(a)*r;
      parts[i*4+2] = parts[i*4];
      parts[i*4+3] = parts[i*4+1];
    };
    for(let i=0;i<N;i++) reset(i);
    const xmin=-1.6, xmax=1.6, ymin=-1.2, ymax=1.2;

    const render = (tms:number)=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.strokeStyle='rgba(20,20,20,0.08)'; ctx.lineWidth=1;
      const t = tms*0.001;
      const cr = -0.8 + 0.2*Math.cos(t*0.2);
      const ci =  0.156 + 0.1*Math.sin(t*0.17);

      for(let i=0;i<N;i++){
        const zr = parts[i*4], zi = parts[i*4+1];
        const pr = parts[i*4+2], pi = parts[i*4+3];
        // iterate
        const zr2 = zr*zr - zi*zi + cr;
        const zi2 = 2*zr*zi + ci;
        parts[i*4+2] = zr; parts[i*4+3] = zi; // prev
        parts[i*4] = zr2; parts[i*4+1] = zi2;
        // draw segment
        const x1 = (pr - xmin)/(xmax-xmin)*width; const y1 = (pi - ymin)/(ymax-ymin)*height;
        const x2 = (zr2 - xmin)/(xmax-xmin)*width; const y2 = (zi2 - ymin)/(ymax-ymin)*height;
        if (x1>=0&&x1<width&&y1>=0&&y1<height&&x2>=0&&x2<width&&y2>=0&&y2<height){
          ctx.beginPath(); ctx.moveTo(x1,y1); ctx.lineTo(x2,y2); ctx.stroke();
        }
        // respawn if escaped
        if (zr2*zr2 + zi2*zi2 > 9) reset(i);
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
  themes: 'julia,complex,fractal,ink',
  visualisation: 'Drifting Julia set rendered softly',
  promptSuggestion: '1. Low-res buffer\n2. Slow c modulation\n3. Desaturate to gray'
};
(JuliaSetDrift as any).metadata = metadata;

export default JuliaSetDrift;

// Differs from others by: Julia set with animated parameter c drawn via a coarse offscreen buffer

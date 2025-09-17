// Themes: phyllotaxis, sunflower, drift
// Visualisation: A planar sunflower lattice breathes and drifts
// Unique mechanism: Vogel phyllotaxis on plane rendered as gently drifting dots

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const PhyllotaxisSunflowerDrift: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 31427183>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    const N = 6000; const pts = new Float32Array(N*2);
    const ga = Math.PI*(3 - Math.sqrt(5));
    for(let i=0;i<N;i++){
      const r = Math.sqrt(i/N);
      const a = i*ga;
      pts[i*2] = r*Math.cos(a);
      pts[i*2+1] = r*Math.sin(a);
    }
    const cx = width*0.5, cy = height*0.5; const R = Math.min(width,height)*0.46;
    const render = (tms:number)=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      const t = tms*0.001; const breathe = 0.92 + 0.06*Math.sin(t*0.5);
      ctx.fillStyle='rgba(20,20,20,0.28)';
      for(let i=0;i<N;i++){
        const x = cx + pts[i*2]*R*breathe;
        const y = cy + pts[i*2+1]*R*breathe;
        ctx.fillRect(x|0, y|0, 1, 1);
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
  themes: 'phyllotaxis,sunflower,points,ink',
  visualisation: 'Planar phyllotaxis breathing gently',
  promptSuggestion: '1. Use golden angle\n2. Breathe radius\n3. One-pixel dots'
};
(PhyllotaxisSunflowerDrift as any).metadata = metadata;

export default PhyllotaxisSunflowerDrift;

// Differs from others by: Planar Vogel phyllotaxis (not spherical) with breathing radius


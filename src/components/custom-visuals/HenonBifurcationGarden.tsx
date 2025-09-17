// Themes: bifurcation diagram, logistic/henon family, reveal
// Visualisation: A calm reveal of a bifurcation garden (1D logistic map style)
// Unique mechanism: Progressive drawing of bifurcation diagram via many seeds at each parameter

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const HenonBifurcationGarden: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 51515151>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    let r = 2.5; // logistic parameter start
    const render=()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.08)';
      // draw a column of samples for current r
      const samples = 300;
      for(let i=0;i<samples;i++){
        let x = rnd();
        // iterate to settle
        for(let k=0;k<100;k++) x = r*x*(1-x);
        // plot last few iterates
        for(let k=0;k<20;k++){ x = r*x*(1-x); const px = ((r-2.5)/(4.0-2.5))*width; const py = (1-x)*height; ctx.fillRect(px|0, py|0, 1, 1); }
      }
      r += 0.002; if (r>4.0) r=2.5;
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
  themes: 'bifurcation,logistic,diagram,ink',
  visualisation: 'Logistic map bifurcation revealed as a garden',
  promptSuggestion: '1. Thin dots\n2. Sweep r slowly\n3. Fade gently'
};
(HenonBifurcationGarden as any).metadata = metadata;

export default HenonBifurcationGarden;

// Differs from others by: Parameter sweep bifurcation diagram rather than orbit scatter or ODE


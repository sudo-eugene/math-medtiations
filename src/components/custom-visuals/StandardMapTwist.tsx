// Themes: standard map, toral twist, scatter
// Visualisation: Twisting scatter from the Chirikov standard map on a torus
// Unique mechanism: Iteration on [0,2π)^2 with wrap; projected as a stippled field

import React, { useEffect, useRef } from 'react';
import { VisualProps } from '../../types';

const StandardMapTwist: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 66779933 >>> 0; const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    let theta = rnd()*Math.PI*2; let p = (rnd()*2-1)*0.2; const K = 0.9;
    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';
      for (let i=0;i<22000;i++){
        p = p + K*Math.sin(theta); theta = theta + p; // implicit mod 2π for theta visualization via sin/cos
        // map to square via unit circle embedding
        const x = (Math.cos(theta)+1)*0.5; const y = (Math.sin(theta)+1)*0.5;
        const px = (x*width)|0; const py = (y*height)|0;
        ctx.fillRect(px, py, 1, 1);
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
  themes: 'standard-map,twist,torus,ink',
  visualisation: 'Twisting dots from the standard map',
  promptSuggestion: '1. Keep K near 1\n2. Many steps\n3. Very low alpha'
};
(StandardMapTwist as any).metadata = metadata;

export default StandardMapTwist;

// Differs from others by: Chirikov standard map on a torus, visualized via angle embedding


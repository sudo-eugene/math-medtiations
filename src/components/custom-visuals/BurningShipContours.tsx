// Themes: burning ship, buddhabrot-like particles, grayscale ink
// Visualisation: Escape trajectories of the Burning Ship set accumulate as smooth ink particles
// Unique mechanism: Particle Buddhabrot for Burning Ship (|Re,Im| in iteration), with soft trails

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const BurningShipContours: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 20240916>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    const xmin=-2.2, xmax=1.3, ymin=-2.2, ymax=0.6;
    const maxIter=180;

    const render = ()=>{
      // Soft pencil trail fade
      ctx.fillStyle='rgba(240,238,230,0.01)'; ctx.fillRect(0,0,width,height);
      // Soft pencil-like dark grey with higher opacity
      ctx.fillStyle='rgba(25,25,28,0.45)';
      const samples=160;
      for(let n=0;n<samples;n++){
        const cr = xmin + rnd()*(xmax-xmin);
        const ci = ymin + rnd()*(ymax-ymin);
        let zr=0, zi=0; const pathX:number[]=[]; const pathY:number[]=[]; let escaped=false;
        for(let k=0;k<maxIter;k++){
          const azr=Math.abs(zr), azi=Math.abs(zi);
          const zr2 = azr*azr - azi*azi + cr;
          const zi2 = 2*azr*azi + ci;
          zr=zr2; zi=zi2; pathX.push(zr); pathY.push(zi);
          if (zr*zr+zi*zi>4){ escaped=true; break; }
        }
        if(escaped){
          for(let i=0;i<pathX.length;i++){
            const x = (pathX[i]-xmin)/(xmax-xmin)*width;
            const y = (pathY[i]-ymin)/(ymax-ymin)*height;
            if (x>=0&&x<width&&y>=0&&y<height) ctx.fillRect(x|0,y|0,1,1);
          }
        }
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
  themes: 'burning-ship,buddhabrot,ink',
  visualisation: 'Burning Ship escape trajectories in ink particles',
  promptSuggestion: '1. Sample many c\n2. Accumulate paths\n3. Soft trails'
};
(BurningShipContours as any).metadata = metadata;

export default BurningShipContours;

// Differs from others by: Burning Ship absolute-value iteration rendered via coarse buffer

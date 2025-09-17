// Themes: Buddhabrot, orbit accumulation, drift
// Visualisation: A faint Buddhabrot-like dust accumulates slowly
// Unique mechanism: Random sample orbits, accumulate escape trajectories (very low budget per frame)

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const MandelbrotBuddhabrotDrift: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 42420001>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    const bounds = { xmin: -2.2, xmax: 1.2, ymin: -1.6, ymax: 1.6 };
    const mapToPixel = (zr:number, zi:number)=>{
      const x = (zr - bounds.xmin) / (bounds.xmax - bounds.xmin) * width;
      const y = (zi - bounds.ymin) / (bounds.ymax - bounds.ymin) * height;
      return {x, y};
    };
    const maxIter = 200;

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.03)';
      // few random samples per frame to keep it light
      for(let sidx=0;sidx<120;sidx++){
        const cr = bounds.xmin + rnd()*(bounds.xmax - bounds.xmin);
        const ci = bounds.ymin + rnd()*(bounds.ymax - bounds.ymin);
        // iterate once to test if it escapes, and if so accumulate the path
        let zr=0, zi=0; let escaped=false; let path: {x:number,y:number}[] = [];
        for(let k=0;k<maxIter;k++){
          const zr2 = zr*zr - zi*zi + cr; const zi2 = 2*zr*zi + ci; zr=zr2; zi=zi2;
          path.push({x:zr, y:zi});
          if (zr*zr + zi*zi > 4){ escaped=true; break; }
        }
        if (escaped){
          for(const p of path){
            const px = mapToPixel(p.x, p.y); const x = px.x|0, y = px.y|0;
            if (x>=0&&x<width&&y>=0&&y<height) ctx.fillRect(x,y,1,1);
          }
        }
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
  themes: 'buddhabrot,mandelbrot,orbits,ink',
  visualisation: 'Faint Buddhabrot dust accumulating over time',
  promptSuggestion: '1. Low sample budget\n2. Very low alpha\n3. Let it settle'
};
(MandelbrotBuddhabrotDrift as any).metadata = metadata;

export default MandelbrotBuddhabrotDrift;

// Differs from others by: Buddhabrot-like accumulation of escape trajectories sampled randomly


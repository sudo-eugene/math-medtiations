// Themes: complex dynamics, orbit trap, buddhabrot-like particles
// Visualisation: Thousands of smooth particle orbits reveal Mandelbrot structure with soft trails
// Unique mechanism: Orbit-trap filtered Buddhabrot — sample many c, accumulate escape trajectories as moving particles

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const MandelbrotOrbitTrapInk: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    // Seeded PRNG
    let s = 20240915 >>> 0;
    const rnd = () => (s = (1664525*s + 1013904223)>>>0, s/4294967296);

    // Sampling region in complex plane
    const bounds = { xmin: -2.2, xmax: 1.1, ymin: -1.5, ymax: 1.5 };
    const trapR2 = 0.02*0.02; // orbit trap near origin
    const maxIter = 200;

    // Render loop: sample a handful of c per frame and accumulate their escape trajectories
    const render = () => {
      // Soft trail
      ctx.fillStyle = 'rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle = 'rgba(20,20,20,0.05)';

      const samples = 160; // per frame
      for (let n=0;n<samples;n++){
        const cr = bounds.xmin + rnd()*(bounds.xmax - bounds.xmin);
        const ci = bounds.ymin + rnd()*(bounds.ymax - bounds.ymin);
        let zr = 0, zi = 0;
        // Track path
        const pathX:number[] = []; const pathY:number[] = [];
        let trapped = false; let escaped = false;
        for (let k=0;k<maxIter;k++){
          const zr2 = zr*zr - zi*zi + cr;
          const zi2 = 2*zr*zi + ci;
          zr = zr2; zi = zi2;
          const r2 = zr*zr + zi*zi;
          pathX.push(zr); pathY.push(zi);
          if (!trapped && r2 < trapR2) trapped = true;
          if (r2 > 4){ escaped = true; break; }
        }
        if (escaped && trapped){
          for (let i=0;i<pathX.length;i++){
            const x = (pathX[i] - bounds.xmin) / (bounds.xmax - bounds.xmin) * width;
            const y = (pathY[i] - bounds.ymin) / (bounds.ymax - bounds.ymin) * height;
            if (x>=0 && x<width && y>=0 && y<height) ctx.fillRect(x|0, y|0, 1, 1);
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
  themes: 'mandelbrot,orbit-trap,buddhabrot,ink',
  visualisation: 'Orbit-trap filtered Buddhabrot particles in ink',
  promptSuggestion: '1. Sample many c\n2. Draw escape paths\n3. Use soft trails'
};
(MandelbrotOrbitTrapInk as any).metadata = metadata;

export default MandelbrotOrbitTrapInk;

// Differs from others by: Mandelbrot orbit-trap criterion on coarse buffer with ink-like upscale

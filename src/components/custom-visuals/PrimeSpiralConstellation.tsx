// Themes: primes, numeracy, spiral lattice
// Visualisation: Prime points reveal along a growing spiral radius
// Unique mechanism: Ulam spiral with sieve primes, animated radial reveal

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const PrimeSpiralConstellation: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 7777777 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const step = Math.max(3, Math.floor(Math.min(width,height)/180)); // pixel step per spiral cell
    const cells = Math.min(181, ((Math.min(width,height)/step)|0)|1); // odd size
    const half = (cells-1)/2;
    const total = cells*cells;

    // Sieve
    const isPrime = new Uint8Array(total);
    isPrime.fill(1); if (total>0) isPrime[0]=0; if (total>1) isPrime[1]=0;
    for (let p=2;p*p<total;p++){
      if (isPrime[p]){
        for (let k=p*p;k<total;k+=p) isPrime[k]=0;
      }
    }

    // Map n to (x,y) on Ulam spiral
    const toXY = (n:number)=>{
      if (n===0) return {x:0,y:0};
      const k = Math.ceil((Math.sqrt(n+1)-1)/2);
      const t = 2*k+1;
      const m = t*t;
      const t2 = t-1;
      let x=0,y=0;
      if (n >= m - t2){ x = k - (m - n); y = -k; }
      else if (n >= m - 2*t2){ x = -k; y = -k + (m - t2 - n); }
      else if (n >= m - 3*t2){ x = -k + (m - 2*t2 - n); y = k; }
      else { x = k; y = k - (m - 3*t2 - n); }
      return {x,y};
    };

    const primes: {x:number,y:number,r:number}[] = [];
    let maxR = 0;
    for(let n=0;n<total;n++){
      if (isPrime[n]){
        const p = toXY(n);
        const px = width*0.5 + p.x*step;
        const py = height*0.5 + p.y*step;
        const r = Math.hypot(px - width*0.5, py - height*0.5);
        primes.push({x:px,y:py,r});
        if (r > maxR) maxR = r;
      }
    }
    primes.sort((a,b)=>a.r-b.r);

    let reveal = 0; // radius reveal
    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);
      reveal += 0.8;

      ctx.fillStyle='rgba(20,20,20,0.35)';
      for(const p of primes){
        if (p.r < reveal) ctx.fillRect(p.x|0, p.y|0, 1, 1);
      }
      if (reveal > maxR) reveal = 0;

      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);

    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return <div style={{width:`${width}px`,height:`${height}px`,background:'#F0EEE6',overflow:'hidden'}}>
    <canvas ref={ref} width={width} height={height} style={{width:'100%',height:'100%'}}/>
  </div>
};

const metadata = {
  themes: "primes,ulam,spiral,ink,calm",
  visualisation: "Ulam spiral primes revealed by a breathing radius",
  promptSuggestion: "1. Keep step small\n2. Gentle reveal loop\n3. Very small dots"
};
(PrimeSpiralConstellation as any).metadata = metadata;

export default PrimeSpiralConstellation;

// Differs from others by: Ulam spiral mapping with sieve-driven prime reveal


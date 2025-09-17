// Themes: space-filling, procession, ink trail
// Visualisation: Dots glide in procession along a Hilbert path, leaving trails
// Unique mechanism: Discrete Hilbert curve generation with multiple sliding markers

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const HilbertCaravan: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 246813579 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const order = 6; // 64x64 cells
    const N = 1<<order;
    const path: {x:number,y:number}[] = [];
    // Hilbert index to xy
    function hilbertIndexToXY(index:number, n:number){
      let x=0,y=0;
      for (let s=1, t=index; s<n; s<<=1){
        const rx = 1 & (t>>1);
        const ry = 1 & (t ^ rx);
        // Rotate
        if (ry===0){
          if (rx===1){ x = s-1 - x; y = s-1 - y; }
          [x,y] = [y,x];
        }
        x += s*rx;
        y += s*ry;
        t >>= 2;
      }
      return {x,y};
    }
    for (let i=0;i<N*N;i++){
      const p = hilbertIndexToXY(i, N);
      path.push(p);
    }

    // Scale path to canvas with margin
    const margin = Math.min(width, height)*0.08;
    const scale = Math.min((width-2*margin)/(N-1), (height-2*margin)/(N-1));
    for (const p of path){
      p.x = margin + p.x*scale;
      p.y = margin + p.y*scale;
    }

    // Markers
    const M = 220;
    const positions = new Float32Array(M);
    for(let i=0;i<M;i++) positions[i] = (i* (path.length/M))|0;

    const render = ()=>{
      // Trails
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);

      ctx.strokeStyle='rgba(20,20,20,0.2)';
      ctx.lineWidth = 1;

      for(let i=0;i<M;i++){
        const a = positions[i]|0;
        const b = (a+1)%path.length;
        const p0 = path[a], p1 = path[b];
        ctx.beginPath();
        ctx.moveTo(p0.x, p0.y);
        ctx.lineTo(p1.x, p1.y);
        ctx.stroke();
        positions[i] = (positions[i] + 0.5) % path.length;
      }

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
  themes: "space-filling,h(b)curve,procession,trails",
  visualisation: "Procession along a Hilbert curve leaving soft trails",
  promptSuggestion: "1. Set order modest\n2. Many markers\n3. Thin lines"
};
(HilbertCaravan as any).metadata = metadata;

export default HilbertCaravan;

// Differs from others by: Hilbert curve traversal with multiple sliding markers


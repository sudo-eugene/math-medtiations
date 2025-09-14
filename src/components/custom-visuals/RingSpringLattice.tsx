// Themes: elasticity, ripple, ring
// Visualisation: A polygonal ring ripples like a soft spring lattice
// Unique mechanism: Mass–spring ring dynamics with damping and centroid anchoring

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const RingSpringLattice: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 24680246 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const N = 120;
    const cx = width*0.5, cy = height*0.5;
    const R = Math.min(width,height)*0.32;
    const x = new Float32Array(N), y=new Float32Array(N);
    const vx = new Float32Array(N), vy=new Float32Array(N);
    for(let i=0;i<N;i++){
      const a = i/N * Math.PI*2;
      x[i] = cx + Math.cos(a)*R*(0.98 + rnd()*0.04);
      y[i] = cy + Math.sin(a)*R*(0.98 + rnd()*0.04);
      vx[i]=0; vy[i]=0;
    }

    const k = 0.02; // spring to neighbors
    const kd = 0.1; // damping
    const kr = 0.0008; // restore toward ideal circle
    const dt = 1.0;

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);
      // integrate
      for(let i=0;i<N;i++){
        const ip = (i+1)%N, im=(i-1+N)%N;
        const ax = (x[ip]+x[im]-2*x[i])*k - vx[i]*kd + (cx + (x[i]-cx)*(R/Math.hypot(x[i]-cx,y[i]-cy)) - x[i]) * kr;
        const ay = (y[ip]+y[im]-2*y[i])*k - vy[i]*kd + (cy + (y[i]-cy)*(R/Math.hypot(x[i]-cx,y[i]-cy)) - y[i]) * kr;
        vx[i]+=ax*dt; vy[i]+=ay*dt;
      }
      for(let i=0;i<N;i++){ x[i]+=vx[i]*dt; y[i]+=vy[i]*dt; }

      // draw polygon
      ctx.strokeStyle='rgba(20,20,20,0.25)';
      ctx.lineWidth=1.2;
      ctx.beginPath();
      ctx.moveTo(x[0],y[0]);
      for(let i=1;i<N;i++) ctx.lineTo(x[i],y[i]);
      ctx.closePath(); ctx.stroke();

      raf.current = requestAnimationFrame(render);
    };
    raf.current = requestAnimationFrame(render);

    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return <div style={{width:`${width}px`,height:`${height}px`,background:'#F0EEE6',overflow:'hidden'}}>
    <canvas ref={ref} width={width} height={height} style={{width:'100%',height:'100%'}}/>
  </div>;
};

const metadata = {
  themes: "spring,ring,ripple,elastic",
  visualisation: "Soft polygonal ring rippling",
  promptSuggestion: "1. Keep damping high\n2. Many nodes\n3. Thin strokes"
};
(RingSpringLattice as any).metadata = metadata;

export default RingSpringLattice;

// Differs from others by: mass–spring ring dynamics with centroidal restoration


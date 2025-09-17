// Themes: field lines, polarity, elegant threading
// Visualisation: Streamlines weave between two poles with calm motion
// Unique mechanism: Runge–Kutta-like streamline stepping in analytic dipole field

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const DipoleFieldChoreography: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 20240501 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const centerX = width*0.5, centerY = height*0.5;
    const sep = Math.min(width,height)*0.18;
    const pos = {x:centerX - sep, y:centerY};
    const neg = {x:centerX + sep, y:centerY};

    const N = 900;
    const lines = new Float32Array(N*4); // x,y,vx,vy
    for(let i=0;i<N;i++){
      const a = (i/N) * Math.PI*2;
      const r = Math.min(width,height)*0.02 + rnd()*10;
      lines[i*4] = pos.x + Math.cos(a)*r;
      lines[i*4+1] = pos.y + Math.sin(a)*r;
      lines[i*4+2] = 0; lines[i*4+3] = 0;
    }

    const field = (x:number,y:number)=>{
      const ex = (x-pos.x), ey = (y-pos.y);
      const fx = -(x-neg.x), fy = -(y-neg.y);
      const r1 = ex*ex + ey*ey + 1;
      const r2 = fx*fx + fy*fy + 1;
      // Electric-like field: E = +r1^-3/2 * r1_vec + (-) r2^-3/2 * r2_vec
      const a1 = 1/Math.pow(r1, 1.5);
      const a2 = 1/Math.pow(r2, 1.5);
      const Ex = ex*a1 + fx*a2;
      const Ey = ey*a1 + fy*a2;
      const L = Math.hypot(Ex,Ey)+1e-6;
      return {x: Ex/L, y: Ey/L};
    };

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);
      ctx.strokeStyle='rgba(20,20,20,0.2)';
      ctx.lineWidth=1;

      for(let i=0;i<N;i++){
        let x = lines[i*4], y=lines[i*4+1];
        const v = field(x,y);
        const h = 0.8;
        const midx = x + v.x*h*0.5, midy = y + v.y*h*0.5;
        const vm = field(midx, midy);
        const nx = x + vm.x*h, ny = y + vm.y*h;

        ctx.beginPath();
        ctx.moveTo(x,y); ctx.lineTo(nx,ny); ctx.stroke();

        lines[i*4] = nx; lines[i*4+1] = ny;

        // Respawn if out of bounds or near negative pole
        if (nx<0||nx>width||ny<0||ny>height || Math.hypot(nx-neg.x, ny-neg.y) < 6){
          const a = rnd()*Math.PI*2;
          const r = Math.min(width,height)*0.02 + rnd()*8;
          lines[i*4] = pos.x + Math.cos(a)*r;
          lines[i*4+1] = pos.y + Math.sin(a)*r;
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
  themes: "field-lines,dipole,streamlines,calm",
  visualisation: "Elegant streamlines threading between two poles",
  promptSuggestion: "1. Keep step small\n2. Many seeds\n3. Light, thin strokes"
};
(DipoleFieldChoreography as any).metadata = metadata;

export default DipoleFieldChoreography;

// Differs from others by: analytic dipole vector field with streamline integration


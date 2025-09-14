// Themes: vortices, flow, particle ink
// Visualisation: Particles trace crystalline swirls around fixed vortex points
// Unique mechanism: Curl field from multiple vortices advecting particles

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const VortexCrystalFlow: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();

  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height;
    ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 31427182 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    const V = 7;
    const vort = Array.from({length:V}, (_,i)=>{
      const ang = i*(Math.PI*2/V);
      const r = Math.min(width,height)*0.3;
      return {
        x: width*0.5 + Math.cos(ang)*r,
        y: height*0.5 + Math.sin(ang)*r,
        strength: (i%2===0?1:-1) * (0.8 + rnd()*0.4)
      };
    });

    const P = 1600;
    const px = new Float32Array(P), py=new Float32Array(P);
    for(let i=0;i<P;i++){
      px[i] = rnd()*width; py[i]=rnd()*height;
    }

    const field = (x:number,y:number)=>{
      let vx = 0, vy = 0;
      for(const v of vort){
        const dx = x - v.x, dy = y - v.y;
        const d2 = dx*dx + dy*dy + 25;
        const inv = 1/d2;
        // Perpendicular (curl): rotate by 90 degrees
        vx += v.strength * (-dy) * inv;
        vy += v.strength * (dx) * inv;
      }
      const L = Math.hypot(vx,vy)+1e-6;
      return {x: vx/L, y: vy/L};
    };

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);
      ctx.strokeStyle='rgba(20,20,20,0.15)';
      ctx.lineWidth=1;

      for(let i=0;i<P;i++){
        const x = px[i], y=py[i];
        const v = field(x,y);
        const h = 0.9;
        const nx = x + v.x*h, ny = y + v.y*h;
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(nx,ny); ctx.stroke();
        px[i]=nx; py[i]=ny;
        if (nx<0||nx>width||ny<0||ny>height){
          px[i] = width*0.5 + (rnd()-0.5)*20;
          py[i] = height*0.5 + (rnd()-0.5)*20;
        }
      }

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
  themes: "vortices,particles,flow,ink",
  visualisation: "Crystal of vortices with ink particles tracing flow",
  promptSuggestion: "1. Alternate vortex signs\n2. Slow speeds\n3. Thin strokes"
};
(VortexCrystalFlow as any).metadata = metadata;

export default VortexCrystalFlow;

// Differs from others by: particle advection in multi-vortex curl vector field


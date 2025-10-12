// Themes: strange attractor, woven ribbon, ink haze
// Visualisation: A woven attractor emerges as soft ink ribbons
// Unique mechanism: Clifford attractor iterated orbit plotting with low-alpha accumulation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const CliffordWeave: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const rafRef = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = canvasRef.current; if(!canvas) return;
    const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width = width; canvas.height = height;
    ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);

    // PRNG
    let s = 271828183 >>> 0;
    const rnd = () => (s=(1664525*s+1013904223)>>>0, s/4294967296);

    // Clifford params chosen for aesthetic
    const a = -1.4 + (rnd()*0.1 - 0.05);
    const b = 1.6 + (rnd()*0.1 - 0.05);
    const c = 1.0 + (rnd()*0.1 - 0.05);
    const d = 0.7 + (rnd()*0.1 - 0.05);

    let x = (rnd()*2 - 1)*0.1, y = (rnd()*2 - 1)*0.1;
    const scale = Math.min(width, height) * 0.25;
    const cx = width*0.4, cy = height*0.5;

    let frameCount = 0;
    const render = ()=>{
      // Trails
      ctx.fillStyle = 'rgba(240,238,230,0.04)';
      ctx.fillRect(0,0,width,height);

      ctx.fillStyle = frameCount < 240 ? 'rgba(18,18,18,0.05)' : 'rgba(20,20,20,0.08)';
      // Plot many points per frame
      const iterations = frameCount < 60 ? 24000 : 20000;
      for(let i=0;i<iterations;i++){
        const nx = Math.sin(a*y) + c*Math.cos(a*x);
        const ny = Math.sin(b*x) + d*Math.cos(b*y);
        x = nx; y = ny;
        const px = cx + x*scale, py = cy + y*scale;
        if (px>=0 && px<width && py>=0 && py<height) {
          ctx.fillRect(px|0, py|0, 1, 1);
        }
      }
      frameCount++;

      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return ()=>{ if(rafRef.current) cancelAnimationFrame(rafRef.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return <div style={{width:`${width}px`,height:`${height}px`,background:'#F0EEE6',overflow:'hidden'}}>
    <canvas ref={canvasRef} width={width} height={height} style={{width:'100%',height:'100%'}} />
  </div>
};

const metadata = {
  themes: "attractor,chaos,ink,weave,soft",
  visualisation: "Clifford attractor woven into soft ribbons",
  promptSuggestion: "1. Keep alpha very low\n2. Avoid bright spots\n3. Favor dense overlap"
};
(CliffordWeave as any).metadata = metadata;

export default CliffordWeave;

// Differs from others by: Clifford strange attractor orbit plotting as the primary mechanism

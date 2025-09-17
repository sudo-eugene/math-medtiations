// Themes: chaotic map, bloom, filigree
// Visualisation: Filigree patterns bloom from a Gumowski–Mira orbit cloud
// Unique mechanism: Gumowski–Mira map with nonlinearity f(x) and low-alpha scatter

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const GumowskiMiraBloom: React.FC<VisualProps> = ({ width, height }) => {
  const canvasRef = useRef<HTMLCanvasElement|null>(null);
  const rafRef = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = canvasRef.current; if (!canvas) return;
    const ctx = canvas.getContext('2d'); if (!ctx) return;
    canvas.width = width; canvas.height = height;
    ctx.fillStyle = '#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s = 77338855 >>> 0;
    const rnd = ()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);

    let x = (rnd()*2-1)*0.1, y = (rnd()*2-1)*0.1;
    const a = 0.008;
    const b = 0.05;
    const m = -0.98;
    const f = (x:number)=> m*x + 2*(1-m)*x*x/(1+x*x);

    const cx = width*0.5, cy = height*0.5;
    const scale = Math.min(width,height)*0.42;

    const render = ()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)';
      ctx.fillRect(0,0,width,height);
      ctx.fillStyle='rgba(20,20,20,0.05)';
      for(let i=0;i<16000;i++){
        const xn = y + a*(1 - b*y*y)*y + f(x);
        const yn = -x + f(xn);
        x = xn; y = yn;
        const px = cx + x*scale;
        const py = cy + y*scale;
        if (px>=0&&px<width&&py>=0&&py<height) ctx.fillRect(px|0, py|0, 1, 1);
      }
      rafRef.current = requestAnimationFrame(render);
    };
    rafRef.current = requestAnimationFrame(render);
    return ()=>{ if(rafRef.current) cancelAnimationFrame(rafRef.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return (
    <div style={{ width:`${width}px`, height:`${height}px`, background:'#F0EEE6', overflow:'hidden' }}>
      <canvas ref={canvasRef} width={width} height={height} style={{width:'100%',height:'100%'}}/>
    </div>
  );
};

const metadata = {
  themes: 'gumowski-mira,map,chaos,ink',
  visualisation: 'Gumowski–Mira orbit bloom in grayscale',
  promptSuggestion: '1. Use f(x) nonlinearity\n2. Many steps\n3. Keep ink subtle'
};
(GumowskiMiraBloom as any).metadata = metadata;

export default GumowskiMiraBloom;

// Differs from others by: Gumowski–Mira map with characteristic f(x) term and its bloom-like orbit cloud


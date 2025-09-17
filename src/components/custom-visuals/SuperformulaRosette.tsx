// Themes: superformula, rosette, sacred geometry
// Visualisation: A rosette traced by the superformula, softly morphing
// Unique mechanism: Superformula radius with slow parameter morphing, stroke accumulation

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const SuperformulaRosette: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    const cx = width*0.5, cy = height*0.5; const R = Math.min(width,height)*0.36;
    const sf = (a:number, b:number, m:number, n1:number, n2:number, n3:number, phi:number)=>{
      const t1 = Math.pow(Math.abs(Math.cos(m*phi/4)/a), n2);
      const t2 = Math.pow(Math.abs(Math.sin(m*phi/4)/b), n3);
      return Math.pow(t1+t2, -1/n1);
    };
    const render = (tms:number)=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      const t=tms*0.001; const m=5; const a=1, b=1; const n1=0.3+0.2*Math.sin(t*0.2); const n2=0.6+0.2*Math.cos(t*0.15); const n3=0.6+0.2*Math.sin(t*0.17);
      ctx.strokeStyle='rgba(20,20,20,0.2)'; ctx.lineWidth=1;
      ctx.beginPath();
      for(let i=0;i<=720;i++){
        const phi = (i/720)*Math.PI*2;
        const r = sf(a,b,m,n1,n2,n3,phi);
        const x = cx + Math.cos(phi)*r*R;
        const y = cy + Math.sin(phi)*r*R;
        if (i===0) ctx.moveTo(x,y); else ctx.lineTo(x,y);
      }
      ctx.closePath(); ctx.stroke();
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
  themes: 'superformula,rosette,geometry,ink',
  visualisation: 'Morphing superformula rosette in thin ink',
  promptSuggestion: '1. Keep line thin\n2. Slow parameter morph\n3. Rosette symmetry'
};
(SuperformulaRosette as any).metadata = metadata;

export default SuperformulaRosette;

// Differs from others by: Superformula radial curve with slowly modulated n-parameters


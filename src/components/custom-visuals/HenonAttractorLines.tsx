// Themes: Henon, lines, accumulation
// Visualisation: Thin strokes accumulate along the Henon attractor support
// Unique mechanism: Draws short line segments per iteration to build continuous texture

import React, { useRef, useEffect } from 'react';
import { VisualProps } from '../../types';

const HenonAttractorLines: React.FC<VisualProps> = ({ width, height }) => {
  const ref = useRef<HTMLCanvasElement|null>(null);
  const raf = useRef<number|undefined>();
  useEffect(()=>{
    const canvas = ref.current; if(!canvas) return; const ctx = canvas.getContext('2d'); if(!ctx) return;
    canvas.width=width; canvas.height=height; ctx.fillStyle='#F0EEE6'; ctx.fillRect(0,0,width,height);

    let s=12344321>>>0; const rnd=()=> (s=(1664525*s+1013904223)>>>0, s/4294967296);
    const a=1.4,b=0.3; let x=(rnd()*2-1)*0.2, y=(rnd()*2-1)*0.2; const cx=width*0.5, cy=height*0.5; const scale=Math.min(width,height)*0.7;
    const render=()=>{
      ctx.fillStyle='rgba(240,238,230,0.05)'; ctx.fillRect(0,0,width,height);
      ctx.strokeStyle='rgba(20,20,20,0.2)'; ctx.lineWidth=1;
      for(let i=0;i<12000;i++){
        const xn=1-a*x*x + y; const yn=b*x; const px=cx+x*scale*0.5, py=cy+y*scale*0.9; const qx=cx+xn*scale*0.5, qy=cy+yn*scale*0.9;
        ctx.beginPath(); ctx.moveTo(px,py); ctx.lineTo(qx,qy); ctx.stroke(); x=xn; y=yn;
      }
      raf.current=requestAnimationFrame(render);
    };
    raf.current=requestAnimationFrame(render);
    return ()=>{ if(raf.current) cancelAnimationFrame(raf.current); ctx.clearRect(0,0,width,height); };
  },[width,height]);

  return <div style={{width:`${width}px`,height:`${height}px`, background:'#F0EEE6', overflow:'hidden'}}>
    <canvas ref={ref} width={width} height={height} style={{width:'100%',height:'100%'}}/>
  </div>;
};

const metadata = {
  themes: 'henon,lines,attractor,ink',
  visualisation: 'Henon lines accumulating into a texture',
  promptSuggestion: '1. Short segments\n2. Many steps\n3. Thin strokes'
};
(HenonAttractorLines as any).metadata = metadata;

export default HenonAttractorLines;

// Differs from others by: Line-segment rendering on a discrete map rather than points

